// Monta a pagina de publicacao com fontes e capas embutidas em data URI.
const fs = require('fs');
const sharp = require('sharp');

const ROOT = 'c:/Users/mathe/Desktop/theatrum/conta-frases';
const posts = JSON.parse(fs.readFileSync(`${ROOT}/posts.json`, 'utf8'));
const copy = JSON.parse(fs.readFileSync(`${ROOT}/copy.json`, 'utf8'));

const font = (f) => fs.readFileSync(`${ROOT}/fonts/${f}`).toString('base64');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const PILAR = {
  P1: { nome: 'Paz e limites', cor: '#5B7C99' },
  P2: { nome: 'Recomeços', cor: '#65756F' },
  P3: { nome: 'Fé leve', cor: '#A2702C' },
  P4: { nome: 'Amor-próprio', cor: '#A0666F' },
};

const FORMULA = {
  F1: 'Imperativo suave', F2: 'Afirmação do universo', F3: 'Permissão para soltar',
  F4: 'Absolvição', F5: 'Dispensa de exigência', F6: 'Verdade curta',
};

(async () => {
  const covers = {};
  for (const p of posts) {
    const buf = await sharp(`${ROOT}/final/instagram/${p.id}-4x5.jpg`)
      .resize(560).jpeg({ quality: 76, mozjpeg: true }).toBuffer();
    covers[p.id] = buf.toString('base64');
  }

  const entradas = posts.map((p) => {
    const c = copy[p.id];
    const pil = PILAR[p.pilar];
    const bloco = (rotulo, texto, extra = '') => `
        <div class="bloco">
          <div class="bloco-topo">
            <span class="rotulo">${rotulo}</span>
            ${extra}
            <button class="copiar" type="button" data-copiar="${esc(texto)}">copiar</button>
          </div>
          <p class="corpo">${esc(texto).replace(/\n\n/g, '</p><p class="corpo">').replace(/\n/g, '<br>')}</p>
        </div>`;

    return `
      <article class="post" id="post-${p.id}" style="--pilar:${pil.cor}">
        <header class="post-topo">
          <span class="num">${p.id}</span>
          <span class="chip">${pil.nome}</span>
          <span class="chip chip-vazio">${p.formula} · ${FORMULA[p.formula]}</span>
          ${p.surreal ? '<span class="chip chip-vazio">variante surreal</span>' : ''}
          <div class="feitos">
            <label><input type="checkbox" data-feito="ig-${p.id}"> feed</label>
            <label><input type="checkbox" data-feito="pin-${p.id}"> pin</label>
          </div>
        </header>

        <div class="post-corpo">
          <div class="arte">
            <img src="data:image/jpeg;base64,${covers[p.id]}"
                 alt="${esc(c.alt)}" width="1080" height="1350" loading="lazy">
            <ul class="arquivos">
              <li>final/instagram/<b>${p.id}-4x5.mp4</b></li>
              <li>final/pinterest/<b>${p.id}-2x3.mp4</b></li>
            </ul>
          </div>

          <div class="texto">
            <p class="frase">${esc(p.frase).replace(/\n/g, '<br>')}</p>
            ${bloco('Legenda', c.legenda)}
            ${bloco('Hashtags · 1º comentário', c.hashtags)}
            ${bloco('Alt text', c.alt)}
            ${bloco('Título do pin', c.pin_titulo,
              `<span class="conta">${c.pin_titulo.length}/40</span>`)}
            ${bloco('Descrição do pin', c.pin_desc,
              `<span class="conta">board: ${esc(c.board)}</span>`)}
          </div>
        </div>
      </article>`;
  }).join('\n');

  const html = `<title>Publicação — 10 posts de frases</title>
<style>
  @font-face { font-family: 'Instrument'; font-weight: 400 700; font-display: block;
    src: url(data:font/ttf;base64,${font('InstrumentSans.ttf')}) format('truetype-variations'); }
  @font-face { font-family: 'Itim'; font-weight: 400; font-display: block;
    src: url(data:font/ttf;base64,${font('Itim-Regular.ttf')}) format('truetype'); }
  @font-face { font-family: 'Fragment'; font-weight: 400; font-display: block;
    src: url(data:font/ttf;base64,${font('FragmentMono-Regular.ttf')}) format('truetype'); }

  :root {
    --ground:#E9EBE7; --card:#FAFAF8; --ink:#171A18; --muted:#6C736D;
    --line:#D3D8D1; --accent:#3B5D69; --marca:#0E1211;
    --sans:'Instrument',system-ui,sans-serif; --mono:'Fragment',ui-monospace,monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground:#131614; --card:#1C201D; --ink:#E7EAE6; --muted:#8D948E;
      --line:#2A2F2B; --accent:#84AEB9; --marca:#F1F3EF;
    }
  }
  :root[data-theme="dark"] {
    --ground:#131614; --card:#1C201D; --ink:#E7EAE6; --muted:#8D948E;
    --line:#2A2F2B; --accent:#84AEB9; --marca:#F1F3EF;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--ground); color: var(--ink);
    font-family: var(--sans); font-size: 16px; line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .folha { max-width: 1040px; margin: 0 auto; padding: 56px 24px 96px;
    display: flex; flex-direction: column; gap: 40px; }

  /* cabecalho */
  .capa { display: flex; flex-direction: column; gap: 18px;
    padding-bottom: 32px; border-bottom: 1px solid var(--line); }
  .sobrenome { font-family: var(--mono); font-size: 12px; letter-spacing: .14em;
    text-transform: uppercase; color: var(--muted); }
  h1 { margin: 0; font-size: clamp(30px, 5vw, 44px); line-height: 1.08;
    font-weight: 600; letter-spacing: -.02em; text-wrap: balance; max-width: 18ch; }
  .resumo { margin: 0; max-width: 62ch; color: var(--muted); }
  .resumo b { color: var(--ink); font-weight: 600; }
  .fichas { display: flex; flex-wrap: wrap; gap: 10px 28px;
    font-family: var(--mono); font-size: 12.5px; color: var(--muted); }
  .fichas b { color: var(--ink); font-weight: 400; }
  .andamento { font-family: var(--mono); font-size: 12.5px; color: var(--accent); }

  /* post */
  .post { background: var(--card); border: 1px solid var(--line); border-radius: 3px;
    border-left: 3px solid var(--pilar); padding: 22px 24px 26px;
    display: flex; flex-direction: column; gap: 20px; }
  .post-topo { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
  .num { font-family: var(--mono); font-size: 13px; color: var(--pilar); }
  .chip { font-family: var(--mono); font-size: 11px; letter-spacing: .08em;
    text-transform: uppercase; padding: 3px 9px; border-radius: 2px;
    background: color-mix(in srgb, var(--pilar) 16%, transparent);
    color: color-mix(in srgb, var(--pilar) 78%, var(--ink)); }
  .chip-vazio { background: transparent; border: 1px solid var(--line); color: var(--muted); }
  .feitos { margin-left: auto; display: flex; gap: 14px;
    font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .feitos label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .feitos input { accent-color: var(--pilar); width: 14px; height: 14px; cursor: pointer; }

  .post-corpo { display: grid; grid-template-columns: 260px 1fr; gap: 28px; align-items: start; }
  .arte { display: flex; flex-direction: column; gap: 10px; }
  .arte img { width: 100%; height: auto; display: block; border-radius: 2px;
    border: 1px solid var(--line); }
  .arquivos { list-style: none; margin: 0; padding: 0;
    font-family: var(--mono); font-size: 11.5px; color: var(--muted);
    display: flex; flex-direction: column; gap: 3px; overflow-x: auto; }
  .arquivos b { color: var(--ink); font-weight: 400; }

  .texto { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
  .frase { margin: 0; font-family: 'Itim', cursive; font-size: clamp(24px, 3vw, 31px);
    line-height: 1.35; letter-spacing: .02em; color: var(--marca); text-wrap: balance; }

  .bloco { display: flex; flex-direction: column; gap: 5px;
    padding-top: 14px; border-top: 1px solid var(--line); }
  .bloco-topo { display: flex; align-items: baseline; gap: 12px; }
  .rotulo { font-family: var(--mono); font-size: 11px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--muted); }
  .conta { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .copiar { margin-left: auto; font-family: var(--mono); font-size: 11px;
    letter-spacing: .06em; color: var(--accent); background: none; cursor: pointer;
    border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
    border-radius: 2px; padding: 3px 10px; transition: background .15s, color .15s; }
  .copiar:hover { background: color-mix(in srgb, var(--accent) 12%, transparent); }
  .copiar[data-feito="1"] { color: var(--pilar);
    border-color: color-mix(in srgb, var(--pilar) 45%, transparent); }
  .copiar:focus-visible, .feitos input:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px; }
  .corpo { margin: 0; max-width: 66ch; }
  .corpo + .corpo { margin-top: .7em; }

  .rodape { border-top: 1px solid var(--line); padding-top: 24px;
    font-family: var(--mono); font-size: 12.5px; color: var(--muted);
    display: flex; flex-direction: column; gap: 8px; }
  .rodape b { color: var(--ink); font-weight: 400; }

  @media (max-width: 720px) {
    .post-corpo { grid-template-columns: 1fr; gap: 20px; }
    .arte { max-width: 300px; }
    .folha { padding: 36px 16px 72px; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>

<div class="folha">
  <header class="capa">
    <p class="sobrenome">Frases sobre pinturas · lote 01</p>
    <h1>Dez posts prontos para publicar</h1>
    <p class="resumo">Cada post é um <b>vídeo de cinco segundos</b> — uma pintura a óleo
      animada com a frase queimada em Itim. Os arquivos estão em <b>conta-frases/final/</b>;
      esta página guarda a arte, o texto e os dados de cada pin. A ordem já alterna os
      pilares: publique de 01 a 10, cinco por semana.</p>
    <div class="fichas">
      <span>Instagram <b>1080×1350 · 24 fps · 5 s</b></span>
      <span>Pinterest <b>1000×1500</b></span>
      <span>Fonte <b>Itim</b></span>
    </div>
    <p class="andamento" id="andamento">0 de 20 publicações marcadas</p>
  </header>

${entradas}

  <footer class="rodape">
    <p><b>Pinterest:</b> não jogue os dez de uma vez. Três a cinco pins por dia, sempre no
      board do pilar. Comece por 01, 08 e 10 — são os que funcionam fora de contexto.</p>
    <p><b>Trocar uma frase:</b> edite posts.json, rode <b>node overlay.js NN</b> e
      <b>.\\montar.ps1 -Only "NN"</b>. Nada precisa ser gerado de novo no Higgsfield.</p>
  </footer>
</div>

<script>
  var CHAVE = 'conta-frases-lote-01';
  var feitos = {};
  try { feitos = JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { feitos = {}; }

  function contar() {
    var n = 0;
    for (var k in feitos) { if (feitos[k]) n++; }
    document.getElementById('andamento').textContent =
      n + ' de 20 publicações marcadas';
  }

  document.querySelectorAll('[data-feito]').forEach(function (cx) {
    var id = cx.getAttribute('data-feito');
    cx.checked = !!feitos[id];
    cx.addEventListener('change', function () {
      feitos[id] = cx.checked;
      try { localStorage.setItem(CHAVE, JSON.stringify(feitos)); } catch (e) {}
      contar();
    });
  });
  contar();

  document.querySelectorAll('.copiar').forEach(function (b) {
    b.addEventListener('click', function () {
      var texto = b.getAttribute('data-copiar');
      var pronto = function () {
        b.textContent = 'copiado';
        b.setAttribute('data-feito', '1');
        setTimeout(function () {
          b.textContent = 'copiar';
          b.removeAttribute('data-feito');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(pronto, function () {
          b.textContent = 'selecione e copie';
        });
      } else {
        var t = document.createElement('textarea');
        t.value = texto; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); pronto(); } catch (e) {
          b.textContent = 'selecione e copie';
        }
        document.body.removeChild(t);
      }
    });
  });
</script>
`;

  // A pagina e embutida sem <head> proprio, entao nao da para declarar o charset.
  // Escapar todo caractere fora do ASCII em entidade numerica deixa os acentos
  // corretos qualquer que seja a codificacao assumida pelo navegador.
  const seguro = html.replace(/[^\x00-\x7F]/g, (c) => `&#${c.codePointAt(0)};`);

  fs.writeFileSync(`${ROOT}/publicacao.html`, seguro, 'utf8');
  console.log('publicacao.html:', (Buffer.byteLength(seguro) / 1024 / 1024).toFixed(2), 'MB');
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
