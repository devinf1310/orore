// ============================================================
// lesson-engine.js — Version v4 (drapeau + galeries + cache-busting)
// Charge YAML + SVG carte + remplit tous les onglets
// ============================================================

console.log("[Orore] lesson-engine.js — v4 chargé (drapeau + galeries)");

let LESSON_DATA = null;  // Données YAML stockées pour usage global

// ============================================================
// CHARGEMENT INITIAL
// ============================================================
(async function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('id') || 'china';

    // 1. Charger le YAML (avec cache-busting)
    const yamlRes = await fetch(`lessons/${lessonId}/config.yaml?v=4`);
    if (!yamlRes.ok) throw new Error("YAML introuvable: " + yamlRes.status);
    const data = jsyaml.load(await yamlRes.text());
    LESSON_DATA = data.lesson;
    console.log("[Orore] YAML chargé:", LESSON_DATA.id, "-", LESSON_DATA.title);
    console.log("[Orore] Hotspots détectés:", (LESSON_DATA.hotspots || []).length);

    // 2. Remplir l'entête
    fillHeader();

    // 3. Remplir les key facts
    fillKeyFacts();

    // 4. Charger la carte SVG
    await loadChinaMap();

    // 5. Remplir tous les onglets
    fillPronunciations();
    fillPersonalities();
    fillCuisine();
    fillTraditions();
    fillTimeline();
    fillQuiz();

    // 5b. Charger le drapeau SVG + brancher le popup
    await loadFlag();

    // 6. Brancher les onglets, le mode présentation, etc.
    setupTabs();
    setupPresentationMode();
    setupDetailModal();

    // 7. Convertir les emojis en Twemoji pour rendu uniforme
    convertEmojisToTwemoji();

    console.log("[Orore] Leçon prête.");
  } catch (err) {
    console.error("[Orore] Erreur chargement leçon:", err);
    const titleEl = document.getElementById('lesson-title');
    if (titleEl) titleEl.textContent = "Erreur de chargement";
  }
})();

// ============================================================
// HEADER + KEY FACTS
// ============================================================
function fillHeader() {
  document.getElementById('lesson-title').textContent = LESSON_DATA.title;
  document.getElementById('lesson-subtitle').textContent = LESSON_DATA.intro.subtitle;
  // Le drapeau est chargé séparément en SVG via loadFlag()
}

// ============================================================
// DRAPEAU SVG + POPUP (symbolique + hymne)
// ============================================================
async function loadFlag() {
  const target = document.getElementById('flag-svg-target');
  const badge = document.getElementById('lesson-flag');
  if (!target) return;

  try {
    const res = await fetch('assets/flag-china.svg?v=4');
    if (res.ok) {
      target.innerHTML = await res.text();
      const svg = target.querySelector('svg');
      if (svg) { svg.style.width = '100%'; svg.style.height = '100%'; }
    }
  } catch (e) {
    console.warn("[Orore] Drapeau SVG non chargé:", e);
  }

  // Clic → popup drapeau
  if (badge) {
    badge.addEventListener('click', showFlagDetail);
  }
}

function showFlagDetail() {
  const flag = LESSON_DATA.intro.flag || {};
  const anthem = LESSON_DATA.intro.anthem || {};

  const symbolismList = (flag.symbolism || [])
    .map(s => `<li>${s}</li>`).join('');

  const anthemBlock = anthem.name ? `
    <div class="anthem-block">
      <h4>🎵 L'hymne national</h4>
      <p class="anthem-name">${anthem.name} <span class="anthem-chinese">${anthem.chinese || ''}</span></p>
      ${anthem.pinyin ? `<p class="pinyin">${anthem.pinyin}</p>` : ''}
      <p class="anthem-desc">${anthem.description || ''}</p>
      <audio controls preload="none" class="anthem-audio">
        <source src="lessons/china/audio/${anthem.audio}" type="audio/mpeg">
        Ton navigateur ne peut pas lire l'audio.
      </audio>
      <p class="anthem-note">✦ Si l'hymne ne se lance pas, le fichier audio n'est pas encore ajouté.</p>
    </div>
  ` : '';

  const body = `
    <div class="flag-detail">
      <div class="flag-large" id="flag-large"></div>
      <h3>${flag.name || 'Le drapeau'}</h3>
      ${flag.adopted ? `<p class="flag-adopted">${flag.adopted}</p>` : ''}
      <h4>Que signifie ce drapeau ?</h4>
      <ul class="flag-symbolism">${symbolismList}</ul>
      ${flag.fun_fact ? `<div class="anecdote">${flag.fun_fact}</div>` : ''}
      ${anthemBlock}
    </div>
  `;

  openDetailModal(body);

  // Injecte le drapeau en grand dans la popup
  fetch('assets/flag-china.svg?v=4')
    .then(r => r.text())
    .then(svg => {
      const target = document.getElementById('flag-large');
      if (target) target.innerHTML = svg;
    })
    .catch(() => {});
}

