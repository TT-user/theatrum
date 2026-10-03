/* Eventos de conversão do Microsoft Ads (UET, tag 187278315).
 *
 * Um único ouvinte de clique no documento inteiro, em vez de um por
 * botão: os links de WhatsApp mudam de endereço (troca de idioma, valor
 * da calculadora) e alguns nascem depois do carregamento (pop-up de
 * saída, card do raio-x). Ouvindo no documento, todos entram.
 *
 *   whatsapp_click     link para wa.me ou api.whatsapp.com, ou botão
 *                      marcado com data-whatsapp (abre o WhatsApp por
 *                      script, como o envio do pop-up de saída)
 *   diagnostico_click  botão marcado com data-uet-diagnostico
 *                      ("Ver quanto eu perco por mês")
 *
 * Antes de o bat.js chegar, window.uetq é só uma fila; o UET a lê
 * inteira quando sobe, então clique nenhum se perde. Sem consentimento,
 * o próprio UET decide o que pode guardar. */
(function () {
  'use strict';

  function envia(evento) {
    window.uetq = window.uetq || [];
    window.uetq.push('event', evento, {});
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;

    var href = el.getAttribute('href') || '';
    if (/(^|\/\/|\.)wa\.me\/|api\.whatsapp\.com/i.test(href) || el.hasAttribute('data-whatsapp')) {
      envia('whatsapp_click');
    }
    if (el.hasAttribute('data-uet-diagnostico')) {
      envia('diagnostico_click');
    }
  }, true);
})();
