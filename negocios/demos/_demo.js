/* ============================================================
   Camada de demonstração — Theatrum · negócios locais
   Carregada nas páginas de /negocios/demos/.

   Irmã das camadas de /imoveis/, /moveis-planejados/, /lojas/ e
   /solar/. Marca a página como demonstração, devolve a pessoa
   para o lugar de onde ela veio e neutraliza links de contato.

   As quatro demos daqui nasceram de prévias feitas para clientes
   reais e foram refeitas com marca, fotos e dados fictícios. O
   aviso diz que endereço, telefone, números e depoimentos são
   inventados, para ninguém procurar a empresa.

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
        aviso: '<b>Demonstration.</b> The business, addresses, phone numbers, figures and reviews ' +
               'are invented. The layout and the tools are real and were built by Theatrum.',
        quero: 'I want one' }
    : { voltar: '&larr; Voltar para a Theatrum',
        aviso: '<b>Demonstração.</b> Empresa, endereços, telefones, números e depoimentos são ' +
               'fictícios. O layout e as ferramentas são reais e foram feitos pela Theatrum.',
        quero: 'Quero um assim' };

  /* ---------- camada de proteção ----------
     As páginas ficam em negocios/demos/<demo>/, o arquivo fica um
     nível acima da pasta demos/, como nas outras áreas. */
  var protecao = document.createElement('script');
  protecao.src = '../../_protecao.js';
  (document.head || document.documentElement).appendChild(protecao);

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
     negócio fictício. */
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
      (EN ? 'On a real site this button opens the business WhatsApp with the message already written.'
          : 'Num site real, este botão abre o WhatsApp da empresa com a mensagem já escrita.');
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