function fillKeyFacts() {
  const container = document.getElementById('key-facts');
  if (!container || !LESSON_DATA.intro?.key_facts) return;

  container.innerHTML = LESSON_DATA.intro.key_facts.map(f => `
    <div class="key-fact">
      <div class="icon">${f.icon || '✦'}</div>
      <div class="label">${f.label}</div>
      <div class="value">${f.value}</div>
      ${f.comment ? `<div class="comment">${f.comment}</div>` : ''}
    </div>
  `).join('');
}

// ============================================================
// CARTE DE LA CHINE + HOTSPOTS
// ============================================================
async function loadChinaMap() {
  const mapTarget = document.getElementById('china-map-target');
  if (!mapTarget) return;

  try {
    const mapRes = await fetch('assets/china-map.svg?v=4');
    if (!mapRes.ok) throw new Error("Carte introuvable");
    mapTarget.innerHTML = await mapRes.text();

    const svg = mapTarget.querySelector('svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '70vh';
    }

    // Branchement des hotspots
    const markers = mapTarget.querySelectorAll('.hotspot-marker');
    markers.forEach(marker => {
      marker.addEventListener('click', () => {
        const hotspotId = marker.getAttribute('data-hotspot-id');
        const hotspot = (LESSON_DATA.hotspots || []).find(h => h.id === hotspotId);
        if (!hotspot) {
          console.warn("[Orore] Hotspot introuvable dans YAML:", hotspotId);
          return;
        }
        showHotspot(hotspot);
        markers.forEach(m => m.classList.remove('active'));
        marker.classList.add('active');
      });
    });
    console.log("[Orore] Carte Chine chargée,", markers.length, "hotspots branchés");
  } catch (e) {
    console.error("[Orore] Carte Chine échec:", e);
    mapTarget.innerHTML = '<p style="text-align:center; color:var(--terracotta); padding:2rem;">Carte indisponible</p>';
  }
}

