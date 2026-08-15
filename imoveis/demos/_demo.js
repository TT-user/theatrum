/* ============================================================
   Camada de demonstração — Theatrum · mercado imobiliário
   Carregada em todos os sites de exemplo em /imoveis/demos/.

   É irmã da camada de /moveis-planejados/demos/_demo.js e faz o
   mesmo trabalho, com uma diferença que justifica o arquivo
   separado: estes demos nascem na home, não numa página de
   segmento. Quem chega sem nenhum sinal de origem volta para a
   raiz, e não para uma landing de nicho.

   1. Neutraliza qualquer link de contato (WhatsApp, telefone,
      e-mail, agendamento) para que ninguém seja levado a um
      contato real a partir de um site fictício.
   2. Marca a página como demonstração, com volta para o lugar
      de onde a pessoa veio.
   O parâmetro ?limpo=1 esconde a barra (usado nos screenshots).
   ============================================================ */
(function () {
  'use strict';

  var BUSCA = new URLSearchParams(location.search);
  var LIMPO = BUSCA.has('limpo');

  /* ---------- de onde a pessoa veio ----------
     ?de= é o sinal confiável, posto nos links da vitrine. O referrer
     é o plano B, para link compartilhado ou colado à mão. Sem nenhum
     dos dois, volta para a raiz: é de lá que estes demos são abertos. */
  var origem = BUSCA.get('de');
  if (!origem && document.referrer) {
    try {
      var de = new URL(document.referrer);
      if (de.host === location.host && de.pathname.indexOf('/moveis-planejados/') === 0) {
        origem = 'planejados';
      }
    } catch (e) {}
  }
  /* Quem chega pela landing em inglês volta para ela, e não para a home
     em português: mandar um visitante dos EUA ou do Reino Unido para uma
     página que ele não lê é perder o clique que o anúncio pagou. */
  var VOLTA = origem === 'planejados'
    ? { raiz: '../../../moveis-planejados/', cta: '../../../moveis-planejados/#planos' }
    : origem === 'us'
    ? { raiz: '../../../us/',                cta: '../../../us/#pricing' }
    : { raiz: '../../../',                   cta: '../../../#diagnostico' };

  var EN = origem === 'us';
  var TXT = EN
    ? { voltar: '&larr; Back to Theatrum',
        aviso: '<b>Demonstration.</b> The brand, the listings, the prices and the contacts are invented. ' +
               'The layout and the system are real and were built by Theatrum.',
        quero: 'I want one',
        toastTitulo: 'Demonstration',
        toastTexto: 'On a real site this button opens WhatsApp with the message already written — ' +
                    'including the listing code.' }
    : { voltar: '&larr; Voltar para a Theatrum',
        aviso: '<b>Demonstração.</b> Marca, imóveis, preços e contatos são fictícios. ' +
               'O layout e o sistema são reais e foram feitos pela Theatrum.',
        quero: 'Quero um assim',
        toastTitulo: 'Demonstração',
        toastTexto: 'Num site real, este botão abre o WhatsApp do corretor com a mensagem já escrita ' +
                    '— inclusive o código do imóvel.' };

  /* ---------- camada de proteção ----------
     As páginas ficam em imoveis/demos/<demo>/, o arquivo fica um
     nível acima da pasta demos/. */
  var protecao = document.createElement('script');
  protecao.src = '../../_protecao.js';
  (document.head || document.documentElement).appendChild(protecao);

  /* ---------- estilos ---------- */
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
    '.thtr-bar span{display:none}.thtr-bar a{font-size:12px;padding:8px 14px}}',
    '.thtr-toast{position:fixed;left:50%;bottom:76px;transform:translate(-50%,14px);',
    'z-index:2147483001;max-width:min(420px,calc(100vw - 32px));',
    'background:#15140F;border:1px solid #26241C;border-radius:14px;padding:16px 20px;',
    'font:500 14px/1.5 Inter,system-ui,-apple-system,sans-serif;color:#C4C0B6;text-align:center;',
    'box-shadow:0 24px 60px rgba(0,0,0,.6);opacity:0;pointer-events:none;',
    'transition:opacity .22s ease,transform .22s ease}',
    '.thtr-toast.on{opacity:1;transform:translate(-50%,0)}',
    '.thtr-toast b{display:block;color:#D9A441;font-size:12px;letter-spacing:.16em;',
    'text-transform:uppercase;margin-bottom:6px}',
    '@media(prefers-reduced-motion:reduce){.thtr-toast{transition:none}}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- modo embutido/print ---------- */
  if (LIMPO) {
    var semCookie = document.createElement('style');
    semCookie.textContent =
      '#cookie-banner,.cookie-banner,.lgpd{display:none!important}' +
      'body{-webkit-user-select:none;-moz-user-select:none;user-select:none}' +
      /* prévia: nada aqui dentro responde a clique. A rolagem continua
         nativa, porque rolar não depende de pointer-events. */
      'a,button,summary,details,input,select,textarea,label,[role="button"],' +
      '.faq-pergunta,.faq-question,iframe{pointer-events:none!important}';
    document.head.appendChild(semCookie);

    var tiraMapa = function () {
      document.querySelectorAll('iframe[src*="google.com/maps"]').forEach(function (f) {
        var vazio = document.createElement('div');
        vazio.style.cssText =
          'height:' + (f.getAttribute('height') || 320) + 'px;border-radius:12px;' +
          'background:#1a1a18;display:flex;align-items:center;justify-content:center;' +
          'color:#8a8578;font:600 13px/1.4 system-ui,sans-serif;text-align:center;padding:16px';
        vazio.textContent = 'Mapa (desativado nesta prévia)';
        f.parentNode.replaceChild(vazio, f);
      });
    };
    tiraMapa();
    document.addEventListener('DOMContentLoaded', tiraMapa);
  }

  /* ---------- barra de demonstração ---------- */
  if (!LIMPO) {
    var bar = document.createElement('div');
    bar.className = 'thtr-bar';
    bar.innerHTML = '<a class="voltar" href="' + VOLTA.raiz + '">' + TXT.voltar + '</a>' +
                    '<span>' + TXT.aviso + '</span>' +
                    '<a class="quero" href="' + VOLTA.cta + '">' + TXT.quero + '</a>';
    document.body.appendChild(bar);

    var folga = document.createElement('style');
    folga.textContent = 'body{padding-bottom:64px!important}' +
      '.whatsapp-float,.wa-float{bottom:80px!important}';
    document.head.appendChild(folga);
  }

  /* ---------- aviso ao clicar num CTA ---------- */
  var toast = document.createElement('div');
  toast.className = 'thtr-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<b>' + TXT.toastTitulo + '</b>' + TXT.toastTexto;
  document.body.appendChild(toast);

  var timer;
  function avisar() {
    toast.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('on'); }, 3400);
  }

  /* ---------- neutraliza os links de contato ---------- */
  var CONTATO = /^(tel:|mailto:|sms:|https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com))/i;

  /* Só mexe no link uma vez. Sem estas guardas o setAttribute dispara o
     MutationObserver, que chama esta função de novo: laço infinito. Os
     sistemas destes demos reescrevem hrefs a cada filtro aplicado, então
     a proteção aqui é obrigatória, não teórica. */
  function neutralizar(a) {
    if (a.dataset.thtrDemo === '1') return;
    var href = a.getAttribute('href') || '';
    if (href !== '#demo-cta' && !CONTATO.test(href)) return;
    a.dataset.thtrDemo = '1';
    if (href !== '#demo-cta') a.setAttribute('href', '#demo-cta');
    a.removeAttribute('target');
  }

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

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.dataset.thtrDemo === '1' || a.getAttribute('href') === '#demo-cta') {
      e.preventDefault();
      avisar();
    }
  }, true);
})();
