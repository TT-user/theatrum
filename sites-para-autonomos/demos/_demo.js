/* ============================================================
   Camada de demonstração — Theatrum
   Carregada em todos os sites de exemplo em /demos/.
   Faz duas coisas:
   1. Neutraliza qualquer link de contato (WhatsApp, telefone,
      e-mail, agendamento) para que ninguém seja levado a um
      contato real a partir de um site fictício.
   2. Marca a página como demonstração, com volta para a
      página de planos.
   O parâmetro ?limpo=1 esconde a barra (usado nos screenshots).
   ============================================================ */
(function () {
  'use strict';

  var LIMPO = new URLSearchParams(location.search).has('limpo');

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
    /* voltar é o principal: sai destacado à esquerda */
    '.thtr-bar .voltar{background:#D9A441;color:#150F03;border:1px solid #D9A441}',
    '.thtr-bar .voltar:hover{background:#EFC474;border-color:#EFC474}',
    '.thtr-bar .quero{color:#D9A441;border:1px solid rgba(217,164,65,.45)}',
    '.thtr-bar .quero:hover{background:rgba(217,164,65,.12)}',
    /* no celular a barra vira duas linhas e o texto longo sai de cena */
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

  /* ---------- modo embutido/print ----------
     Sem barra e sem aviso de cookie. Também derruba os mapas do Google:
     dentro de um card eles não servem para nada e são, de longe, o que
     mais pesa no carregamento destes demos. */
  if (LIMPO) {
    try {
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.setItem('pratocurioso-cookies-aceitos', '1');
    } catch (e) {}
    var semCookie = document.createElement('style');
    semCookie.textContent =
      '#cookie-banner,.cookie-banner,.lgpd{display:none!important}' +
      /* arrastar dentro do card rola, não seleciona texto */
      'body{-webkit-user-select:none;-moz-user-select:none;user-select:none}' +
      /* prévia: nada aqui dentro responde a clique. A rolagem continua
         nativa, porque rolar não depende de pointer-events. Para navegar
         de verdade a pessoa abre a demonstração pelo botão do card. */
      'a,button,summary,details,input,select,textarea,label,[role="button"],' +
      '.faq-pergunta,.faq-question,.lang-btn,.menu-toggle,iframe' +
      '{pointer-events:none!important}';
    document.head.appendChild(semCookie);

    var tiraMapa = function () {
      document.querySelectorAll('iframe[src*="google.com/maps"]').forEach(function (f) {
        var vazio = document.createElement('div');
        vazio.style.cssText =
          'height:' + (f.getAttribute('height') || 320) + 'px;border-radius:12px;' +
          'background:#1a1a18;display:flex;align-items:center;justify-content:center;' +
          'color:#8a8578;font:600 13px/1.4 system-ui,sans-serif;text-align:center;padding:16px';
        vazio.textContent = 'Mapa do consultório (desativado nesta demonstração)';
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
    /* relativo de propósito: o site é servido numa subpasta do domínio,
       então '../../' aponta para a página de conversão seja qual for o nome dela */
    bar.innerHTML = '<a class="voltar" href="../../">&larr; Voltar para a Theatrum</a>' +
                    '<span><b>Demonstração.</b> Pessoa, marca e contatos são fictícios. ' +
                    'O layout é real e foi feito pela Theatrum.</span>' +
                    '<a class="quero" href="../../#planos">Quero um assim</a>';
    document.body.appendChild(bar);

    /* garante que a barra não cubra o rodapé nem botões flutuantes */
    var folga = document.createElement('style');
    folga.textContent = 'body{padding-bottom:64px!important}' +
      '.whatsapp-float,.wa-float{bottom:80px!important}';
    document.head.appendChild(folga);
  }

  /* ---------- aviso ao clicar num CTA ---------- */
  var toast = document.createElement('div');
  toast.className = 'thtr-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<b>Demonstração</b>Num site real, este botão abre o WhatsApp ' +
                    'do profissional com a mensagem já escrita.';
  document.body.appendChild(toast);

  var timer;
  function avisar() {
    toast.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('on'); }, 3200);
  }

  /* ---------- neutraliza os links de contato ---------- */
  var CONTATO = /^(tel:|mailto:|sms:|https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|signup\.faynutrition\.com|visit\.berrystreet\.co))/i;

  /* Só mexe no link uma vez. Sem estas duas guardas o setAttribute abaixo
     dispara o MutationObserver, que chama esta função de novo, que chama o
     setAttribute de novo: laço infinito. Com o seletor de idioma, que
     reescreve o innerHTML de dezenas de elementos de uma vez, o laço trava
     a aba. */
  function neutralizar(a) {
    if (a.dataset.thtrDemo === '1') return;
    var href = a.getAttribute('href') || '';
    if (href !== '#demo-cta' && !CONTATO.test(href)) return;
    a.dataset.thtrDemo = '1';
    if (href !== '#demo-cta') a.setAttribute('href', '#demo-cta');
    a.removeAttribute('target');
  }

  document.querySelectorAll('a[href]').forEach(neutralizar);

  /* alguns demos reescrevem os hrefs depois (toggle de idioma, data-wa) */
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
