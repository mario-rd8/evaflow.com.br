/* main.js - Lógica interativa para EvaFlow.com.br */

document.addEventListener('DOMContentLoaded', () => {
  // Estrelas primeiro — antes de tudo, para não ser bloqueado por erro de outra função
  try { initHeroStars(); } catch(e) { console.error('[Stars] Erro:', e); }

  // Inicializa o Scroll Reveal (IntersectionObserver)
  try { initScrollReveal(); } catch(e) { console.error('[ScrollReveal] Erro:', e); }

  // Efeito dinâmico no Header ao rolar a página
  try { initHeaderScrollEffect(); } catch(e) { console.error('[Header] Erro:', e); }

  // Inicializa o carregamento inteligente e preguiçoso do vídeo demonstrativo
  try { initLazyVideo(); } catch(e) { console.error('[Video] Erro:', e); }

  // Inicializa as animações premium com GSAP
  try { initGSAPAnimations(); } catch(e) { console.error('[GSAP] Erro:', e); }
});

// Seletores do Modal
const modal = document.getElementById('leadModal');
const card = document.getElementById('modalCard');

// Rastreamento dinâmico de origem do clique do lead
let leadOrigem = 'Geral';

/**
 * Abre o modal de captura e registra a origem do clique
 * @param {string} origem - Seção de onde partiu o clique do usuário
 */
function openModal(origem) {
  if (!modal || !card) return;
  
  if (origem) {
    leadOrigem = origem;
  }

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  card.classList.remove('scale-95');
  card.classList.add('scale-100');
  
  // Foca no primeiro input
  const nomeInput = document.getElementById('nome');
  if (nomeInput) nomeInput.focus();
}

/**
 * Fecha o modal de captura
 */
function closeModal() {
  if (!modal || !card) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  card.classList.add('scale-95');
  card.classList.remove('scale-100');
}

// Fecha o modal ao clicar fora do card
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Efeito de Revelação ao Rolar a Página (Scroll Reveal)
 */
function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Desobserva o elemento após animar para melhor performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * Efeito sutil no cabeçalho ao rolar a página
 */
function initHeaderScrollEffect() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('bg-[#050505]/90', 'py-3', 'shadow-2xl', 'shadow-black/50');
      header.classList.remove('bg-[#050505]/70', 'py-4');
    } else {
      header.classList.add('bg-[#050505]/70', 'py-4');
      header.classList.remove('bg-[#050505]/90', 'py-3', 'shadow-2xl', 'shadow-black/50');
    }
  });
}

/**
 * Inicializa o carregamento dinâmico (lazy loading) e reprodução automática
 * silenciada do vídeo de demonstração do WhatsApp IA ao entrar na tela.
 */
function initLazyVideo() {
  const video = document.getElementById('whatsapp-demo-video');
  if (!video) return;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const source = video.querySelector('source');
        if (source && source.dataset.src) {
          source.src = source.dataset.src;
          video.load();
          video.muted = true; // Garante que o vídeo toque sem som
          
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('A reprodução automática silenciada do vídeo foi bloqueada:', error);
            });
          }
        }
        // Desobserva o elemento após carregar
        videoObserver.unobserve(video);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px 100px 0px', // Carrega o vídeo um pouco antes de entrar na viewport
    threshold: 0.05
  });

  videoObserver.observe(video);
}

/**
 * Envio do Formulário + Redirecionamento Direto para o WhatsApp
 */
async function handleSubmit(event) {
  event.preventDefault();
  
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');
  const submitBtn = document.getElementById('submitBtn');

  if (!nomeInput || !telefoneInput || !submitBtn) return;

  const nome = nomeInput.value;
  const telefone = telefoneInput.value;

  // Endpoint do Webhook no n8n
  const n8nWebhookUrl = 'https://n8n.evaflow.com.br/webhook/site-formulario';

  // Feedback visual instantâneo de envio
  submitBtn.disabled = true;
  const originalContent = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Redirecionando...</span>
  `;

  // Envio dos dados para o n8n
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout máximo

    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        telefone: telefone,
        origem: `${leadOrigem}-site-evaflow`,
        timestamp: new Date().toISOString()
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
  } catch (error) {
    console.warn('Registro no n8n pulado ou timeout atingido:', error);
  }

  // Redirecionamento imediato do lead para o WhatsApp com a mensagem simplificada
  const whatsappNumber = '5581988090458';
  const textMessage = encodeURIComponent("Olá Mário, vim do site EvaFlow e gostaria de uma conversa");
  
  // Executa o redirecionamento em uma nova aba
  window.open(`https://wa.me/${whatsappNumber}?text=${textMessage}`, '_blank');

  // Restaura o botão e fecha o modal na página atual
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalContent;
  closeModal();
  nomeInput.value = '';
  telefoneInput.value = '';
}

