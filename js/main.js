/* main.js - Lógica interativa para EvaFlow.com.br */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Scroll Reveal (IntersectionObserver)
  initScrollReveal();

  // Efeito dinâmico no Header ao rolar a página
  initHeaderScrollEffect();

  // Inicializa o carregamento inteligente e preguiçoso do vídeo demonstrativo
  initLazyVideo();
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

  // Endpoint do Webhook no n8n (configurado e pronto para uso futuro)
  const n8nWebhookUrl = 'https://n8n.forcaisoladas.com.br/webhook/site-formulario';

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

  // === CHAMADA DO WEBHOOK DO N8N (Comentada temporariamente a pedido do usuário) ===
  // Para ativar o salvamento automático no Supabase/n8n no futuro, basta descomentar este bloco try-catch:
  /*
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout máximo

    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        telefone: telefone,
        origem: leadOrigem,
        timestamp: new Date().toISOString()
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
  } catch (error) {
    console.warn('Registro no n8n pulado ou timeout atingido:', error);
  }
  */

  // Redirecionamento imediato do lead para o WhatsApp com a mensagem simplificada
  const whatsappNumber = '5581988090458';
  const textMessage = encodeURIComponent("Olá Mário, vim do site EvaFlow e gostaria de uma conversa");
  
  // Executa o redirecionamento
  window.location.href = `https://wa.me/${whatsappNumber}?text=${textMessage}`;
}

// Expõe as funções globalmente para serem chamadas nos botões inline
window.openModal = openModal;
window.closeModal = closeModal;
window.handleSubmit = handleSubmit;


