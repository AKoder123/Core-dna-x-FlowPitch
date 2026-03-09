const deck = document.getElementById('deck');
const dots = document.getElementById('dots');
const progressBar = document.getElementById('progressBar');
const topbar = document.getElementById('topbar');
const slideTemplate = document.getElementById('slideTemplate');
const exportPdfBtn = document.getElementById('exportPdfBtn');

let slidesData = [];
let slideEls = [];
let currentIndex = 0;
let observer;

const KICKERS = {
  title: 'Integration vision',
  content: 'Core narrative',
  beforeAfter: 'Before / after',
  closing: 'Next move'
};

async function loadContent() {
  const response = await fetch('content.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to load content.json (${response.status})`);
  return response.json();
}

function setTopOffset() {
  const h = topbar.offsetHeight || 96;
  document.documentElement.style.setProperty('--topOffset', `${h}px`);
}

function setCompactMode() {
  document.body.classList.toggle('compact', window.innerHeight < 820);
}

function createBulletList(items = []) {
  const ul = document.createElement('ul');
  ul.className = 'bullet-list';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    li.setAttribute('data-animate', '');
    ul.appendChild(li);
  });
  return ul;
}

function createSideRail(index, slide) {
  const rail = document.createElement('aside');
  rail.className = 'side-rail';
  rail.setAttribute('data-animate', '');

  if (index === 0) {
    rail.innerHTML = `
      <div class="metric-grid">
        <div class="metric-card" data-animate>
          <div class="metric-value">1</div>
          <div class="metric-label">content engine</div>
        </div>
        <div class="metric-card" data-animate>
          <div class="metric-value">∞</div>
          <div class="metric-label">audience variants</div>
        </div>
      </div>
      <div class="orbit-card" data-animate>
        <h3>Story in motion</h3>
        <p>Use web-native transitions, layered cards, and live interactions to make a presentation feel more like a product demo.</p>
      </div>
      <div class="orbit-visual" data-animate>
        <div class="orbit-ring r1"></div>
        <div class="orbit-ring r2"></div>
        <div class="orbit-center">FlowPitch<br/>engine</div>
        <div class="orbit-node n1">Core dna theme</div>
        <div class="orbit-node n2">Audience logic</div>
        <div class="orbit-node n3">PDF export</div>
        <div class="orbit-node n4">Live webpage deck</div>
      </div>
    `;
    return rail;
  }

  if (index === 4) {
    rail.innerHTML = `
      <div class="diagram-card" data-animate>
        <h3>Workflow view</h3>
        <div class="diagram">
          <div class="diagram-step"><div class="step-dot">1</div><span>Source approved content</span></div>
          <div class="diagram-step"><div class="step-dot">2</div><span>Apply audience rules</span></div>
          <div class="diagram-step"><div class="step-dot">3</div><span>Generate narrative</span></div>
          <div class="diagram-step"><div class="step-dot">4</div><span>Render deck and PDF</span></div>
        </div>
      </div>
      <div class="mini-card" data-animate>
        <h3>Why Core dna matters</h3>
        <p>It already houses the structured content, assets, workflows, and orchestration layer that make generation useful at enterprise scale.</p>
      </div>
    `;
    return rail;
  }

  if (index === 5) {
    rail.innerHTML = `
      <div class="brand-morph" data-animate>
        <div class="brand-lane"></div>
        <div class="brand-token-row">
          <div class="brand-chip">tokens</div>
          <div class="brand-chip">layout</div>
          <div class="brand-chip">motion</div>
          <div class="brand-chip">voice</div>
        </div>
        <div class="brand-panels">
          <div class="brand-panel core">
            <strong>Core dna mode</strong>
            <span>Dark platform feel, red signal accents, product-first energy.</span>
          </div>
          <div class="brand-panel anz">
            <strong>ANZ mode</strong>
            <span>Calmer blue system, executive-ready framing, banking context emphasis.</span>
          </div>
        </div>
      </div>
      <div class="mini-card" data-animate>
        <h3>Demonstration value</h3>
        <p>The same source material can look native in another organisation's brand without rebuilding every slide by hand.</p>
      </div>
    `;
    return rail;
  }

  if (index === 9) {
    rail.innerHTML = `
      <div class="metric-grid">
        <div class="metric-card" data-animate>
          <div class="metric-value">3</div>
          <div class="metric-label">entry models</div>
        </div>
        <div class="metric-card" data-animate>
          <div class="metric-value">1</div>
          <div class="metric-label">ecosystem story</div>
        </div>
      </div>
      <div class="mini-card" data-animate>
        <h3>Commercial framing</h3>
        <p>FlowPitch can start as enablement software, become an ecosystem extension, then mature into a deeper platform relationship.</p>
      </div>
    `;
    return rail;
  }

  rail.innerHTML = `
    <div class="metric-grid">
      <div class="metric-card" data-animate>
        <div class="metric-value">Fast</div>
        <div class="metric-label">turnaround</div>
      </div>
      <div class="metric-card" data-animate>
        <div class="metric-value">Native</div>
        <div class="metric-label">brand feel</div>
      </div>
    </div>
    <div class="mini-card" data-animate>
      <h3>Audience-first output</h3>
      <p>${slide.subheadline || 'Keep the content foundation stable while changing framing, depth, and visual treatment by audience.'}</p>
    </div>
    <div class="mini-card" data-animate>
      <h3>Core dna fit</h3>
      <p>Presentation generation becomes more powerful when it starts from governed content and reusable design logic.</p>
    </div>
  `;
  return rail;
}