function showHotspot(h) {
  const panel = document.getElementById('hotspot-panel');
  if (!panel) return;

  const c = h.content || {};
  const images = (c.images || []).map(img =>
    `<div class="image-placeholder">${img.caption || h.name}</div>`
  ).join('');

  const pronunciationBtn = h.pinyin ? `
    <button class="btn btn-outline" style="margin-top: 1rem; padding: 0.6rem 1.25rem; font-size: 0.85rem;"
            onclick="speakChinese('${(h.chinese_name || h.name).replace(/'/g, "\\'")}')">
      🔊 Écouter en chinois
    </button>
  ` : '';

  panel.classList.remove('empty');
  panel.innerHTML = `
    <div style="margin-bottom: 0.5rem;">
      <h3>${c.title || h.name}</h3>
      ${h.chinese_name ? `<div class="chinese-name">${h.chinese_name}</div>` : ''}
      ${h.pinyin ? `<div class="pinyin">${h.pinyin}</div>` : ''}
    </div>
    ${c.intro ? `<p class="intro-text">${c.intro}</p>` : ''}
    ${images}
    ${c.key_points ? `<ul class="key-points">${c.key_points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
    ${c.anecdote ? `<div class="anecdote">${c.anecdote}</div>` : ''}
    ${pronunciationBtn}
  `;

  // Convertir d'éventuels emojis injectés
  convertEmojisToTwemoji(panel);

  // Anim douce d'apparition
  panel.style.animation = 'none';
  setTimeout(() => panel.style.animation = 'fadeIn 0.4s var(--ease)', 10);
}

// ============================================================
// ONGLET PRONONCIATIONS — Web Speech API (zh-CN)
// ============================================================
function fillPronunciations() {
  const container = document.getElementById('pronunciations-list');
  if (!container || !LESSON_DATA.pronunciations) return;

  container.innerHTML = LESSON_DATA.pronunciations.map((p, i) => `
    <div class="pronunciation-card">
      <button class="play-btn" onclick="speakChinese('${p.chinese.replace(/'/g, "\\'")}', this)" aria-label="Écouter">
        ▶
      </button>
      <div style="flex: 1;">
        <div class="french">${p.french}</div>
        <div class="chinese">${p.chinese}</div>
        <div class="pinyin">${p.pinyin}</div>
        ${p.note ? `<div style="font-family: var(--font-display); font-style: italic; font-size: 0.8rem; color: var(--ochre-dark); margin-top: 0.25rem;">${p.note}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// Synthèse vocale chinois via Web Speech API (gratuit, navigateur)
function speakChinese(text, btn) {
  if (!('speechSynthesis' in window)) {
    alert("Désolé, votre navigateur ne supporte pas la synthèse vocale.");
    return;
  }

  // Stop si en cours
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.8;
  utter.pitch = 1.0;

  // Trouve une voix chinoise si dispo
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh'));
  if (zhVoice) utter.voice = zhVoice;

  if (btn) {
    btn.textContent = '⏸';
    btn.style.background = 'var(--terracotta)';
    utter.onend = () => {
      btn.textContent = '▶';
      btn.style.background = '';
    };
    utter.onerror = () => {
      btn.textContent = '▶';
      btn.style.background = '';
    };
  }

  window.speechSynthesis.speak(utter);
}

// Pré-charge les voix (certains navigateurs ont besoin d'un tick)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    console.log("[Orore] Voix synthèse chargées:",
      window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('zh')).length, "chinoises");
  };
}

// ============================================================
// ONGLET PERSONNAGES — Tableau 4 colonnes × 3
// ============================================================
function fillPersonalities() {
  const container = document.getElementById('personalities-table');
  if (!container || !LESSON_DATA.personalities) return;

  const themes = LESSON_DATA.personalities.themes || [];

  container.innerHTML = themes.map(theme => `
    <div class="personality-column">
      <div class="personality-column-header">
        <span class="theme-icon">${theme.icon}</span>
        <span class="theme-title">${theme.title}</span>
      </div>
      <div class="personality-cards">
        ${theme.people.map(p => `
          <div class="personality-card" data-person-id="${p.id}" onclick="showPersonDetail('${p.id}')">
            <div class="personality-photo">
              <div class="photo-placeholder" data-initials="${getInitials(p.name)}"></div>
            </div>
            <div class="personality-name">${p.name}</div>
            <div class="personality-role">${p.role}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  const tableEl = document.getElementById('personalities-table');
  if (tableEl) convertEmojisToTwemoji(tableEl);
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function findPerson(personId) {
  for (const theme of (LESSON_DATA.personalities?.themes || [])) {
    const p = theme.people.find(x => x.id === personId);
    if (p) return p;
  }
  return null;
}

function showPersonDetail(personId) {
  const p = findPerson(personId);
  if (!p) { console.warn("[Orore] Personnage introuvable:", personId); return; }

  const detailsList = (p.details || []).map(d => `<li>${d}</li>`).join('');

  const body = `
    <div class="person-detail">
      <div class="person-detail-photo">
        <div class="photo-placeholder-large" data-initials="${getInitials(p.name)}"></div>
        <img src="lessons/china/assets/${p.image}" alt="${p.name}"
             onload="this.previousElementSibling.style.display='none'; this.style.display='block';"
             onerror="this.style.display='none';" style="display:none;" />
      </div>
      <div class="person-detail-info">
        <h3>${p.name}</h3>
        ${p.chinese ? `<div class="chinese-name">${p.chinese}</div>` : ''}
        <div class="person-role">${p.role} · ${p.dates}</div>
        <p class="intro-text">${p.intro}</p>
        <ul class="key-points">${detailsList}</ul>
        ${p.fun_fact ? `<div class="anecdote">${p.fun_fact}</div>` : ''}
        <button class="btn btn-gold" style="margin-top:1rem;" onclick="choosePerson('${p.id}')">
          ⭐ Je choisis ${p.name} pour mon exposé
        </button>
      </div>
    </div>
  `;
  openDetailModal(body);
}

function choosePerson(personId) {
  const p = findPerson(personId);
  if (!p) return;
  try { localStorage.setItem('orore_chosen_person', personId); } catch(e) {}
  closeDetailModal();
  // Petit feedback
  alert(`Super choix ! Tu vas présenter ${p.name}. N'oublie pas de le noter sur ta fiche !`);
}

// ============================================================
// ONGLET CUISINE — Galerie de plats
// ============================================================
function fillCuisine() {
  const container = document.getElementById('cuisine-grid');
  if (!container || !LESSON_DATA.cuisine) return;

  container.innerHTML = LESSON_DATA.cuisine.map(dish => `
    <div class="cuisine-card" onclick="showDishDetail('${dish.id}')">
      <div class="cuisine-photo">
        <div class="photo-placeholder" data-initials="🍜"></div>
        <img src="lessons/china/assets/${dish.image}" alt="${dish.name}"
             onload="this.previousElementSibling.style.display='none'; this.style.display='block';"
             onerror="this.style.display='none';" style="display:none;" />
      </div>
      <div class="cuisine-name">${dish.name}</div>
      <div class="cuisine-chinese">${dish.chinese || ''}</div>
    </div>
  `).join('');

  const grid = document.getElementById('cuisine-grid');
  if (grid) convertEmojisToTwemoji(grid);
}

function showDishDetail(dishId) {
  const dish = (LESSON_DATA.cuisine || []).find(d => d.id === dishId);
  if (!dish) return;

  const detailsList = (dish.details || []).map(d => `<li>${d}</li>`).join('');

  const body = `
    <div class="dish-detail">
      <div class="dish-detail-photo">
        <div class="photo-placeholder-large" data-initials="🍜"></div>
        <img src="lessons/china/assets/${dish.image}" alt="${dish.name}"
             onload="this.previousElementSibling.style.display='none'; this.style.display='block';"
             onerror="this.style.display='none';" style="display:none;" />
      </div>
      <h3>${dish.name}</h3>
      ${dish.chinese ? `<div class="chinese-name">${dish.chinese}${dish.pinyin ? ' · ' + dish.pinyin : ''}</div>` : ''}
      <p class="intro-text">${dish.intro}</p>
      <ul class="key-points">${detailsList}</ul>
      ${dish.fun_fact ? `<div class="anecdote">${dish.fun_fact}</div>` : ''}
    </div>
  `;
  openDetailModal(body);
  const modal = document.getElementById('detail-modal');
  if (modal) convertEmojisToTwemoji(modal);
}

// ============================================================
// MODAL GÉNÉRIQUE (drapeau, personnage, plat)
// ============================================================
function openDetailModal(htmlContent) {
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-modal-body');
  if (!modal || !body) return;
  body.innerHTML = htmlContent;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
  // Stoppe tout audio en cours (hymne)
  const audios = modal.querySelectorAll('audio');
  audios.forEach(a => { a.pause(); a.currentTime = 0; });
}

function setupDetailModal() {
  const modal = document.getElementById('detail-modal');
  const closeBtn = document.getElementById('detail-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDetailModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDetailModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailModal();
  });
}

// Expose
window.showPersonDetail = showPersonDetail;
window.choosePerson = choosePerson;
window.showDishDetail = showDishDetail;
function fillTraditions() {
  const container = document.getElementById('traditions-grid');
  if (!container || !LESSON_DATA.traditions) return;

  container.innerHTML = LESSON_DATA.traditions.map(t => `
    <div class="tradition-card">
      <div class="icon">${t.icon || '✦'}</div>
      <h4>${t.title}</h4>
      <p>${t.description}</p>
      ${t.fun_fact ? `<div class="fun-fact">✦ ${t.fun_fact}</div>` : ''}
    </div>
  `).join('');

  // Twemoji pour les icônes
  const grid = document.getElementById('traditions-grid');
  if (grid) convertEmojisToTwemoji(grid);
}

// ============================================================
// ONGLET TIMELINE
// ============================================================
function fillTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container || !LESSON_DATA.timeline) return;

  container.innerHTML = LESSON_DATA.timeline.map(t => {
    const yearDisplay = t.year < 0
      ? `${Math.abs(t.year)} av. J.-C.`
      : `${t.year}`;
    return `
      <div class="timeline-item">
        <div class="timeline-year">${yearDisplay}</div>
        ${t.label ? `<div class="timeline-label">${t.label}</div>` : ''}
        <div class="timeline-event">${t.event}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
// ONGLET QUIZ — Interactif
// ============================================================
let QUIZ_STATE = { current: 0, score: 0, answered: false };

function fillQuiz() {
  if (!LESSON_DATA.quiz || LESSON_DATA.quiz.length === 0) return;
  QUIZ_STATE = { current: 0, score: 0, answered: false };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  const total = LESSON_DATA.quiz.length;
  const idx = QUIZ_STATE.current;

  // Écran de fin
  if (idx >= total) {
    const pct = Math.round((QUIZ_STATE.score / total) * 100);
    let mention, color;
    if (pct >= 80) { mention = "Bravo, tu es un véritable expert de la Chine !"; color = 'var(--jade)'; }
    else if (pct >= 50) { mention = "Bien joué ! Tu as appris plein de choses."; color = 'var(--ochre)'; }
    else { mention = "Pas grave, on apprend en jouant ! Recommence si tu veux."; color = 'var(--terracotta)'; }

    container.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h3 style="margin-bottom: 1rem;">🎉 Quiz terminé !</h3>
        <div style="font-family: var(--font-display); font-size: 4rem; color: ${color}; line-height: 1; margin: 1rem 0;">
          ${QUIZ_STATE.score}<span style="font-size: 2rem; color: var(--ink-soft);">/${total}</span>
        </div>
        <p style="font-family: var(--font-display); font-style: italic; font-size: 1.2rem; color: ${color}; margin-bottom: 2rem;">
          ${mention}
        </p>
        <button class="btn btn-primary" onclick="fillQuiz()">🔄 Recommencer le quiz</button>
      </div>
    `;
    convertEmojisToTwemoji(container);
    return;
  }

  const q = LESSON_DATA.quiz[idx];
  QUIZ_STATE.answered = false;

  container.innerHTML = `
    <div class="quiz-progress">Question ${idx + 1} sur ${total}</div>
    <div class="quiz-question">${q.question}</div>
    <div class="quiz-options" id="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-idx="${i}" onclick="answerQuiz(${i})">${opt}</button>
      `).join('')}
    </div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
    <div class="quiz-nav" id="quiz-nav" style="display: none;">
      <div></div>
      <button class="btn btn-primary" onclick="nextQuizQuestion()">
        ${idx + 1 < total ? 'Question suivante →' : 'Voir le résultat'}
      </button>
    </div>
  `;
}

function answerQuiz(chosenIdx) {
  if (QUIZ_STATE.answered) return;
  QUIZ_STATE.answered = true;

  const q = LESSON_DATA.quiz[QUIZ_STATE.current];
  const isCorrect = (chosenIdx === q.correct);

  // Feedback visuel sur les options
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === q.correct) btn.classList.add('correct');
    else if (i === chosenIdx) btn.classList.add('wrong');
  });

  // Feedback textuel
  const feedback = document.getElementById('quiz-feedback');
  if (feedback) {
    feedback.innerHTML = isCorrect
      ? `<strong style="color: var(--jade);">✓ Bonne réponse !</strong> ${q.explanation || ''}`
      : `<strong style="color: var(--terracotta);">✗ Dommage.</strong> ${q.explanation || ''}`;
    feedback.classList.add('show');
  }

  // Score
  if (isCorrect) QUIZ_STATE.score++;

  // Bouton suivant
  const nav = document.getElementById('quiz-nav');
  if (nav) nav.style.display = 'flex';
}

function nextQuizQuestion() {
  QUIZ_STATE.current++;
  renderQuizQuestion();
}

// Expose les fonctions appelées via onclick
window.speakChinese = speakChinese;
window.fillQuiz = fillQuiz;
window.answerQuiz = answerQuiz;
window.nextQuizQuestion = nextQuizQuestion;

// ============================================================
// ONGLETS : NAVIGATION
// ============================================================
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabEl = document.getElementById('tab-' + target);
      if (tabEl) tabEl.classList.add('active');
    });
  });
}

// ============================================================
// MODE PRÉSENTATION (PLEIN ÉCRAN)
// ============================================================
function setupPresentationMode() {
  const presBtn = document.getElementById('btn-presentation');
  if (!presBtn) return;

  presBtn.addEventListener('click', () => {
    const enteringPres = !document.body.classList.contains('presentation-mode');
    document.body.classList.toggle('presentation-mode');

    if (enteringPres) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      presBtn.textContent = '↩ Quitter la présentation';
    } else {
      document.exitFullscreen?.().catch(() => {});
      presBtn.textContent = '🎬 Mode présentation';
    }
  });

  // Sortir du mode présentation avec Échap
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove('presentation-mode');
      presBtn.textContent = '🎬 Mode présentation';
    }
  });
}

// ============================================================
// PDF — Pour l'instant un message en attendant la livraison 5
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const pdfBtn = document.getElementById('btn-download-pdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      alert("La fiche de prépa PDF arrive dans la prochaine livraison ✦\n\nElle sera personnalisée avec ton prénom et contiendra tous les contenus de la leçon, en format imprimable.");
    });
  }
});

// ============================================================
// TWEMOJI — Rendu emoji uniforme sur Windows/Mac/mobile
// ============================================================
function convertEmojisToTwemoji(root) {
  if (typeof twemoji === 'undefined') return;
  try {
    twemoji.parse(root || document.body, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    });
  } catch (e) {
    console.warn("[Orore] Twemoji parse failed:", e);
  }
}