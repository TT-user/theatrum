/* Moedas secretas: 8 moedinhas espalhadas pela página. Quem clica descobre o jogo;
   quem junta todas ganha o cupom do config.js. O progresso fica neste navegador. */
(function () {
  'use strict';
  var NC = window.NC;
  var CHAVE = 'nc-moedas-secretas';
  var moedas = Array.prototype.slice.call(document.querySelectorAll('[data-moeda]'));
  if (!moedas.length) return;
  var total = moedas.length;
  var pegas = [];
  try { pegas = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) {}
  if (!Array.isArray(pegas)) pegas = [];

  moedas.forEach(function (m) { if (pegas.indexOf(m.getAttribute('data-moeda')) >= 0) m.hidden = true; });

  var aviso = document.getElementById('moeda-aviso');
  var tAviso;
  function avisa(txt) {
    if (!aviso) return;
    aviso.textContent = txt;
    aviso.classList.add('mostra');
    clearTimeout(tAviso);
    tAviso = setTimeout(function () { aviso.classList.remove('mostra'); }, 2200);
  }

  moedas.forEach(function (m) {
    m.addEventListener('click', function () {
      var id = m.getAttribute('data-moeda');
      if (pegas.indexOf(id) >= 0) return;
      pegas.push(id);
      try { localStorage.setItem(CHAVE, JSON.stringify(pegas)); } catch (e) {}
      if (window.NCsom) window.NCsom('coin');
      if (window.NCcoins) window.NCcoins(100);
      m.classList.add('pega');
      setTimeout(function () { m.hidden = true; }, 520);
      var n = pegas.length;
      if (n === 1) avisa('MOEDA SECRETA! 1/' + total + ' · ACHE TODAS');
      else if (n < total) avisa('MOEDA SECRETA! ' + n + '/' + total);
      else {
        avisa('TODAS AS ' + total + ' MOEDAS!');
        if (window.NCzap) window.NCzap.evento('moedas_completas', { total: total });
        setTimeout(abreCupom, 700);
        liberaHud();
      }
    });
  });

  /* ---------- Tela do cupom ---------- */
  var tela = document.getElementById('cupom');
  var voltaFoco = null;
  function monta() {
    var cupom = NC.cupom || {};
    var caixa = document.getElementById('cupom-caixa');
    var acoes = document.getElementById('cupom-acoes');
    document.getElementById('cupom-total').textContent = total;
    caixa.innerHTML = '';
    acoes.innerHTML = '';
    document.getElementById('cupom-sub').textContent = cupom.codigo ? 'cupom desbloqueado' : 'o cupom chega em breve';
    if (!cupom.codigo) {
      caixa.innerHTML = '<p class="cupom__codigo"><span class="ph">cupom a definir com a loja</span></p>';
      return;
    }
    var cod = document.createElement('p');
    cod.className = 'cupom__codigo';
    cod.textContent = cupom.codigo;
    caixa.appendChild(cod);
    var ben = document.createElement('p');
    ben.className = 'cupom__beneficio';
    if (cupom.beneficio) ben.textContent = cupom.beneficio;
    else ben.innerHTML = '<span class="ph">benefício a confirmar</span>';
    caixa.appendChild(ben);

    var copia = document.createElement('button');
    copia.type = 'button';
    copia.className = 'btn btn--amarelo btn--mini';
    copia.textContent = 'COPIAR CUPOM';
    copia.addEventListener('click', function () {
      var ok = function () { copia.textContent = 'COPIADO!'; };
      var falha = function () { copia.textContent = cupom.codigo; }; // sem área de transferência: mostra para copiar à mão
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cupom.codigo).then(ok, falha);
      else falha();
    });
    acoes.appendChild(copia);
    var zap = document.createElement('a');
    zap.className = 'btn btn--mini';
    zap.setAttribute('data-zap', 'cupom');
    zap.setAttribute('data-msg', 'Olá Nerd Club! Achei as ' + total + ' moedas escondidas no site. Meu cupom é ' + cupom.codigo + '.');
    zap.textContent = 'USAR NO WHATSAPP';
    if (window.NCzap) window.NCzap.liga(zap);
    acoes.appendChild(zap);
  }
  function abreCupom() {
    if (!tela) return;
    monta();
    voltaFoco = document.activeElement;
    tela.hidden = false;
    document.body.style.overflow = 'hidden';
    if (window.NCsom) window.NCsom('start');
    var f = tela.querySelector('.cupom__acoes button, [data-fecha-cupom]');
    if (f) f.focus();
  }
  function fecha() {
    tela.hidden = true;
    document.body.style.overflow = '';
    // a moeda clicada já sumiu: o foco volta para o COINS do topo
    var alvo = (voltaFoco && voltaFoco.isConnected && !voltaFoco.closest('[hidden]')) ? voltaFoco : hud;
    if (alvo && alvo.focus) alvo.focus({ preventScroll: true });
  }
  if (tela) {
    tela.addEventListener('click', function (e) {
      if (e.target === tela || e.target.closest('[data-fecha-cupom]')) fecha();
    });
    document.addEventListener('keydown', function (e) {
      if (tela.hidden) return;
      if (e.key === 'Escape') { fecha(); return; }
      if (e.key !== 'Tab') return;
      // foco preso no diálogo
      var f = Array.prototype.slice.call(tela.querySelectorAll('a[href], button'));
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
  }
  /* Quem já juntou todas reabre o cupom pelo COINS do topo */
  var hud = document.querySelector('.hud__coins');
  function liberaHud() {
    if (!hud || hud.hasAttribute('tabindex')) return;
    hud.setAttribute('role', 'button');
    hud.setAttribute('tabindex', '0');
    hud.setAttribute('aria-label', 'Abrir o cupom das moedas secretas');
    hud.title = 'Abrir o cupom das moedas secretas';
    hud.classList.add('hud__coins--cupom');
    hud.addEventListener('click', abreCupom);
    hud.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abreCupom(); } });
  }
  if (pegas.length >= total) liberaHud();
  window.NCcupom = abreCupom; // a Fase 5 (Konami) abre a mesma tela
})();
