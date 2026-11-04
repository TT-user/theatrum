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
 *   WhatsApp       conversão "WhatsApp" (R$ 30) em todo clique que abre o
 *                  WhatsApp (wa.me, api.whatsapp.com e, no modal, o
 *                  WhatsApp Web). No computador, o clique que só abre o
 *                  modal não conta: lá dentro a pessoa ainda escolhe entre
 *                  o WhatsApp e o formulário, e cada modal conta uma
 *                  conversão só, a do que ela fez primeiro. Quem escaneia o
 *                  QR não deixa rastro (o (G) na conversa é a contagem).
 *                  Link que abre na mesma aba espera o Google até 1 s antes
 *                  de navegar (hoje todos abrem em aba nova).
 *   formulário     TheatrumConversao.formulario(form), chamado logo depois
 *                  de o Web3Forms confirmar o envio, antes de qualquer outra
 *                  coisa: conversão "Raio-x por escrito" (R$ 60), uma por
 *                  visita. Vale para o raio-x por escrito da página e para
 *                  os formulários do leads.js (diagnóstico por e-mail, "me
 *                  chamem" e pop-up de saída). Nenhum deles abre o WhatsApp
 *                  sozinho depois do envio.
 *
 * O consentimento fica com o modo de consentimento do Google no <head>
 * das duas páginas: sem o "Aceitar", o Google recebe a conversão sem
 * cookie de anúncio. gtag só é chamado se existir. */
(function () {
  'use strict';

  var ADS = 'AW-18362682320';
  var CONV_WHATSAPP = { send_to: ADS + '/vTbRCOuvx7EdENCXgbRE', value: 30.0, currency: 'BRL' };
  var CONV_FORM = { send_to: ADS + '/SRGmCOivx7EdENCXgbRE', value: 60.0, currency: 'BRL' };
  var CHAVE = 'theatrum-origem-google';
  var CONTOU_FORM = 'theatrum-conversao-raiox';
  var MODAL = '.tl-caixa';                 /* a caixa do leads.js (modal do WhatsApp e pop-up de saída) */
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

  /* ---------- um modal, uma conversão: a do que a pessoa fez primeiro ---------- */
  function jaContou(caixa) { return !!(caixa && caixa.getAttribute('data-conversao')); }
  function contou(caixa, qual) { if (caixa) caixa.setAttribute('data-conversao', qual); }

  /* ---------- conversão do WhatsApp ---------- */
  function converte(e, a) {
    if (!gtagOk()) return;
    var simples = e.type === 'click' && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
    var caixa = a.closest(MODAL);
    if (caixa) {
      if (jaContou(caixa)) return;
      contou(caixa, 'whatsapp');
      window.gtag('event', 'conversion', CONV_WHATSAPP);
      return;
    }
    /* no computador o leads.js troca este clique pelo modal: conta o que a pessoa fizer lá dentro */
    if (simples && !a.hasAttribute('data-wa-direto') && window.TheatrumLeads && window.TheatrumLeads.computador && window.TheatrumLeads.computador()) return;
    if (!simples || (a.getAttribute('target') || '_self') !== '_self') { window.gtag('event', 'conversion', CONV_WHATSAPP); return; }
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
    if (WA_OU_WEB.test(a.getAttribute('href') || '')) converte(e, a);
  }
  document.addEventListener('click', clique, true);
  document.addEventListener('auxclick', function (e) { if (e.button === 1) clique(e); }, true);

  /* ---------- conversão do formulário: logo depois do envio confirmado ---------- */
  function formulario(form) {
    var caixa = form && form.closest ? form.closest(MODAL) : null;
    if (jaContou(caixa)) return;                       /* esse modal já contou o WhatsApp */
    contou(caixa, 'formulario');
    if (le(CONTOU_FORM) === 'enviado') return;         /* uma por visita */
    guarda(CONTOU_FORM, 'enviado');
    if (gtagOk()) window.gtag('event', 'conversion', CONV_FORM);
  }

  window.TheatrumConversao = { google: doGoogle, formulario: formulario };
})();
