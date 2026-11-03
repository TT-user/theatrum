/* Conversões do Google Ads e marca (G) no WhatsApp. Só na home e em
 * /site-que-vende/, desde 03/11/2026. Carregado antes do /js/leads.js:
 * os dois ouvem o clique no documento, na captura, e este precisa vir
 * primeiro para o modal do computador já receber o link com o (G).
 *
 *   origem Google  gclid, gbraid, wbraid e utm_source da URL ficam na aba
 *                  (sessionStorage 'theatrum-origem-google'). Veio do
 *                  Google = um dos três ids ou utm_source=google.
 *   (G)            quem veio do Google manda a mensagem do WhatsApp com
 *                  " (G)" no fim. O link é marcado na hora do toque, então
 *                  vale também para os que o JS reescreve (calculadora,
 *                  simulador, planos, barra do celular). Nunca duplica.
 *   conversão      todo clique em wa.me ou api.whatsapp.com dispara a
 *                  conversão "WhatsApp" (R$ 30). No computador conta o
 *                  clique que abre o modal; os links de dentro do modal não
 *                  contam de novo. Link que abre na mesma aba espera o
 *                  Google até 1 s antes de navegar (hoje todos abrem em aba
 *                  nova).
 *   raio-x         TheatrumConversao.raiox(), chamado pela página só depois
 *                  de o Web3Forms confirmar o envio: conversão "Raio-x por
 *                  escrito" (R$ 60), uma por visita.
 *
 * O consentimento fica com o modo de consentimento do Google no <head>
 * das duas páginas: sem o "Aceitar", o Google recebe a conversão sem
 * cookie de anúncio. gtag só é chamado se existir. */
(function () {
  'use strict';

  var ADS = 'AW-18362682320';
  var CONV_WHATSAPP = { send_to: ADS + '/vTbRCOuvx7EdENCXgbRE', value: 30.0, currency: 'BRL' };
  var CONV_RAIOX = { send_to: ADS + '/SRGmCOivx7EdENCXgbRE', value: 60.0, currency: 'BRL' };
  var CHAVE = 'theatrum-origem-google';
  var CONTOU_RAIOX = 'theatrum-conversao-raiox';
  var WA = /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i;
  var WA_OU_WEB = /^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i;

  function le(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function guarda(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function gtagOk() { return typeof window.gtag === 'function'; }

  /* ---------- de onde veio: a URL manda; sem nada nela, vale o que a aba guardou ---------- */
  var origem = {};
  try {
    var p = new URLSearchParams(location.search), achou = false;
    ['gclid', 'gbraid', 'wbraid', 'utm_source'].forEach(function (k) {
      var v = p.get(k);
      if (v) { origem[k] = v; achou = true; }
    });
    if (achou) guarda(CHAVE, JSON.stringify(origem));
    else origem = JSON.parse(le(CHAVE) || '{}') || {};
  } catch (e) { origem = {}; }
  var doGoogle = !!(origem.gclid || origem.gbraid || origem.wbraid || /^google$/i.test(origem.utm_source || ''));

  /* ---------- (G) no fim do text= ---------- */
  function marca(a) {
    if (!doGoogle) return;
    var href = a.getAttribute('href') || '';
    if (!WA_OU_WEB.test(href)) return;
    try {
      var m = href.match(/([?&]text=)([^&#]*)/);
      if (m) {
        var t = decodeURIComponent(m[2].replace(/\+/g, ' '));
        if (/\(G\)\s*$/.test(t)) return;
        href = href.replace(m[0], function () { return m[1] + encodeURIComponent(t.replace(/\s+$/, '') + ' (G)'); });
      } else {
        href += (href.indexOf('?') < 0 ? '?' : '&') + 'text=' + encodeURIComponent('(G)');
      }
      a.setAttribute('href', href);
    } catch (e) {}
  }

  /* ---------- conversão do WhatsApp ---------- */
  function converte(e, a) {
    if (!gtagOk()) return;
    var simples = e.type === 'click' && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
    var mesmaAba = simples && (a.getAttribute('target') || '_self') === '_self';
    /* no computador o leads.js abre o modal e a página fica: nada a esperar */
    var modal = !a.hasAttribute('data-wa-direto') && window.TheatrumLeads && window.TheatrumLeads.computador && window.TheatrumLeads.computador();
    if (!mesmaAba || modal) { window.gtag('event', 'conversion', CONV_WHATSAPP); return; }
    e.preventDefault();
    var destino = a.href, foi = false;
    var vai = function () { if (foi) return; foi = true; location.href = destino; };
    window.gtag('event', 'conversion', { send_to: CONV_WHATSAPP.send_to, value: CONV_WHATSAPP.value, currency: CONV_WHATSAPP.currency, event_callback: vai });
    setTimeout(vai, 1000);
  }

  function linkDe(e) { return e.target && e.target.closest ? e.target.closest('a[href]') : null; }

  /* marca já no toque: cobre o "abrir em nova aba" e o "copiar link" do menu */
  document.addEventListener('pointerdown', function (e) { var a = linkDe(e); if (a) marca(a); }, true);

  function clique(e) {
    var a = linkDe(e);
    if (!a) return;
    marca(a);
    if (!WA.test(a.getAttribute('href') || '')) return;
    if (a.closest('.tl-caixa')) return;   /* dentro do modal do computador: o clique que abriu já contou */
    converte(e, a);
  }
  document.addEventListener('click', clique, true);
  document.addEventListener('auxclick', function (e) { if (e.button === 1) clique(e); }, true);

  /* ---------- conversão do raio-x por escrito: só depois do envio confirmado ---------- */
  window.TheatrumConversao = {
    google: doGoogle,
    raiox: function () {
      if (le(CONTOU_RAIOX) === 'enviado') return;
      guarda(CONTOU_RAIOX, 'enviado');
      if (gtagOk()) window.gtag('event', 'conversion', CONV_RAIOX);
    }
  };
})();
