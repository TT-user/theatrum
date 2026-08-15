/* ============================================================
   Camada de demonstração — Theatrum · lojas online
   Carregada nas páginas de /lojas/demos/.

   É irmã das camadas de /imoveis/demos/ e /moveis-planejados/demos/,
   com uma diferença que encolhe o arquivo: esta demo não tem nenhum
   link de contato real — nada de wa.me, tel: ou mailto: — então não
   há o que neutralizar. Sobra o essencial: marcar a página como
   demonstração e devolver a pessoa para o lugar de onde ela veio.

   O parâmetro ?de= é o sinal de origem, posto nos links da vitrine
   e da landing em inglês. ?limpo=1 esconde a barra (screenshots).
   ============================================================ */
(function () {
  'use strict';

  var BUSCA = new URLSearchParams(location.search);
  if (BUSCA.has('limpo')) return;

  /* Quem chega pela landing em inglês volta para ela, e não para a home
     em português: mandar um visitante dos EUA ou do Reino Unido para uma
     página que ele não lê é perder o clique que o anúncio pagou. */
  var origem = BUSCA.get('de');
  if (!origem && document.referrer) {
    try {
      var de = new URL(document.referrer);
      if (de.host === location.host && de.pathname.indexOf('/us/') === 0) origem = 'us';
    } catch (e) {}
  }

  var EN = origem === 'us';
  var VOLTA = EN
    ? { raiz: '../../../us/', cta: '../../../us/#pricing' }
    : { raiz: '../../../',    cta: '../../../#diagnostico' };
  var TXT = EN
    ? { voltar: '&larr; Back to Theatrum',
        aviso: '<b>Demonstration.</b> The brand, the products, the prices and the stock counters are ' +
               'invented. The layout, the cart and the checkout are real and were built by Theatrum.',
        quero: 'I want one' }
    : { voltar: '&larr; Voltar para a Theatrum',
        aviso: '<b>Demonstração.</b> Marca, produtos, preços e contadores de estoque são fictícios. ' +
               'O layout, o carrinho e o checkout são reais e foram feitos pela Theatrum.',
        quero: 'Quero uma assim' };

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

    /* a loja tem uma barra fixa de compra no celular; a folga evita que
       uma cubra a outra */
    var folga = document.createElement('style');
    folga.textContent = 'body{padding-bottom:64px!important}' +
      '.barra-mobile,.cta-fixo{bottom:60px!important}';
    document.head.appendChild(folga);
  }

  if (document.body) montar();
  else document.addEventListener('DOMContentLoaded', montar);
})();