function buildContentSlide(slide, index) {
  const fragment = document.createDocumentFragment();

  const panel = document.createElement('div');
  panel.className = 'info-panel';
  panel.setAttribute('data-animate', '');
  panel.appendChild(createBulletList(slide.bullets || []));

  fragment.appendChild(panel);
  fragment.appendChild(createSideRail(index, slide));
  return fragment;
}

function buildBeforeAfterSlide(slide) {
  const wrap = document.createElement('div');
  wrap.className = 'compare-wrap';

  const left = document.createElement('article');
  left.className = 'compare-col before';
  left.setAttribute('data-animate', '');
  left.innerHTML = `
    <div class="compare-label">${slide.left?.title || 'Before'}</div>
    <h3>${slide.left?.title || ''}</h3>
  `;
  left.appendChild(createBulletList(slide.left?.bullets || []));

  const right = document.createElement('article');
  right.className = 'compare-col after';
  right.setAttribute('data-animate', '');
  right.innerHTML = `
    <div class="compare-label">${slide.right?.title || 'After'}</div>
    <h3>${slide.right?.title || ''}</h3>
  `;
  right.appendChild(createBulletList(slide.right?.bullets || []));

  wrap.append(left, right);
  return wrap;
}

function buildClosingSlide(slide) {
  const wrap = document.createElement('div');
  wrap.className = 'closing-panel';

  const left = document.createElement('div');
  left.className = 'info-panel';
  left.setAttribute('data-animate', '');
  left.appendChild(createBulletList(slide.bullets || []));

  const right = document.createElement('div');
  right.className = 'cta-box';
  right.setAttribute('data-animate', '');
  right.innerHTML = `
    <h3 class="cta-title">What to show next</h3>
    <p class="cta-copy">Use Core dna website content and assets to generate a live demo, then switch the exact same deck into an ANZ-flavoured version to prove the value proposition.</p>
    <div class="cta-actions">
      <span class="cta-button">Pilot concept</span>
      <span class="cta-button alt">Ecosystem add-on</span>
    </div>
  `;

  wrap.append(left, right);
  return wrap;
}

function renderDeck(content) {
  deck.innerHTML = '';
  dots.innerHTML = '';
  slidesData = content.slides || [];
  document.title = content.meta?.title || 'Presentation';

  slidesData.forEach((slide, index) => {
    const node = slideTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = index;
    node.dataset.type = slide.type;

    node.querySelector('.slide-kicker').textContent = KICKERS[slide.type] || 'Slide';
    node.querySelector('.slide-headline').textContent = slide.headline || '';
    node.querySelector('.slide-subheadline').textContent = slide.subheadline || '';

    const body = node.querySelector('[data-body]');

    if (slide.type === 'beforeAfter') {
      body.style.gridTemplateColumns = '1fr';
      body.appendChild(buildBeforeAfterSlide(slide));
    } else if (slide.type === 'closing') {
      body.style.gridTemplateColumns = '1fr';
      body.appendChild(buildClosingSlide(slide));
    } else {
      body.appendChild(buildContentSlide(slide, index));
    }

    deck.appendChild(node);

    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dots.appendChild(dot);
  });

  slideEls = Array.from(deck.querySelectorAll('[data-slide]'));
  setCompactMode();
  setTopOffset();
  setupObserver();
  updateActiveState(0);
}

