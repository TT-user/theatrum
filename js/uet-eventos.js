/* Eventos de conversão do Microsoft Ads (UET, tag 187278315) e do GA4.
 *
 * Um único ouvinte de clique no documento inteiro, em vez de um por
 * botão: alguns botões nascem depois do carregamento.
 *
 *   diagnostico_click  botão marcado com data-uet-diagnostico
 *                      ("Ver quanto eu perco por mês", "Simular o retorno")
 *
 * Vai para o UET sempre e para o GA4 com a regra do evento() do
 * /js/leads.js: quem aceitou cookies, ou todo mundo nas páginas com o modo
 * de consentimento do Google no <head> (hoje só /site-que-vende/). Até
 * 03/11/2026 não ia para o GA4, e o evento nunca aparecia lá para virar
 * evento-chave.
 *
 * O whatsapp_click, o lead_callback e o lead_email saem do /js/leads.js.
 *
 * Antes de o bat.js chegar, window.uetq é só uma fila; o UET a lê
 * inteira quando sobe, então clique nenhum se perde. Sem consentimento,
 * o próprio UET decide o que pode guardar. O gtag() do <head> faz o
 * mesmo com o dataLayer. */
(function () {
  'use strict';

  function aceitou() { try { return localStorage.getItem('theatrum-cookies') === 'aceito'; } catch (e) { return false; } }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (el && el.hasAttribute('data-uet-diagnostico')) {
      window.uetq = window.uetq || [];
      window.uetq.push('event', 'diagnostico_click', {});
      if (typeof window.gtag === 'function' && (window.theatrumConsentimentoGoogle || aceitou())) {
        var s = el.closest('section[id],header[id],footer,nav');
        window.gtag('event', 'diagnostico_click', { origem: el.getAttribute('data-origem') || (s && (s.id || s.tagName.toLowerCase())) || 'link' });
      }
    }
  }, true);
})();
