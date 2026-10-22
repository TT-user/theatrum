/* ============================================================
   Camada de proteção — Theatrum
   Carregada na landing e, por meio do _demo.js, em todas as
   páginas das demonstrações.

   O QUE ELA FAZ
   Tira os caminhos fáceis de copiar o layout: seleção de texto,
   menu do botão direito, arrastar imagem, "ver código-fonte",
   "salvar página" e os atalhos de teclado do DevTools.

   O QUE ELA NÃO FAZ — e não tem como fazer
   Impedir a inspeção de verdade. Quem abrir o DevTools pelo menu
   do navegador, desligar o JavaScript ou puxar a página por curl
   continua vendo o HTML e o CSS inteiros. Nenhuma página web pode
   evitar isso: o navegador precisa do código para desenhar a tela.
   Isto aqui é atrito para o visitante curioso, não barreira contra
   quem realmente quer copiar.

   Configuração pelo próprio <script>:
     data-selecao="livre"  -> mantém o texto selecionável/copiável
                              (usado na landing, para o visitante
                              conseguir copiar telefone e e-mail).
     sem o atributo        -> bloqueia seleção e cópia (demos).
   ============================================================ */
(function () {
  'use strict';

  var eu = document.currentScript;
  var travaSelecao = !(eu && eu.getAttribute('data-selecao') === 'livre');

  /* ---------- campos de formulário ficam de fora de tudo ----------
     Sem esta guarda o visitante não consegue digitar, colar nem
     corrigir o que escreveu num formulário de contato. */
  function ehCampo(el) {
    if (!el || el.nodeType !== 1) return false;
    var t = el.tagName;
    return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' ||
           el.isContentEditable === true;
  }

  /* ---------- estilos ---------- */
  var regras = [
    /* arrastar imagem para a área de trabalho é a cópia mais fácil de todas */
    'img,picture,svg,video{-webkit-user-drag:none;user-drag:none;',
    '-webkit-touch-callout:none}'
  ];

  if (travaSelecao) {
    regras.push(
      'html{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;',
      'user-select:none;-webkit-touch-callout:none}',
      /* o que o visitante precisa preencher continua editável */
      'input,textarea,select,[contenteditable="true"]{-webkit-user-select:text;',
      '-moz-user-select:text;-ms-user-select:text;user-select:text}'
    );
  }

  var css = document.createElement('style');
  css.textContent = regras.join('');
  (document.head || document.documentElement).appendChild(css);

  /* ---------- botão direito ---------- */
  document.addEventListener('contextmenu', function (e) {
    if (ehCampo(e.target)) return;
    e.preventDefault();
  });

  /* ---------- arrastar ---------- */
  document.addEventListener('dragstart', function (e) {
    if (ehCampo(e.target)) return;
    e.preventDefault();
  });

  /* ---------- copiar / recortar ---------- */
  if (travaSelecao) {
    ['copy', 'cut'].forEach(function (evento) {
      document.addEventListener(evento, function (e) {
        if (ehCampo(e.target)) return;
        e.preventDefault();
      });
    });

    /* o CSS já impede a seleção; isto pega o arrastar que começa
       antes do CSS valer em navegadores mais antigos */
    document.addEventListener('selectstart', function (e) {
      if (ehCampo(e.target)) return;
      e.preventDefault();
    });
  }

  /* ---------- atalhos de teclado ----------
     e.code em vez de e.key: no macOS, Option+I devolve um caractere
     acentuado em e.key, e a comparação por letra falharia. */
  function letraDe(e) {
    var c = e.code || '';
    if (c.indexOf('Key') === 0) return c.slice(3).toLowerCase();
    return (e.key || '').toLowerCase();
  }

  function barra(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  window.addEventListener('keydown', function (e) {
    var tecla = e.key;
    var letra = letraDe(e);
    var cmd = e.ctrlKey || e.metaKey;
    var campo = ehCampo(e.target);

    /* DevTools */
    if (tecla === 'F12') return barra(e);
    if (cmd && e.shiftKey && (letra === 'i' || letra === 'j' || letra === 'c')) return barra(e);
    /* atalho do macOS: Cmd+Option+I / J / C */
    if (e.metaKey && e.altKey && (letra === 'i' || letra === 'j' || letra === 'c')) return barra(e);

    /* ver código-fonte e salvar página */
    if (cmd && !e.shiftKey && letra === 'u') return barra(e);
    if (cmd && !e.shiftKey && letra === 's' && !campo) return barra(e);

    /* selecionar tudo / copiar — só onde a seleção está travada */
    if (travaSelecao && cmd && !campo && (letra === 'a' || letra === 'c')) return barra(e);
  }, true);
})();