function setupObserver() {
  observer?.disconnect?.();
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Number(entry.target.dataset.index);
        updateActiveState(index);
      }
    });
  }, {
    root: deck,
    threshold: 0.6
  });

  slideEls.forEach((slide) => observer.observe(slide));
}

function updateActiveState(index) {
  currentIndex = Math.max(0, Math.min(index, slideEls.length - 1));
  slideEls.forEach((slide, i) => slide.classList.toggle('is-active', i === currentIndex));
  Array.from(dots.children).forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  const width = slideEls.length ? ((currentIndex + 1) / slideEls.length) * 100 : 0;
  progressBar.style.width = `${width}%`;
  document.body.classList.toggle('theme-anz', currentIndex >= 5);
}

function goToSlide(index) {
  const target = slideEls[index];
  if (!target) return;
  updateActiveState(index);
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goBy(delta) {
  goToSlide(currentIndex + delta);
}

function handleKeys(event) {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

  if (event.code === 'Space') {
    event.preventDefault();
    goBy(event.shiftKey ? -1 : 1);
  } else if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) {
    event.preventDefault();
    goBy(1);
  } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goBy(-1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    goToSlide(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    goToSlide(slideEls.length - 1);
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensurePdfLibs() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error('PDF libraries not available');
  }
}

function createPdfStage(slideEl) {
  const stage = document.createElement('div');
  stage.id = 'pdfStage';

  const bgClone = document.querySelector('.bg').cloneNode(true);
  stage.appendChild(bgClone);

  const slideClone = slideEl.cloneNode(true);
  slideClone.classList.add('is-active');
  slideClone.querySelectorAll('[data-animate]').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
    el.style.transition = 'none';
  });

  stage.appendChild(slideClone);
  document.body.appendChild(stage);
  return stage;
}

async function setupPdfExport() {
  exportPdfBtn.addEventListener('click', async () => {
    const originalLabel = exportPdfBtn.textContent;
    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = 'Exporting…';

    try {
      await ensurePdfLibs();
      document.body.classList.add('exportingPdf');
      slideEls.forEach((slide) => slide.classList.add('is-active'));

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });

      for (let i = 0; i < slideEls.length; i += 1) {
        const stage = createPdfStage(slideEls[i]);
        const canvas = await window.html2canvas(stage, {
          backgroundColor: '#050611',
          scale: Math.max(window.devicePixelRatio || 1, 2),
          useCORS: true,
          width: 1920,
          height: 1080,
          windowWidth: 1920,
          windowHeight: 1080,
          scrollX: 0,
          scrollY: 0
        });

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080, undefined, 'FAST');
        stage.remove();
      }

      pdf.save('FlowPitch.pdf');
    } catch (error) {
      console.error(error);
      alert('PDF export could not start. Please allow cdnjs.cloudflare.com, or self-host html2canvas and jsPDF locally.');
    } finally {
      document.body.classList.remove('exportingPdf');
      slideEls.forEach((slide) => slide.classList.toggle('is-active', Number(slide.dataset.index) === currentIndex));
      exportPdfBtn.disabled = false;
      exportPdfBtn.textContent = originalLabel;
    }
  });
}

async function init() {
  try {
    const content = await loadContent();
    renderDeck(content);
    setupPdfExport();
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('resize', () => {
      setTopOffset();
      setCompactMode();
    });
    deck.addEventListener('scroll', () => {
      const nearest = slideEls.reduce((best, slide, index) => {
        const distance = Math.abs(slide.offsetTop - deck.scrollTop);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Number.POSITIVE_INFINITY });
      if (nearest.index !== currentIndex) updateActiveState(nearest.index);
    }, { passive: true });
  } catch (error) {
    deck.innerHTML = `
      <section class="slide">
        <div class="slide-shell">
          <div class="slide-kicker">Load error</div>
          <h1 class="slide-headline">Could not load content.json</h1>
          <p class="slide-subheadline">If you opened this file directly and your browser blocks local JSON fetches, run the folder through a simple local server. Everything else in the deck is ready.</p>
        </div>
      </section>
    `;
    console.error(error);
  }
}

init();
