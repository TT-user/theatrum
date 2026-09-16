/* ============================================================
   Camada de demonstração — Theatrum · energia solar
   Carregada nas páginas de /solar/demos/.

   Irmã das camadas de /imoveis/, /moveis-planejados/ e /lojas/.
   Faz duas coisas: marca a página como demonstração e devolve a
   pessoa para o lugar de onde ela veio.

   Aqui o aviso precisa dizer uma coisa a mais que nas outras. A
   página tem uma calculadora que devolve valor de investimento e
   prazo de retorno, e número desse tipo, numa marca fictícia, não
   pode ser lido como orçamento. O texto diz isso.

   O parâmetro ?de= é o sinal de origem, posto nos links da vitrine.
   ?limpo=1 esconde a barra (screenshots).
   ============================================================ */
(function () {
  'use strict';

  var BUSCA = new URLSearchParams(location.search);
  if (BUSCA.has('limpo')) return;

  var origem = BUSCA.get('de');
  if (!origem && document.referrer) {
    try {
      var de = new URL(document.referrer);
      if (de.host === location.host) {
        if (de.pathname.indexOf('/us/') === 0) origem = 'us';
        else if (de.pathname.indexOf('/portfolio/') === 0) origem = 'portfolio';
      }
    } catch (e) {}
  }

  var EN = origem === 'us';
  var VOLTA = EN
    ? { raiz: '../../../us/', cta: '../../../us/#pricing' }
    : origem === 'portfolio'
    ? { raiz: '../../../portfolio/', cta: '../../../#diagnostico' }
    : { raiz: '../../../', cta: '../../../#diagnostico' };

  var TXT = EN
    ? { voltar: '&larr; Back to Theatrum',
        aviso: '<b>Demonstration.</b> The brand, the plans and the prices are invented, and the ' +
               'payback figures are an illustration, not a quote. The layout and the calculator ' +
               'are real and were built by Theatrum.',
        quero: 'I want one' }
    : { voltar: '&larr; Voltar para a Theatrum',
        aviso: '<b>Demonstração.</b> Marca, planos e preços são fictícios, e os números de retorno ' +
               'são ilustração, não orçamento. O layout e a calculadora são reais e foram feitos ' +
               'pela Theatrum.',
        quero: 'Quero um assim' };

  var css = document.createElement('style');
  css.textContent = [
    '.thtr-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;',
    'display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;',
    'padding:10px 16px;background:#0B0A08;border-top:1px solid #26241C;',
    'font:600 13px/1.4 Inter,system-ui,-apple-system,sans-serif;color:#9A968A;text-align:center}',
    '.thtr-bar b{color:#F0EEE8;font-weight:700}',
    '.thtr-bar a{text-decoration:none;font-weight:700;border-radius:999px;',
    'padding:7px 16px;white-space:nowrap;transition:background .2s ease,border-color .2s ease}',
    '.thtr-bar .voltar{background:#D9A441;color:#150F03;border:1px solid #D9A441}',
    '.thtr-bar .voltar:hover{background:#EFC474;border-color:#EFC474}',
    '.thtr-bar .quero{color:#D9A441;border:1px solid rgba(217,164,65,.45)}',
    '.thtr-bar .quero:hover{background:rgba(217,164,65,.12)}',
    '@media(max-width:640px){.thtr-bar{gap:8px;padding:9px 12px}',
    '.thtr-bar span{display:none}.thtr-bar a{font-size:12px;padding:8px 14px}}'
  ].join('');
  document.head.appendChild(css);

  function montar() {
    var bar = document.createElement('div');
    bar.className = 'thtr-bar';
    bar.innerHTML = '<a class="voltar" href="' + VOLTA.raiz + '">' + TXT.voltar + '</a>' +
                    '<span>' + TXT.aviso + '</span>' +
                    '<a class="quero" href="' + VOLTA.cta + '">' + TXT.quero + '</a>';
    document.body.appendChild(bar);

    var folga = document.createElement('style');
    folga.textContent = 'body{padding-bottom:64px!important}' +
      '.cs-fixo,.wa-float{bottom:72px!important}';
    document.head.appendChild(folga);
  }

  /* ---------- neutraliza contato ----------
     Ninguém pode ser levado a um WhatsApp real a partir de um
     orçamento fictício. */
  var CONTATO = /^(tel:|mailto:|sms:|https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com))/i;

  function neutralizar(a) {
    if (a.dataset.thtrDemo === '1') return;
    var href = a.getAttribute('href') || '';
    if (href !== '#demo-cta' && !CONTATO.test(href)) return;
    a.dataset.thtrDemo = '1';
    if (href !== '#demo-cta') a.setAttribute('href', '#demo-cta');
    a.removeAttribute('target');
  }

  function ligar() {
    montar();
    document.querySelectorAll('a[href]').forEach(neutralizar);

    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'attributes' && m.target.tagName === 'A') neutralizar(m.target);
        m.addedNodes && m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) {
            if (n.tagName === 'A') neutralizar(n);
            n.querySelectorAll && n.querySelectorAll('a[href]').forEach(neutralizar);
          }
        });
      });
    }).observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['href']
    });

    var toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.style.cssText =
      'position:fixed;left:50%;bottom:78px;transform:translate(-50%,14px);z-index:2147483001;' +
      'max-width:min(420px,calc(100vw - 32px));background:#15140F;border:1px solid #26241C;' +
      'border-radius:14px;padding:16px 20px;font:500 14px/1.5 Inter,system-ui,sans-serif;' +
      'color:#C4C0B6;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6);opacity:0;' +
      'pointer-events:none;transition:opacity .22s ease,transform .22s ease';
    toast.innerHTML = '<b style="display:block;color:#D9A441;font-size:12px;letter-spacing:.16em;' +
      'text-transform:uppercase;margin-bottom:6px">' + (EN ? 'Demonstration' : 'Demonstração') + '</b>' +
      (EN ? 'On a real site this button opens the installer WhatsApp with the sizing already written.'
          : 'Num site real, este botão abre o WhatsApp do instalador com o dimensionamento já escrito.');
    document.body.appendChild(toast);

    var t;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (a.dataset.thtrDemo === '1' || a.getAttribute('href') === '#demo-cta') {
        e.preventDefault();
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%,0)';
        clearTimeout(t);
        t = setTimeout(function () {
          toast.style.opacity = '0';
          toast.style.transform = 'translate(-50%,14px)';
        }, 3400);
      }
    }, true);
  }

  if (document.body) ligar();
  else document.addEventListener('DOMContentLoaded', ligar);
})();
