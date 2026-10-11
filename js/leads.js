/* Leads do site principal: WhatsApp no computador, formulários e pop-up de saída.
 *
 * Quem está no computador e clica em WhatsApp não quer pegar o celular
 * para escanear QR code. Em vez de abrir o wa.me direto, o clique abre
 * um modal com três saídas, nesta ordem:
 *   a) "me chame no WhatsApp"  nome, empresa e WhatsApp
 *   b) diagnóstico por e-mail  nome, empresa, e-mail e site (opcional)
 *   c) abrir mesmo assim       QR code do wa.me + link do WhatsApp Web
 * No celular nada muda: o wa.me abre direto.
 *
 * Os dois formulários (e o pop-up de saída) mandam o lead por e-mail via
 * Web3Forms. A chave fica em ACCESS_KEY: ela é pública por desenho (vive
 * no navegador) e só serve para mandar e-mail para o dono dela.
 * Sem chave, formulário nenhum aparece: o modal mostra só o QR code e o
 * WhatsApp Web, e o pop-up de saída não arma. Se o envio falhar com
 * chave, a tela diz que não enviou e oferece o WhatsApp com os dados já
 * escritos. Nunca "recebido" que não aconteceu.
 *
 * Eventos (GA4 e UET), só para quem aceitou cookies:
 *   whatsapp_click  qualquer abertura de WhatsApp (substitui o antigo
 *                   clique_whatsapp)
 *   lead_callback   enviou o "me chame"
 *   lead_email      enviou o diagnóstico por e-mail (ou o e-mail do
 *                   pop-up de saída)
 *
 * Componente com estado: os textos moram aqui, não em data-en, e cada
 * caixa é montada no idioma da hora em que abre. */
