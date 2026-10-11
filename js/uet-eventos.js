/* Eventos de conversão do Microsoft Ads (UET, tag 187278315).
 *
 * Um único ouvinte de clique no documento inteiro, em vez de um por
 * botão: alguns botões nascem depois do carregamento.
 *
 *   diagnostico_click  botão marcado com data-uet-diagnostico
 *                      ("Ver quanto eu perco por mês")
 *
 * O whatsapp_click, o lead_callback e o lead_email saem do /js/leads.js,
 * que manda para o GA4 e para o UET só depois do consentimento.
 *
 * Antes de o bat.js chegar, window.uetq é só uma fila; o UET a lê
 * inteira quando sobe, então clique nenhum se perde. Sem consentimento,
 * o próprio UET decide o que pode guardar. */
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (el && el.hasAttribute('data-uet-diagnostico')) {
      window.uetq = window.uetq || [];
      window.uetq.push('event', 'diagnostico_click', {});
    }
  }, true);
})();
