/* Idioma das demos do portfólio (português e inglês).
 *
 * Carregado no <head> das demos bilíngues, antes de qualquer outro script:
 *   <script src="../../../js/idioma-demo.js" data-dicionario="js/en.js"></script>
 *
 * Em português não faz nada além de expor window.Idioma. Em inglês:
 *   1. baixa o dicionário da demo (js/en.js), que chama Idioma.dicionario({...});
 *   2. troca cada nó de texto e os atributos alt, aria-label, placeholder e
 *      title cujo texto (espaços normalizados) é chave do dicionário;
 *   3. elementos com data-en recebem o innerHTML inteiro de lá, para frase
 *      com <em> ou <b> no meio que não se traduz pedaço por pedaço;
 *      data-en-src troca a imagem;
 *   4. continua olhando a página: o que o JS desenhar depois também passa
 *      pelo dicionário.
 * Frase montada com número no meio não cabe em dicionário: o JS da demo
 * usa Idioma.t('pt', 'en'). Dados em JSON vêm de data/en/ (Idioma.dados).
 *
 * Escolha do idioma: ?lang=en|pt, depois a última escolha feita numa demo
 * (localStorage), depois ?de=us (quem vem da landing em inglês), depois o
 * idioma escolhido na home ou no portfólio (theatrum-lang), e por fim português.
 * Trocar recarrega a página no outro idioma: os sites montam muito texto
 * pelo JS, e recarregar é o único jeito de nada ficar pela metade.
 */
(function () {
  'use strict';

  var CHAVE = 'theatrum-demo-idioma';
  var este = document.currentScript;
  var busca = new URLSearchParams(location.search);
  var lang = busca.get('lang');
  if (lang !== 'en' && lang !== 'pt') {
    lang = null;
    try { lang = localStorage.getItem(CHAVE); } catch (e) {}
    if (lang !== 'en' && lang !== 'pt' && busca.get('de') === 'us') lang = 'en';
    /* sem escolha na demo, vale a do site principal (home e portfólio) */
    if (lang !== 'en' && lang !== 'pt') { try { lang = localStorage.getItem('theatrum-lang'); } catch (e) {} }
    if (lang !== 'en' && lang !== 'pt') lang = 'pt';
  }
  var EN = lang === 'en';
  var raiz = document.documentElement;
  raiz.lang = EN ? 'en' : 'pt-BR';
  raiz.setAttribute('data-idioma', lang);

  function trocar(novo) {
    try { localStorage.setItem(CHAVE, novo); } catch (e) {}
    var u = new URL(location.href);
    u.searchParams.set('lang', novo);
    location.replace(u.toString());
  }

  window.Idioma = {
    lang: lang,
    en: EN,
    t: function (pt, en) { return EN ? en : pt; },
    dados: function (url) { return EN ? url.replace(/(^|\/)data\//, '$1data/en/') : url; },
    dicionario: function () {},
    trocar: trocar
  };

  /* o botão de idioma pode estar em qualquer lugar da página */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-idioma-troca]');
    if (!b) return;
    e.preventDefault();
    trocar(EN ? 'pt' : 'en');
  });

  if (!EN) return;

  /* ---------- inglês ---------- */
  var dic = Object.create(null);
  var ATRS = ['alt', 'aria-label', 'placeholder', 'title'];
  var PULA = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function tem(k) { return Object.prototype.hasOwnProperty.call(dic, k); }

  /* esconde a página até traduzir, para não piscar português; nunca
     mais que 1,5 s, mesmo se o dicionário não chegar */
  var veu = document.createElement('style');
  veu.textContent = 'body{visibility:hidden!important}';
  document.head.appendChild(veu);
  function mostra() { if (veu.parentNode) veu.parentNode.removeChild(veu); }
  setTimeout(mostra, 1500);

  function texto(no) {
    var bruto = no.nodeValue, k = norm(bruto);
    if (!k || !tem(k)) return;
    var novo = bruto.match(/^\s*/)[0] + dic[k] + bruto.match(/\s*$/)[0];
    if (novo !== bruto) no.nodeValue = novo;
  }
  function elemento(el) {
    if (el.hasAttribute('data-en')) {
      var h = el.getAttribute('data-en');
      el.removeAttribute('data-en');
      el.innerHTML = h;
    }
    if (el.hasAttribute('data-en-src')) {
      el.setAttribute('src', el.getAttribute('data-en-src'));
      el.removeAttribute('data-en-src');
    }
    for (var i = 0; i < ATRS.length; i++) {
      var v = el.getAttribute(ATRS[i]);
      if (v && tem(norm(v)) && dic[norm(v)] !== v) el.setAttribute(ATRS[i], dic[norm(v)]);
    }
  }
  function percorre(no) {
    if (no.nodeType === 3) { if (!no.parentNode || !PULA[no.parentNode.nodeName]) texto(no); return; }
    if (no.nodeType !== 1 || PULA[no.nodeName]) return;
    elemento(no);
    var w = document.createTreeWalker(no, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.nodeType === 1 && PULA[n.nodeName] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) texto(n); else elemento(n); }
  }

  var pronto = false, html = false;
  function aplica() {
    if (!pronto || !html) return;
    if (tem(norm(document.title))) document.title = dic[norm(document.title)];
    percorre(document.body);
    mostra();
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') texto(m.target);
        else if (m.type === 'attributes') elemento(m.target);
        else m.addedNodes.forEach(percorre);
      });
    }).observe(document.body, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ATRS
    });
  }

  window.Idioma.dicionario = function (d) {
    Object.keys(d).forEach(function (k) { dic[norm(k)] = d[k]; });
    pronto = true;
    aplica();
  };

  var arq = este && este.getAttribute('data-dicionario');
  if (arq) {
    var s = document.createElement('script');
    s.src = arq;
    s.onerror = mostra;
    document.head.appendChild(s);
  } else {
    pronto = true;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { html = true; aplica(); });
  } else {
    html = true;
    aplica();
  }
})();