// Expõe as funções globalmente para serem chamadas nos botões inline
window.openModal = openModal;
window.closeModal = closeModal;
window.handleSubmit = handleSubmit;

/**
 * Inicializa todas as animações com GSAP e ScrollTrigger
 */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP ou ScrollTrigger não foram carregados.');
    return;
  }

  // Registra o plugin
  gsap.registerPlugin(ScrollTrigger);

  // 1. Animação de Entrada do Hero (Line/Mask Reveal no Load)
  gsap.to("#hero-section .reveal-child", {
    y: "0%",
    duration: 1.4,
    ease: "power4.out",
    stagger: 0.15,
    delay: 0.2
  });

  gsap.to("#hero-description", {
    opacity: 1,
    duration: 1.6,
    ease: "power2.out",
    delay: 0.6
  });



  // 2. Rolagem Horizontal (Showcase Pin)
  const container = document.getElementById("solucoes-container");
  const pinTarget = document.getElementById("solucoes-pin");
  let horizontalTween;
  
  if (container && pinTarget) {
    horizontalTween = gsap.to(container, {
      x: () => -(container.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: "#solucoes",
        pin: "#solucoes-pin",
        scrub: 1,
        start: "top top",
        end: () => "+=" + (container.scrollWidth - window.innerWidth),
        invalidateOnRefresh: true
      }
    });
  }

  // 3. Efeito de Revelação nos Títulos de Seção ao Rolar a Página (Vertical)
  // Usa o ID do hero em vez da classe min-h-screen para não excluir outras seções que também usam essa classe
  gsap.utils.toArray("section:not(#hero-section) .reveal-parent").forEach((parent) => {
    const children = parent.querySelectorAll(".reveal-child");
    if (children.length === 0) return;

    gsap.to(children, {
      y: "0%",
      duration: 1.2,
      ease: "power4.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: parent,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });

  // 4. Efeitos de Imagem por Painel ao Expor Horizontalmente
  if (horizontalTween) {
    gsap.utils.toArray("#solucoes .panel").forEach((panel) => {
      // Animação de fade-in na imagem/mockup do painel
      const media = panel.querySelector(".aspect-video video, .aspect-video img, .aspect-video > div");
      if (media) {
        gsap.set(media, { opacity: 0, scale: 0.95 });
        gsap.to(media, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontalTween,
            start: "left 60%",
            toggleActions: "play none none none"
          }
        });
      }
    });
  }
}

/**
 * Fundo estrelado com Parallax — versão final de produção
 * Canvas criado 100% via JS e injetado no body
 * Deve ser chamado ANTES do GSAP para evitar bloqueio por erro
 */
function initHeroStars() {
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-stars';

  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '5',          // Abaixo do header (z-40) e conteúdo (z-20), acima do fundo
    display: 'block',
    opacity: '1',
    transition: 'opacity 0.6s ease'
  });

  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error('[Stars] Contexto 2D indisponível.'); return; }

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    spawn();
  });

  // Paleta: branco, branco-azulado, ciano, roxo
  const PALETTE = [
    [255, 255, 255],
    [210, 240, 255],
    [0,   229, 255],
    [179, 136, 255],
  ];

  const COUNT = 200;
  const pts   = [];

  function spawn() {
    pts.length = 0;
    for (let i = 0; i < COUNT; i++) {
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      pts.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.0 + 0.3,          // 0.3px – 1.3px (muito pequenas)
        a:  Math.random() * 0.55 + 0.25,         // opacidade 0.25 – 0.8
        cr: c[0], cg: c[1], cb: c[2],
        px: Math.random() * 0.055 + 0.008        // fator parallax individual
      });
    }
  }

  spawn();

  // Parallax
  let mx = 0, my = 0, smx = 0, smy = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX - W / 2;
    my = e.clientY - H / 2;
  });

  // Oculta as estrelas quando o hero sai de cena
  const hero = document.getElementById('hero-section');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      canvas.style.opacity = entry.isIntersecting ? '1' : '0';
    }, { threshold: 0.01 }).observe(hero);
  }

  function draw() {
    requestAnimationFrame(draw);

    ctx.clearRect(0, 0, W, H);

    smx += (mx - smx) * 0.04;
    smy += (my - smy) * 0.04;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      ctx.beginPath();
      ctx.arc(p.x + smx * p.px, p.y + smy * p.px, p.r, 0, 6.2832);
      ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${p.a})`;
      ctx.fill();
    }
  }

  draw();
}



