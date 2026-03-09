/* ============================================================
   FlowPitch × Core dna — app.js
   ============================================================ */

let slides = [];
let currentIndex = 0;

// ---- Boot ----
document.addEventListener('DOMContentLoaded', async () => {
  const data = await fetch('content.json').then(r => r.json());
  buildNav(data);
  renderSlides(data);
  setupNav(data);
  updateNav();
  setupPdfExport(data);
  document.addEventListener('keydown', handleKey);
  document.getElementById('topNav').style.setProperty('--topOffset', '64px');
});

// ---- Build Nav Brand ----
function buildNav(data) {
  const brand = document.getElementById('navBrand');
  if (brand) brand.textContent = data.meta.title;
  const total = document.getElementById('slideTotal');
  if (total) total.textContent = data.slides.length;
}

// ---- Render Slides ----
function renderSlides(data) {
  const container = document.getElementById('slideContainer');
  const dotsContainer = document.getElementById('progressDots');
  container.innerHTML = '';
  dotsContainer.innerHTML = '';

  data.slides.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'slide';
    el.dataset.index = i;
    el.dataset.theme = s.theme || 'coredna';
    el.innerHTML = buildSlideHTML(s);
    container.appendChild(el);

    // dot
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  slides = Array.from(container.querySelectorAll('.slide'));
  activateSlide(0);
}

// ---- Build Slide HTML ----
function buildSlideHTML(s) {
  switch (s.type) {
    case 'title':       return titleSlide(s);
    case 'problem':     return problemSlide(s);
    case 'solution':    return contentSlide(s, 'Solution');
    case 'howItWorks':  return stepsSlide(s);
    case 'themeDemo':   return morphSlide(s);
    case 'anzDemo':     return contentSlide(s, 'FlowPitch Demo');
    case 'keyBenefit':  return benefitSlide(s);
    case 'useCases':    return useCasesSlide(s);
    case 'positioning': return positioningSlide(s);
    case 'closing':     return closingSlide(s);
    default:            return contentSlide(s, '');
  }
}

// ---- Slide Templates ----

function titleSlide(s) {
  return `
    <div class="title-slide" style="position:relative;z-index:1;width:100%;">
      <span class="title-tag" data-animate>Partnership Pitch · 2026</span>
      <div class="title-bigtext" data-animate>
        <span class="brand-fp">FlowPitch</span>
        <span class="x-connector"> × </span>
        <span class="brand-cdna grad">Core dna</span>
      </div>
      <div class="slide-sub" data-animate style="max-width:680px;">${s.subheadline}</div>
      <div class="title-note" data-animate>${s.note || ''}</div>
    </div>`;
}

function problemSlide(s) {
  return `
    <div style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>The Gap</div>
      <div class="slide-headline" data-animate>${s.headline}</div>
      <div class="slide-sub" data-animate>${s.subheadline}</div>
      <ul class="bullet-list" data-animate>
        ${s.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>`;
}

function contentSlide(s, label) {
  return `
    <div style="position:relative;z-index:1;width:100%;">
      ${label ? `<div class="slide-label" data-animate>${label}</div>` : ''}
      <div class="slide-headline" data-animate>${s.headline}</div>
      <div class="slide-sub" data-animate>${s.subheadline}</div>
      <ul class="bullet-list" data-animate>
        ${(s.bullets || []).map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>`;
}

