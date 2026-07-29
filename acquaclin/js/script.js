// ============================================================
// Acquaclin — interações: header, reveal on scroll, FAQ,
// turmas (feature list) e simulação de conversa no WhatsApp
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header sólido ao rolar ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Turmas: item ativo na lista ---------- */
  document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.feature-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
  });

  /* ---------- Simulação de conversa no WhatsApp ---------- */
  const chatBody = document.getElementById('chatBody');
  const chatStatus = document.getElementById('chatStatus');

  const script = [
    { side: 'in',  text: 'Oi! Aqui é a Acquaclin 🏊 Como posso ajudar?', time: '09:14' },
    { side: 'out', text: 'Oi! Minha filha tem 3 anos e nunca fez natação, tem turma pra ela?', time: '09:15' },
    { side: 'in',  text: 'Tem sim! Ela entra na turma infantil, com avaliação de nível gratuita na primeira aula 😊', time: '09:15' },
    { side: 'in',  text: 'Quer marcar uma aula experimental grátis para conhecer a estrutura?', time: '09:16' },
    { side: 'out', text: 'Quero sim! Como funciona?', time: '09:17' },
    { side: 'in',  text: 'É só escolher um dia e horário que a gente já deixa reservado. Piscina é aquecida e coberta 💧', time: '09:17' },
  ];

  let step = 0;
  let timer = null;

  function typingBubble() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    return el;
  }

  function addBubble(msg) {
    const el = document.createElement('div');
    el.className = `bubble ${msg.side}`;
    el.innerHTML = `${msg.text}<time>${msg.time}</time>`;
    chatBody.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function runChatStep() {
    if (step >= script.length) {
      timer = setTimeout(() => {
        chatBody.innerHTML = '';
        step = 0;
        runChatStep();
      }, 2400);
      return;
    }

    const msg = script[step];

    if (msg.side === 'in') {
      chatStatus.textContent = 'digitando...';
      const typing = typingBubble();
      chatBody.appendChild(typing);
      requestAnimationFrame(() => typing.classList.add('show'));
      chatBody.scrollTop = chatBody.scrollHeight;

      timer = setTimeout(() => {
        typing.remove();
        chatStatus.textContent = 'online';
        addBubble(msg);
        step++;
        timer = setTimeout(runChatStep, 1100);
      }, 1300);
    } else {
      addBubble(msg);
      step++;
      timer = setTimeout(runChatStep, 1400);
    }
  }

  // Só inicia a simulação quando o mockup entra em tela
  const phoneMockup = document.querySelector('.phone-mockup');
  if (phoneMockup) {
    const chatIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !timer && step === 0 && chatBody.children.length === 0) {
          runChatStep();
        }
      });
    }, { threshold: 0.4 });
    chatIO.observe(phoneMockup);
  }
});
