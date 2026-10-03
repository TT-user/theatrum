/* Aviso de cookies (LGPD) para o Microsoft Ads (UET).
 *
 * O 'consent default' (ad_storage negado) e o 'update' de quem já aceitou
 * numa visita anterior ficam no <head> de cada página, antes do UET: o
 * consentimento precisa estar na fila antes de qualquer coisa. Este
 * arquivo só desenha o aviso para quem ainda não escolheu e grava a
 * escolha.
 *
 * Escolha em localStorage, chave 'theatrum-cookies': 'aceito' ou
 * 'recusado'. Quem já escolheu não vê o aviso de novo.
 *
 * Componente com estado: os textos moram aqui, não em data-en, e ele se
 * redesenha quando o idioma da página muda (botão PT/EN da home). */
(function () {
  'use strict';
  var CHAVE = 'theatrum-cookies';

  var escolha = null;
  try { escolha = localStorage.getItem(CHAVE); } catch (e) {}
  if (escolha === 'aceito' || escolha === 'recusado') return;
  if (new URLSearchParams(location.search).get('still')) return;   /* modo QA da home */

  var TXT = {
    pt: { t: 'Usamos cookies para medir visitas e o resultado dos anúncios. Os de anúncio da Microsoft só entram se você aceitar.',
          mais: 'Saiba mais', sim: 'Aceitar', nao: 'Recusar', rot: 'Aviso de cookies', link: '/privacidade/' },
    en: { t: 'We use cookies to measure visits and how our ads perform. Microsoft ad cookies only run if you accept.',
          mais: 'Learn more', sim: 'Accept', nao: 'Decline', rot: 'Cookie notice', link: '/privacidade/#en' }
  };
  var idioma = function () { return /^en/i.test(document.documentElement.lang) ? 'en' : 'pt'; };

  var css =
    '.ck{position:fixed;left:16px;bottom:16px;z-index:1050;width:min(440px,calc(100vw - 32px));' +
      'display:grid;gap:14px;padding:18px 18px 16px;border-radius:16px;background:#1A1815;color:#F6F1E7;' +
      'border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 50px rgba(0,0,0,.5);' +
      'font:400 14px/1.55 Inter,system-ui,sans-serif;opacity:0;transform:translateY(12px);' +
      'transition:opacity .3s ease,transform .3s ease}' +
    '.ck.is-on{opacity:1;transform:none}' +
    '.ck p{margin:0;color:#D8CFC0}' +
    '.ck a{color:#E3B341;font-weight:600;text-underline-offset:3px}' +
    '.ck-bts{display:flex;gap:8px}' +
    '.ck button{flex:1;min-height:42px;border-radius:99px;cursor:pointer;font:700 14px/1 Inter,system-ui,sans-serif}' +
    '.ck .ck-sim{background:#E3B341;border:0;color:#141210}' +
    '.ck .ck-sim:hover{background:#F0D488}' +
    '.ck .ck-nao{background:transparent;border:1px solid rgba(255,255,255,.22);color:#F6F1E7}' +
    '.ck .ck-nao:hover{border-color:rgba(255,255,255,.45)}' +
    '.ck button:focus-visible,.ck a:focus-visible{outline:2px solid #E3B341;outline-offset:2px}' +
    '@media(max-width:560px){.ck{left:10px;right:10px;width:auto;bottom:calc(10px + env(safe-area-inset-bottom))}}' +
    '@media(prefers-reduced-motion:reduce){.ck{transition:none}}';

  function monta() {
    var estilo = document.createElement('style');
    estilo.textContent = css;
    document.head.appendChild(estilo);

    var caixa = document.createElement('div');
    caixa.className = 'ck';
    caixa.setAttribute('role', 'region');

    function pinta() {
      var T = TXT[idioma()];
      caixa.setAttribute('aria-label', T.rot);
      caixa.innerHTML =
        '<p>' + T.t + ' <a href="' + T.link + '">' + T.mais + '</a></p>' +
        '<div class="ck-bts"><button type="button" class="ck-nao">' + T.nao + '</button>' +
        '<button type="button" class="ck-sim">' + T.sim + '</button></div>';
      caixa.querySelector('.ck-sim').addEventListener('click', function () { decide('aceito'); });
      caixa.querySelector('.ck-nao').addEventListener('click', function () { decide('recusado'); });
    }

    var vigia = new MutationObserver(pinta);
    function decide(valor) {
      try { localStorage.setItem(CHAVE, valor); } catch (e) {}
      if (valor === 'aceito') {
        window.uetq = window.uetq || [];
        window.uetq.push('consent', 'update', { 'ad_storage': 'granted' });
      }
      vigia.disconnect();
      caixa.classList.remove('is-on');
      setTimeout(function () { caixa.remove(); estilo.remove(); }, 320);
    }

    pinta();
    document.body.appendChild(caixa);
    vigia.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    requestAnimationFrame(function () { requestAnimationFrame(function () { caixa.classList.add('is-on'); }); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta);
  else monta();
})();
