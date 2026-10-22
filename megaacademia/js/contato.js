// Página "Fale conosco": canal oficial de elogios, sugestões, reclamações, dúvidas e contato comercial.
// Igual nos sites que usam (O2, Zini, RAR, Mega): tudo o que muda vem do window.SITE, no js/config.js.
// Com SITE.web3formsKey, a mensagem vai por e-mail (Web3Forms); sem chave, sai mastigada no WhatsApp.
(function () {
  var S = window.SITE;
  var still = /[?&]still=1/.test(location.search);
  if (still) document.documentElement.classList.add('still');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ph(s) { return '<span class="ph">' + esc(s) + '</span>'; }
  function zap(msg) { return 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(msg); }
  function digitos(s) { return String(s).replace(/\D/g, ''); }

  // ---------- links fixos de WhatsApp e ano ----------
  document.querySelectorAll('[data-zap]').forEach(function (a) { a.href = zap(a.getAttribute('data-zap')); a.target = '_blank'; a.rel = 'noopener'; });
  document.getElementById('ano').textContent = new Date().getFullYear();

  // ---------- menu do celular ----------
  var topo = document.getElementById('topo'), menu = document.getElementById('menu'), menuBtn = document.getElementById('menu-btn');
  function fechaMenu() { menu.classList.remove('aberto'); topo.classList.remove('menu-aberto'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var abre = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abre); topo.classList.toggle('menu-aberto', abre); menuBtn.setAttribute('aria-expanded', String(abre));
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(); });

  // ---------- canais oficiais ----------
  var canais = [
    { ico: 'i-zap', t: 'WhatsApp comercial', v: S.whatsappTexto, href: zap('Olá! Vim pela página Fale conosco do site da ' + S.nome + '.'), fora: true },
    { ico: 'i-fone', t: 'Telefone', v: S.telefone, href: S.telefone ? 'tel:+55' + digitos(S.telefone) : null },
    { ico: 'i-email', t: 'E-mail', v: S.email, href: S.email ? 'mailto:' + S.email + '?subject=' + encodeURIComponent('Contato pelo site') : null },
    { ico: 'i-pino', t: 'Na recepção', v: S.endereco + ' · ' + S.bairro + ', ' + S.cidade, href: '../#como-chegar' }
  ];
  document.getElementById('canais').innerHTML = canais.map(function (c) {
    var valor = c.v ? esc(c.v) : ph('[' + c.t.toLowerCase() + ']');
    var tag = c.href ? 'a href="' + esc(c.href) + '"' + (c.fora ? ' target="_blank" rel="noopener"' : '') : 'div';
    return '<' + tag + ' class="canal"><span class="canal__ico"><svg aria-hidden="true"><use href="#' + c.ico + '"/></svg></span>' +
      '<span><small>' + esc(c.t) + '</small><b>' + valor + '</b></span></' + tag.split(' ')[0] + '>';
  }).join('');
  document.getElementById('c-horario').innerHTML = S.horarioAtendimento ? esc(S.horarioAtendimento) : ph('[horário de atendimento]');
  document.querySelectorAll('[data-prazo]').forEach(function (el) { el.innerHTML = S.prazoResposta ? esc(S.prazoResposta) : ph('[prazo: ex. até 2 dias úteis]'); });

  // ---------- formulário ----------
  var form = document.getElementById('atend'), aviso = document.getElementById('f-aviso');
  var comChave = !!S.web3formsKey;
  document.getElementById('f-enviar-txt').textContent = comChave ? 'Enviar mensagem' : 'Enviar pelo WhatsApp';
  document.getElementById('f-modo').innerHTML = comChave
    ? 'A mensagem chega no e-mail da ' + esc(S.nome) + ' com o seu protocolo.'
    : 'Nesta prévia o envio é pelo WhatsApp: a mensagem sai pronta e a ' + esc(S.nome) + ' vê o seu número. ' + ph('[ativar o formulário por e-mail, para o envio anônimo valer]');

  function val(n) { var i = form.querySelector('[name=' + n + ']:checked') || form.querySelector('[name=' + n + ']:not([type=radio]):not([type=checkbox])'); return i ? i.value.trim() : ''; }
  function atualiza() {
    var tipo = val('tipo'), anon = form.anonimo.checked;
    form.querySelector('[data-so="reclamacao"]').hidden = tipo !== 'Reclamação';
    form.querySelector('[data-so="anonimo"]').hidden = !(tipo === 'Reclamação' || tipo === 'Sugestão');
    if (form.querySelector('[data-so="anonimo"]').hidden) form.anonimo.checked = anon = false;
    form.querySelector('[data-so="ident"]').hidden = anon;
    var porEmail = val('retorno') === 'E-mail';
    form.contato.type = porEmail ? 'email' : 'tel';
    form.contato.placeholder = porEmail ? 'seu@email.com' : '(00) 00000-0000';
    form.contato.autocomplete = porEmail ? 'email' : 'tel';
    document.getElementById('f-contato-rot').textContent = porEmail ? 'Seu e-mail' : 'Seu WhatsApp';
  }
  form.addEventListener('change', atualiza); atualiza();

  // Protocolo: sigla, data e quatro caracteres sem letras que confundem (0/O, 1/I)
  function protocolo() {
    var d = new Date(), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = '';
    for (var i = 0; i < 4; i++) r += A[Math.floor(Math.random() * A.length)];
    return S.siglaProtocolo + '-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + r;
  }

  function erro(msg, campo) { aviso.textContent = msg; aviso.hidden = false; if (campo) campo.focus(); return false; }
  function valida() {
    aviso.hidden = true;
    if (!val('tipo')) return erro('Escolha o tipo da mensagem.', form.querySelector('[name=tipo]'));
    if (!val('perfil')) return erro('Diga quem está falando com a ' + S.nome + '.', form.querySelector('[name=perfil]'));
    if (val('mensagem').length < 10) return erro('Escreva a sua mensagem (pelo menos 10 caracteres).', form.mensagem);
    if (!form.anonimo.checked) {
      if (!val('nome')) return erro('Diga o seu nome, ou marque o envio sem identificação.', form.nome);
      var c = val('contato');
      if (val('retorno') === 'E-mail' ? !/^\S+@\S+\.\S+$/.test(c) : digitos(c).length < 10) return erro('Confira o contato para a resposta.', form.contato);
    }
    if (!form.lgpd.checked) return erro('Para enviar, aceite o uso dos dados só para responder esta mensagem.', form.lgpd);
    return true;
  }

  function linhas(p) {
    var l = ['*Fale conosco · ' + S.marca + '*', '*Protocolo:* ' + p, '*Tipo:* ' + val('tipo'), '*Quem fala:* ' + val('perfil')];
    if (val('tipo') === 'Reclamação' && val('quando')) l.push('*Quando aconteceu:* ' + val('quando').split('-').reverse().join('/'));
    l.push('', '*Mensagem:*', val('mensagem'), '');
    if (form.anonimo.checked) l.push('_Enviada sem identificação._');
    else { l.push('*Nome:* ' + val('nome')); l.push('*Resposta por ' + val('retorno') + ':* ' + val('contato')); }
    return l;
  }

  var enviando = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando || !valida()) return;
    if (form.botcheck.checked) return;
    var p = protocolo(), texto = linhas(p);
    if (!comChave) { window.open(zap(texto.join('\n')), '_blank', 'noopener'); return pronto(p, true); }
    enviando = true; form.querySelector('[type=submit]').disabled = true;
    var corpo = {
      access_key: S.web3formsKey, from_name: 'Site ' + S.marca,
      subject: (val('tipo') === 'Reclamação' ? '⚠️ ' : '📩 ') + val('tipo') + ' – ' + S.marca + ' – ' + p,
      protocolo: p, tipo: val('tipo'), quem_fala: val('perfil'), quando_aconteceu: val('quando') || '-',
      mensagem: val('mensagem'), anonimo: form.anonimo.checked ? 'sim' : 'não',
      nome: form.anonimo.checked ? '-' : val('nome'), resposta_por: form.anonimo.checked ? '-' : val('retorno'),
      contato: form.anonimo.checked ? '-' : val('contato'), pagina: location.href
    };
    if (!form.anonimo.checked && val('retorno') === 'E-mail') corpo.replyto = val('contato');
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.success) throw new Error(); pronto(p, false); })
      .catch(function () {
        enviando = false; form.querySelector('[type=submit]').disabled = false;
        aviso.innerHTML = 'Não consegui enviar agora. <a href="' + esc(zap(texto.join('\n'))) + '" target="_blank" rel="noopener">Mandar a mesma mensagem pelo WhatsApp</a>.';
        aviso.hidden = false;
      });
  });

  function pronto(p, porZap) {
    document.getElementById('ok-prot').value = p;
    document.getElementById('ok-txt').innerHTML = porZap
      ? 'A mensagem abriu no WhatsApp com este protocolo. Falta só tocar em enviar por lá.'
      : 'Recebemos a sua mensagem. ' + (form.anonimo.checked ? 'Como ela foi sem identificação, guarde o protocolo: é por ele que você pergunta sobre o andamento.' : 'A resposta chega por ' + esc(val('retorno')) + ' em ' + (S.prazoResposta ? esc(S.prazoResposta) : ph('[prazo]')) + '.');
    form.hidden = true;
    var ok = document.getElementById('ok'); ok.hidden = false; ok.focus();
  }
  document.getElementById('ok-copiar').addEventListener('click', function () {
    var v = document.getElementById('ok-prot').value, b = this;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { b.textContent = 'Copiado'; }, function () { document.getElementById('ok-prot').select(); });
  });
  document.getElementById('ok-nova').addEventListener('click', function () {
    form.reset(); enviando = false; form.querySelector('[type=submit]').disabled = false; atualiza();
    document.getElementById('ok').hidden = true; form.hidden = false; document.getElementById('ok-copiar').textContent = 'Copiar';
  });
})();