(function () {
  'use strict';

  var ACCESS_KEY = '01d73712-bd8f-4fe3-ab7b-1d858dd2d047'; // chave do Web3Forms (web3forms.com), pública por desenho
  var ENVIO = 'https://api.web3forms.com/submit';
  var QR_JS = '/js/vendor/qrcode.min.js';
  var LEAD = 'theatrum-lead';           /* localStorage: 'enviado' depois de qualquer formulário */
  var STILL = new URLSearchParams(location.search).get('still');

  var idioma = function () { return /^en/i.test(document.documentElement.lang) ? 'en' : 'pt'; };

  function computador() {
    var ua = navigator.userAgent || '';
    var movel = /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua) ||
                (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);   /* iPad se apresenta como Mac */
    return !movel && window.innerWidth >= 1024;
  }

  function guarda(tipo, chave, valor) { try { window[tipo].setItem(chave, valor); } catch (e) {} }
  function le(tipo, chave) { try { return window[tipo].getItem(chave); } catch (e) { return null; } }
  function jaEnviou() { return le('localStorage', LEAD) === 'enviado' || le('sessionStorage', 'theatrum-raiox') === 'enviado'; }

  /* ---------- eventos: só com consentimento ---------- */
  function evento(nome, params) {
    if (le('localStorage', 'theatrum-cookies') !== 'aceito') return;
    params = params || {};
    if (typeof window.gtag === 'function') window.gtag('event', nome, params);
    window.uetq = window.uetq || [];
    window.uetq.push('event', nome, params.origem ? { event_label: params.origem } : {});
  }

  var T = {
    pt: {
      sobre: 'você está no computador', t: 'Como prefere seguir?',
      p: 'Sem precisar pegar o celular para escanear código.',
      aT: 'Prefere que eu te chame no WhatsApp?', aS: 'Você deixa o número e eu te chamo.',
      bT: 'Receber o diagnóstico por e-mail', bS: 'Por escrito, para ler com calma.',
      cT: 'Abrir no WhatsApp mesmo assim', cS: 'Pelo QR code ou pelo WhatsApp Web.',
      nome: 'Nome', emp: 'Empresa', zap: 'WhatsApp', mail: 'E-mail', site: 'Site atual', opc: '(opcional)',
      phNome: 'Seu nome', phEmp: 'Nome da empresa', phZap: '(32) 99999-9999',
      phMail: 'voce@suaempresa.com.br', phSite: 'www.suaempresa.com.br',
      aB: 'Quero que me chamem', aOk: 'Pronto! Vou te chamar no WhatsApp em poucos minutos (horário comercial).',
      bB: 'Quero o diagnóstico por e-mail', bOk: 'Pronto! O diagnóstico vai para o seu e-mail.',
      cQ: 'Aponte a câmera do celular para o código.', cWeb: 'Abrir no WhatsApp Web', cApp: 'Abrir o aplicativo do WhatsApp',
      enviando: 'Enviando…', erro: 'Não consegui enviar agora.', erroZap: 'Mandar os mesmos dados pelo WhatsApp Web →',
      falta: 'Confira os campos marcados.', fechar: 'Fechar',
      sT: 'Antes de sair: quer receber 3 melhorias para o site da sua empresa?',
      sP: 'É gratuito. As três chegam no seu e-mail.', sB: 'Quero as 3 melhorias',
      sOk: 'Pronto! As 3 melhorias chegam no seu e-mail.', sNao: 'Agora não',
      tipoA: 'Me chame no WhatsApp', tipoB: 'Diagnóstico por e-mail', tipoS: '3 melhorias (pop-up de saída)',
      msgZap: function (d) {
        return 'Vim do site da Theatrum. ' + d.tipo + '.' +
          (d.nome ? '\nNome: ' + d.nome : '') + (d.empresa ? '\nEmpresa: ' + d.empresa : '') +
          (d.whatsapp ? '\nWhatsApp: ' + d.whatsapp : '') + (d.email ? '\nE-mail: ' + d.email : '') +
          (d.site ? '\nSite: ' + d.site : '');
      }
    },
    en: {
      sobre: 'you are on a computer', t: 'How would you like to continue?',
      p: 'No need to grab your phone to scan a code.',
      aT: 'Would you rather I message you on WhatsApp?', aS: 'Leave your number and I will reach out.',
      bT: 'Get the diagnosis by email', bS: 'In writing, to read at your own pace.',
      cT: 'Open WhatsApp anyway', cS: 'With the QR code or WhatsApp Web.',
      nome: 'Name', emp: 'Company', zap: 'WhatsApp', mail: 'Email', site: 'Current website', opc: '(optional)',
      phNome: 'Your name', phEmp: 'Company name', phZap: '+1 512 555 0123',
      phMail: 'you@yourcompany.com', phSite: 'www.yourcompany.com',
      aB: 'Message me', aOk: 'Done! I will message you on WhatsApp within minutes (business hours).',
      bB: 'Send me the diagnosis', bOk: 'Done! The diagnosis is on its way to your email.',
      cQ: 'Point your phone camera at the code.', cWeb: 'Open WhatsApp Web', cApp: 'Open the WhatsApp app',
      enviando: 'Sending…', erro: 'I could not send it right now.', erroZap: 'Send the same details on WhatsApp Web →',
      falta: 'Check the highlighted fields.', fechar: 'Close',
      sT: 'Before you go: want 3 improvements for your company website?',
      sP: 'It is free. All three reach your email.', sB: 'Send me the 3 improvements',
      sOk: 'Done! The 3 improvements will reach your email.', sNao: 'Not now',
      tipoA: 'Message me on WhatsApp', tipoB: 'Diagnosis by email', tipoS: '3 improvements (exit pop-up)',
      msgZap: function (d) {
        return 'I came from the Theatrum site. ' + d.tipo + '.' +
          (d.nome ? '\nName: ' + d.nome : '') + (d.empresa ? '\nCompany: ' + d.empresa : '') +
          (d.whatsapp ? '\nWhatsApp: ' + d.whatsapp : '') + (d.email ? '\nEmail: ' + d.email : '') +
          (d.site ? '\nWebsite: ' + d.site : '');
      }
    }
  };

  /* ---------- envio ---------- */
  function rastro() {
    var p = new URLSearchParams(location.search), r = {};
    ['gclid', 'msclkid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].forEach(function (k) {
      if (p.get(k)) r[k] = p.get(k);
    });
    return r;
  }

  /* d: { tipo, nome, empresa, whatsapp, email, site, origem }. Devolve true só se o Web3Forms confirmou. */
  function enviar(d) {
    if (!ACCESS_KEY) {
      if (window.console) console.warn('[theatrum] lead sem ACCESS_KEY do Web3Forms:', d);
      return Promise.resolve(false);
    }
    var corpo = {
      access_key: ACCESS_KEY,
      subject: '🔥 Novo lead Theatrum – ' + (d.nome || d.email || 'sem nome') + ' – ' + (d.empresa || d.tipo),
      from_name: 'Site Theatrum',
      'Tipo': d.tipo,
      'Nome': d.nome || '',
      'Empresa': d.empresa || '',
      'WhatsApp': d.whatsapp || '',
      'E-mail': d.email || '',
      'Site atual': d.site || '',
      'Página de origem': location.href,
      'Botão de origem': d.origem || '',
      'Veio de': document.referrer || '(direto)',
      'Idioma': idioma(),
      'Aparelho': computador() ? 'computador' : 'celular'
    };
    var r = rastro();
    for (var k in r) corpo[k] = r[k];
    if (d.email) corpo.replyto = d.email;
    return fetch(ENVIO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(corpo)
    }).then(function (res) { return res.json(); })
      .then(function (j) {
        var ok = !!(j && j.success);
        if (ok) { guarda('localStorage', LEAD, 'enviado'); guarda('sessionStorage', 'theatrum-raiox', 'enviado'); }
        return ok;
      })
      .catch(function (err) { if (window.console) console.error('[theatrum] falha ao enviar o lead:', err); return false; });
  }

  /* ---------- estilo (injetado uma vez) ---------- */
  var CSS =
    '.tl-veu{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;padding:20px;background:rgba(7,6,5,.78);opacity:0;transition:opacity .25s ease}' +
    '.tl-veu.is-on{opacity:1}' +
    '.tl-caixa{position:relative;width:min(560px,100%);max-height:calc(100vh - 40px);overflow:auto;background:#141210;color:#F6F1E7;' +
      'border:1px solid rgba(227,179,65,.35);border-radius:22px;padding:30px 28px 24px;box-shadow:0 30px 90px rgba(0,0,0,.6);' +
      'font:400 15px/1.55 Inter,system-ui,sans-serif;transform:translateY(10px);transition:transform .25s ease}' +
    '.tl-veu.is-on .tl-caixa{transform:none}' +
    '.tl-x{position:absolute;top:12px;right:14px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#A39B8D;font:400 24px/1 system-ui;cursor:pointer}' +
    '.tl-x:hover{color:#F6F1E7;background:rgba(255,255,255,.06)}' +
    '.tl-sobre{font:600 12.5px/1 "JetBrains Mono",ui-monospace,monospace;color:#E3B341;margin:0}' +
    '.tl-caixa h2{margin:10px 34px 0 0;font:800 26px/1.15 "Plus Jakarta Sans",Inter,system-ui,sans-serif;letter-spacing:-.008em;color:#fff}' +
    '.tl-caixa > p{margin:8px 0 0;color:#A39B8D}' +
    '.tl-ops{display:grid;gap:10px;margin-top:20px}' +
    '.tl-op{border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#1A1815}' +
    '.tl-op.is-on{border-color:rgba(227,179,65,.55)}' +
    '.tl-cab{display:flex;align-items:center;gap:14px;width:100%;padding:15px 16px;background:transparent;border:0;color:inherit;text-align:left;cursor:pointer;font:inherit}' +
    '.tl-cab i{flex-shrink:0;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:700 13px/1 "JetBrains Mono",monospace;font-style:normal;background:rgba(227,179,65,.14);color:#E3B341}' +
    '.tl-op.is-on .tl-cab i{background:#E3B341;color:#141210}' +
    '.tl-cab b{display:block;font:700 16px/1.3 Inter,system-ui,sans-serif;color:#fff}' +
    '.tl-cab small{display:block;margin-top:2px;font-size:13.5px;color:#A39B8D}' +
    '.tl-corpo{padding:2px 16px 18px}' +
    '.tl-corpo[hidden]{display:none}' +
    '.tl-campo{display:block;margin-top:10px}' +
    '.tl-campo span{display:block;margin-bottom:5px;font:600 13px/1.3 Inter,system-ui,sans-serif;color:#D8CFC0}' +
    '.tl-campo em{font-style:normal;font-weight:400;color:#A39B8D}' +
    '.tl-campo input{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.14);color:#F6F1E7;font:400 15px/1.2 Inter,system-ui,sans-serif;outline:none}' +
    '.tl-campo input:focus-visible{border-color:#E3B341;box-shadow:0 0 0 3px rgba(227,179,65,.2)}' +
    '.tl-campo input[aria-invalid=true]{border-color:#D64545}' +
    '.tl-dupla{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}' +
    '.tl-enviar{width:100%;min-height:48px;margin-top:14px;border:0;border-radius:99px;background:#E3B341;color:#141210;font:700 15px/1 Inter,system-ui,sans-serif;cursor:pointer}' +
    '.tl-enviar:hover{background:#F0D488}.tl-enviar[disabled]{opacity:.6;cursor:wait}' +
    '.tl-aviso{margin:10px 0 0;font-size:14px;color:#F08A8A}' +
    '.tl-aviso a{color:#E3B341;font-weight:600}' +
    '.tl-ok{margin:6px 0 2px;padding:14px 16px;border-radius:12px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.35);color:#B9F3D6;font-weight:600}' +
    '.tl-qr{display:flex;gap:18px;align-items:center;flex-wrap:wrap}' +
    '.tl-qr-img{width:200px;height:200px;flex-shrink:0;border-radius:12px;background:#fff;padding:10px;box-sizing:border-box;display:grid;place-items:center;color:#141210;font-size:12px}' +
    '.tl-qr-img img{width:100%;height:100%;image-rendering:pixelated}' +
    '.tl-qr-txt{flex:1;min-width:180px;display:grid;gap:10px}' +
    '.tl-qr p{margin:0;color:#D8CFC0}' +
    '.tl-qr a{display:inline-flex;justify-content:center;align-items:center;min-height:44px;padding:0 16px;border-radius:99px;text-decoration:none;font:700 14px/1 Inter,system-ui,sans-serif}' +
    '.tl-qr .tl-web{background:#25D366;color:#0B0A08}.tl-qr .tl-web:hover{background:#4BE083}' +
    '.tl-qr .tl-app{border:1px solid rgba(255,255,255,.2);color:#F6F1E7}.tl-qr .tl-app:hover{border-color:rgba(255,255,255,.45)}' +
    '.tl-agora{display:block;margin:14px auto 0;background:transparent;border:0;color:#A39B8D;font:500 14px/1 Inter,system-ui,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}' +
    '.tl-caixa :focus-visible{outline:2px solid #E3B341;outline-offset:2px}' +
    '.tl-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}' +
    '@media(prefers-reduced-motion:reduce){.tl-veu,.tl-caixa{transition:none}}';
  var estilo = null;
  function poeEstilo() {
    if (estilo) return;
    estilo = document.createElement('style');
    estilo.textContent = CSS;
    document.head.appendChild(estilo);
  }

  var esc = function (v) {
    return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  function campo(nome, rot, ph, tipo, auto, obrig, opc) {
    return '<label class="tl-campo"><span>' + rot + (opc ? ' <em>' + opc + '</em>' : '') + '</span>' +
      '<input name="' + nome + '" type="' + tipo + '" placeholder="' + esc(ph) + '" autocomplete="' + auto + '"' +
      (tipo === 'tel' ? ' inputmode="tel"' : '') + (obrig ? ' required' : '') + '></label>';
  }
  var HONEYPOT = '<label class="tl-hp" aria-hidden="true">não preencha<input type="checkbox" name="botcheck" tabindex="-1"></label>';

  /* máscara de telefone: (00) 00000-0000 no Brasil; com "+" na frente
     (ou na página em inglês) fica livre, só números, espaço e traço */
  function mascara(input) {
    input.addEventListener('input', function () {
      var v = input.value;
      if (/^\s*\+/.test(v) || idioma() === 'en') { input.value = v.replace(/[^\d+\s()-]/g, ''); return; }
      var d = v.replace(/\D/g, '').slice(0, 11);
      var r = d;
      if (d.length > 2) r = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) r = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(d.length - 4);
      input.value = r;
    });
  }

  /* valida os obrigatórios do form; devolve o primeiro inválido ou null */
  function confere(form) {
    var primeiro = null;
    form.querySelectorAll('input[required]').forEach(function (i) {
      var v = i.value.trim(), ruim = !v;
      if (!ruim && i.type === 'email') ruim = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ruim && i.type === 'tel') ruim = v.replace(/\D/g, '').length < 10;
      i.setAttribute('aria-invalid', String(ruim));
      if (ruim && !primeiro) primeiro = i;
    });
    return primeiro;
  }

  /* ---------- caixa genérica: véu, foco preso, Esc ---------- */
  var aberta = null;
  function abreCaixa(html, rotulo) {
    poeEstilo();
    var veu = document.createElement('div');
    veu.className = 'tl-veu';
    veu.innerHTML = '<div class="tl-caixa" role="dialog" aria-modal="true" aria-labelledby="' + rotulo + '">' + html + '</div>';
    document.body.appendChild(veu);
    var caixa = veu.firstChild;
    var antes = document.activeElement;
    var rolagem = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { veu.classList.add('is-on'); });

    function teclas(e) {
      if (e.key === 'Escape') { e.preventDefault(); fecha(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(caixa.querySelectorAll('button,input:not([tabindex="-1"]),a[href]'), function (x) { return x.offsetParent; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
    function fecha() {
      veu.classList.remove('is-on');
      document.body.style.overflow = rolagem;
      document.removeEventListener('keydown', teclas, true);
      setTimeout(function () { veu.remove(); }, 260);
      if (antes && antes.focus) antes.focus();
      aberta = null;
    }
    document.addEventListener('keydown', teclas, true);
    veu.addEventListener('mousedown', function (e) { if (e.target === veu) fecha(); });
    caixa.querySelector('.tl-x').addEventListener('click', fecha);
    aberta = { caixa: caixa, fecha: fecha };
    return aberta;
  }

  /* trata o envio de um formulário: valida, envia, mostra o resultado */
  function ligaForm(form, L, monta, ok, eventoNome, origem) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var aviso = form.querySelector('.tl-aviso');
      if (aviso) aviso.remove();
      var ruim = confere(form);
      if (ruim) { ruim.focus(); return; }
      if (form.querySelector('[name=botcheck]').checked) return;
      var d = monta(function (n) { var i = form.querySelector('[name=' + n + ']'); return i ? i.value.trim() : ''; });
      d.origem = origem;
      var bt = form.querySelector('.tl-enviar'), rot = bt.textContent;
      bt.disabled = true; bt.textContent = L.enviando;
      enviar(d).then(function (foi) {
        if (foi) {
          evento(eventoNome, { origem: origem });
          form.innerHTML = '<p class="tl-ok" role="status">' + ok + '</p>';
          return;
        }
        bt.disabled = false; bt.textContent = rot;
        var web = 'https://web.whatsapp.com/send?phone=' + NUMERO + '&text=' + encodeURIComponent(L.msgZap(d));
        var p = document.createElement('p');
        p.className = 'tl-aviso'; p.setAttribute('role', 'alert');
        p.innerHTML = L.erro + ' <a href="' + esc(web) + '" target="_blank" rel="noopener" data-wa-direto>' + L.erroZap + '</a>';
        form.appendChild(p);
      });
    });
  }

  /* ---------- modal do WhatsApp no computador ---------- */
  var NUMERO = '5532984762445';
  function partes(href) {
    try {
      var u = new URL(href, location.href), fone = '', texto = u.searchParams.get('text') || '';
      if (/wa\.me$/i.test(u.hostname)) fone = u.pathname.replace(/\D/g, '');
      else fone = (u.searchParams.get('phone') || '').replace(/\D/g, '');
      return { fone: fone || NUMERO, texto: texto };
    } catch (e) { return { fone: NUMERO, texto: '' }; }
  }

  function carregaQR() {
    if (window.qrcode) return Promise.resolve(window.qrcode);
    return new Promise(function (ok, falha) {
      var s = document.createElement('script');
      s.src = QR_JS; s.async = true;
      s.onload = function () { ok(window.qrcode); };
      s.onerror = falha;
      document.head.appendChild(s);
    });
  }

  function abrirModal(href, origem) {
    if (aberta) return;
    var L = T[idioma()];
    var w = partes(href);
    var app = 'https://wa.me/' + w.fone + (w.texto ? '?text=' + encodeURIComponent(w.texto) : '');
    var web = 'https://web.whatsapp.com/send?phone=' + w.fone + (w.texto ? '&text=' + encodeURIComponent(w.texto) : '');
    var cab = function (n, t, s, on) {
      return '<button class="tl-cab" type="button" aria-expanded="' + on + '"><i>' + n + '</i><span><b>' + t + '</b><small>' + s + '</small></span></button>';
    };
    var html =
      '<button class="tl-x" type="button" aria-label="' + L.fechar + '">&times;</button>' +
      '<p class="tl-sobre">' + L.sobre + '</p>' +
      '<h2 id="tlTitulo">' + L.t + '</h2><p>' + L.p + '</p>' +
      '<div class="tl-ops">' +
        '<div class="tl-op is-on" data-op="a">' + cab(1, L.aT, L.aS, true) +
          '<div class="tl-corpo"><form novalidate>' + HONEYPOT +
            '<div class="tl-dupla">' + campo('nome', L.nome, L.phNome, 'text', 'name', true) + campo('empresa', L.emp, L.phEmp, 'text', 'organization', true) + '</div>' +
            campo('zap', L.zap, L.phZap, 'tel', 'tel', true) +
            '<button class="tl-enviar" type="submit">' + L.aB + '</button></form></div></div>' +
        '<div class="tl-op" data-op="b">' + cab(2, L.bT, L.bS, false) +
          '<div class="tl-corpo" hidden><form novalidate>' + HONEYPOT +
            '<div class="tl-dupla">' + campo('nome', L.nome, L.phNome, 'text', 'name', true) + campo('empresa', L.emp, L.phEmp, 'text', 'organization', true) + '</div>' +
            campo('email', L.mail, L.phMail, 'email', 'email', true) +
            campo('site', L.site, L.phSite, 'text', 'url', false, L.opc) +
            '<button class="tl-enviar" type="submit">' + L.bB + '</button></form></div></div>' +
        '<div class="tl-op" data-op="c">' + cab(3, L.cT, L.cS, false) +
          '<div class="tl-corpo" hidden><div class="tl-qr"><div class="tl-qr-img" aria-hidden="true"></div><div class="tl-qr-txt">' +
            '<p>' + L.cQ + '</p>' +
            '<a class="tl-web" href="' + esc(web) + '" target="_blank" rel="noopener" data-wa-direto>' + L.cWeb + '</a>' +
            '<a class="tl-app" href="' + esc(app) + '" target="_blank" rel="noopener" data-wa-direto>' + L.cApp + '</a>' +
          '</div></div></div></div>' +
      '</div>';
    var m = abreCaixa(html, 'tlTitulo');
    var caixa = m.caixa;
    if (!ACCESS_KEY) {
      caixa.querySelectorAll('[data-op=a],[data-op=b]').forEach(function (o) { o.remove(); });
      var c = caixa.querySelector('[data-op=c]');
      c.classList.add('is-on'); c.querySelector('.tl-cab').setAttribute('aria-expanded', 'true');
      c.querySelector('.tl-cab i').textContent = '✓';
      c.querySelector('.tl-corpo').hidden = false;
    }

    var ops = caixa.querySelectorAll('.tl-op');
    ops.forEach(function (op) {
      op.querySelector('.tl-cab').addEventListener('click', function () {
        ops.forEach(function (o) {
          var on = o === op;
          o.classList.toggle('is-on', on);
          o.querySelector('.tl-cab').setAttribute('aria-expanded', String(on));
          o.querySelector('.tl-corpo').hidden = !on;
        });
        if (op.getAttribute('data-op') === 'c') desenhaQR();
        else { var i = op.querySelector('input:not([tabindex="-1"])'); if (i) i.focus(); }
      });
    });

    var qrFeito = false;
    function desenhaQR() {
      if (qrFeito) return; qrFeito = true;
      var alvo = caixa.querySelector('.tl-qr-img');
      carregaQR().then(function (qrcode) {
        var q = qrcode(0, 'M');
        q.addData(app);
        q.make();
        alvo.innerHTML = '<img alt="" src="' + q.createDataURL(6, 0) + '">';
      }).catch(function () { alvo.textContent = 'QR'; });
    }

    if (!ACCESS_KEY) { desenhaQR(); setTimeout(function () { caixa.querySelector('.tl-web').focus(); }, 60); return; }
    var fA = caixa.querySelector('[data-op=a] form'), fB = caixa.querySelector('[data-op=b] form');
    mascara(fA.querySelector('[name=zap]'));
    ligaForm(fA, L, function (v) { return { tipo: L.tipoA, nome: v('nome'), empresa: v('empresa'), whatsapp: v('zap') }; },
      L.aOk, 'lead_callback', origem);
    ligaForm(fB, L, function (v) { return { tipo: L.tipoB, nome: v('nome'), empresa: v('empresa'), email: v('email'), site: v('site') }; },
      L.bOk, 'lead_email', origem);

    setTimeout(function () { var i = fA.querySelector('input:not([tabindex="-1"])'); if (i) i.focus(); }, 60);
  }

  /* de onde veio o clique: data-origem, senão o id da seção, senão a classe */
  function origemDe(el) {
    if (el.getAttribute('data-origem')) return el.getAttribute('data-origem');
    var s = el.closest('section[id],header[id],footer,nav');
    return (s && (s.id || s.tagName.toLowerCase())) || el.className || 'link';
  }

  /* ---------- um ouvinte só, no documento inteiro ----------
     Os links de WhatsApp mudam de endereço (idioma, calculadora) e alguns
     nascem depois do carregamento; ouvindo no documento, todos entram. */
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;
    if (el.hasAttribute('data-wa-direto')) { evento('whatsapp_click', { origem: 'modal-computador' }); return; }
    var href = el.getAttribute('href') || '';
    var ehWa = /(^|\/\/|\.)wa\.me\/|api\.whatsapp\.com/i.test(href);
    if (!ehWa && !el.hasAttribute('data-whatsapp')) return;
    var simples = e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
    if (ehWa && simples && computador()) {
      e.preventDefault();
      abrirModal(el.href, origemDe(el));
      return;
    }
    evento('whatsapp_click', { origem: origemDe(el) });
  }, true);

  /* ---------- pop-up de saída: só no computador ----------
     Uma vez por visita (sessionStorage 'theatrum-saida'), armado depois
     de 8 s, e nunca para quem já mandou algum formulário. */
  function abrirSaida() {
    if (aberta || jaEnviou() || le('sessionStorage', 'theatrum-saida') === 'visto') return;
    if (document.querySelector('.mobile-menu.is-open')) return;
    guarda('sessionStorage', 'theatrum-saida', 'visto');
    document.querySelectorAll('.raiox-card').forEach(function (c) { c.remove(); });
    var L = T[idioma()];
    var m = abreCaixa(
      '<button class="tl-x" type="button" aria-label="' + L.fechar + '">&times;</button>' +
      '<h2 id="tlSaida">' + L.sT + '</h2><p>' + L.sP + '</p>' +
      '<form novalidate>' + HONEYPOT + campo('email', L.mail, L.phMail, 'email', 'email', true) +
      '<button class="tl-enviar" type="submit">' + L.sB + '</button></form>' +
      '<button class="tl-agora" type="button">' + L.sNao + '</button>', 'tlSaida');
    m.caixa.querySelector('.tl-agora').addEventListener('click', m.fecha);
    var f = m.caixa.querySelector('form');
    ligaForm(f, L, function (v) { return { tipo: L.tipoS, email: v('email') }; }, L.sOk, 'lead_email', 'popup-saida');
    setTimeout(function () { f.querySelector('[name=email]').focus(); }, 60);
  }

  if (!STILL && ACCESS_KEY) {
    var armadoEm = Date.now() + 8000;
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0 && Date.now() > armadoEm && computador()) abrirSaida();
    });
  }

  /* para o card do raio-x da home (e o que vier) usarem o mesmo canal */
  window.TheatrumLeads = { enviar: enviar, evento: evento, computador: computador };
})();