function stepsSlide(s) {
  return `
    <div style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>Process</div>
      <div class="slide-headline" data-animate>${s.headline}</div>
      <div class="slide-sub" data-animate>${s.subheadline}</div>
      <div class="steps-row" data-animate>
        ${s.steps.map(step => `
          <div class="step-item">
            <div class="step-num">${step.num}</div>
            <div class="step-label">${step.label}</div>
            <div class="step-desc">${step.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function morphSlide(s) {
  return `
    <div class="morph-center" style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>Live Demo</div>
      <div class="slide-headline" data-animate style="text-align:center;max-width:760px;">${s.headline}</div>
      <div class="morph-visual" data-animate>
        <div class="morph-brand">
          <div class="morph-swatch cdna">Core dna</div>
          <div class="morph-label">Origin Theme</div>
        </div>
        <div class="morph-arrow">→</div>
        <div style="text-align:center;">
          <div style="width:80px;height:80px;border-radius:16px;background:linear-gradient(135deg,#0a0f1e,#00c2cb,#001f6b,#00adef);background-size:300%;animation:morphGrad 3s ease infinite;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.8);">FlowPitch</div>
          <div class="morph-label">Engine</div>
        </div>
        <div class="morph-arrow">→</div>
        <div class="morph-brand">
          <div class="morph-swatch anz">ANZ</div>
          <div class="morph-label">Target Brand</div>
        </div>
      </div>
      <div class="morph-tagline" data-animate>${s.subheadline}</div>
      <div class="morph-note" data-animate>${s.note}</div>
    </div>
    <style>
      @keyframes morphGrad {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    </style>`;
}

function benefitSlide(s) {
  return `
    <div style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>Key Benefits</div>
      <div class="slide-headline" data-animate>${s.headline}</div>
      <div class="slide-sub" data-animate>${s.subheadline}</div>
      <div class="benefit-row" data-animate>
        <div class="benefit-card">
          <div class="benefit-number">01</div>
          <div class="benefit-title">${s.benefitLeft.title}</div>
          <div class="benefit-desc">${s.benefitLeft.desc}</div>
        </div>
        <div class="benefit-card">
          <div class="benefit-number">02</div>
          <div class="benefit-title">${s.benefitRight.title}</div>
          <div class="benefit-desc">${s.benefitRight.desc}</div>
        </div>
      </div>
    </div>`;
}

function useCasesSlide(s) {
  return `
    <div style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>Use Cases</div>
      <div class="slide-headline" data-animate>${s.headline}</div>
      <div class="slide-sub" data-animate>${s.subheadline}</div>
      <div class="card-grid four-col" data-animate>
        ${s.cases.map(c => `
          <div class="card">
            <div class="card-icon">${c.icon}</div>
            <div class="card-label">${c.label}</div>
            <div class="card-desc">${c.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function positioningSlide(s) {
  return `
    <div style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>Positioning</div>
      <div class="slide-headline" data-animate>${s.headline}</div>
      <div class="slide-sub" data-animate>${s.subheadline}</div>
      <div class="split-cols" data-animate>
        <div class="split-card">
          <div class="split-title">
            <span class="dot"></span>
            ${s.left.title}
          </div>
          <ul class="bullet-list">
            ${s.left.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
        <div class="split-card highlight">
          <div class="split-title">
            <span class="dot"></span>
            ${s.right.title}
          </div>
          <ul class="bullet-list">
            ${s.right.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="split-note" data-animate>${s.note || ''}</div>
    </div>`;
}

function closingSlide(s) {
  return `
    <div class="closing-slide" style="position:relative;z-index:1;width:100%;">
      <div class="slide-label" data-animate>What's Next</div>
      <div class="closing-bigline" data-animate>
        ${s.headline.replace('Personalization', '<em>Personalization</em>').replace('Revenue', '<em>Revenue</em>')}
      </div>
      <div class="slide-sub" data-animate style="max-width:640px;">${s.subheadline}</div>
      <div data-animate>
        <span class="cta-btn">${s.cta} →</span>
      </div>
      <div class="closing-tagline" data-animate>"${s.note}"</div>
    </div>`;
}

// ---- Navigation ----
function activateSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active', 'exit-left');
    if (i < index) slide.classList.add('exit-left');
  });

  if (slides[index]) {
    slides[index].classList.add('active');
  }

  // Update progress dots
  const dots = document.querySelectorAll('#progressDots .dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === index));

  // Update counter
  const counter = document.getElementById('slideCounter');
  if (counter) counter.textContent = index + 1;

  // Theme shift for nav
  const nav = document.getElementById('topNav');
  const brand = document.getElementById('navBrand');
  const theme = slides[index]?.dataset.theme;

  if (theme === 'anz' || theme === 'transition') {
    nav.classList.add('anz-theme');
    brand.classList.add('anz-theme');
    document.body.classList.add('anz-active');
  } else {
    nav.classList.remove('anz-theme');
    brand.classList.remove('anz-theme');
    document.body.classList.remove('anz-active');
  }
}

function goTo(index) {
  if (index < 0 || index >= slides.length) return;
  currentIndex = index;
  activateSlide(currentIndex);
  updateNav();
}

function updateNav() {
  const counter = document.getElementById('slideCounter');
  if (counter) counter.textContent = currentIndex + 1;
}

function setupNav(data) {
  // Swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  });
}

function handleKey(e) {
  if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) {
    e.preventDefault();
    goTo(currentIndex + 1);
  } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
    e.preventDefault();
    goTo(currentIndex - 1);
  }
}

// ---- PDF Export ----
function setupPdfExport(data) {
  const btn = document.getElementById('exportPdfBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Exporting…';

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    } catch (err) {
      alert('PDF export requires cdnjs.cloudflare.com to be reachable. Please ensure the domain is allowed.');
      btn.disabled = false;
      btn.textContent = 'Export PDF';
      return;
    }

    document.body.classList.add('exportingPdf');
    const savedIndex = currentIndex;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
    let firstPage = true;

    for (let i = 0; i < slides.length; i++) {
      // Activate slide for capture
      slides.forEach(s => { s.style.display = 'none'; });
      slides[i].style.display = 'flex';
      slides[i].classList.add('active');
      slides[i].querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      await new Promise(r => setTimeout(r, 120));

      const stage = document.createElement('div');
      stage.id = 'pdfStage';
      stage.style.cssText = 'position:fixed;left:-10000px;top:0;width:1920px;height:1080px;overflow:hidden;';
      stage.innerHTML = slides[i].outerHTML;

      // Style the cloned slide inside stage
      const clone = stage.querySelector('.slide');
      if (clone) {
        clone.style.cssText = 'position:relative;width:1920px;height:1080px;display:flex;opacity:1;transform:none;pointer-events:none;padding:90px 120px;';
        clone.querySelectorAll('[data-animate]').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.transition = 'none';
        });
      }

      document.body.appendChild(stage);

      const canvas = await window.html2canvas(stage, {
        backgroundColor: '#0a0f1e',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        width: 1920,
        height: 1080,
        windowWidth: 1920,
        windowHeight: 1080
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      if (!firstPage) pdf.addPage([1920, 1080], 'landscape');
      pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
      firstPage = false;

      document.body.removeChild(stage);
    }

    pdf.save('FlowPitch-CoreDNA.pdf');

    // Restore
    slides.forEach(s => { s.style.display = ''; });
    document.body.classList.remove('exportingPdf');
    goTo(savedIndex);

    btn.disabled = false;
    btn.textContent = 'Export PDF';
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
