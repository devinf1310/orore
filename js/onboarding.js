// ============================================================
// onboarding.js — Popup prénom + tour guidé (v6)
// ============================================================

console.log("[Orore] onboarding.js — v10 chargé (bouton changer prénom)");

const ORORE_NAME_KEY = 'orore_child_name';
const ORORE_TOUR_KEY = 'orore_tour_done';

// Récupère le prénom stocké
function getChildName() {
  try { return localStorage.getItem(ORORE_NAME_KEY) || ''; } catch(e) { return ''; }
}
function setChildName(name) {
  try { localStorage.setItem(ORORE_NAME_KEY, name); } catch(e) {}
}

// Personnalise tous les éléments marqués data-name-target
function applyChildName() {
  const name = getChildName();
  document.querySelectorAll('[data-name-target]').forEach(el => {
    const template = el.getAttribute('data-name-template') || '';
    const fallback = el.getAttribute('data-name-fallback');
    if (name) {
      el.textContent = template.replace('{name}', name);
      el.style.display = '';
    } else if (fallback !== null) {
      el.textContent = fallback;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  // Affiche ou masque le bouton "Changer de prénom" selon qu'il y a un prénom ou non
  updateChangeNameButton();
}

// Crée et gère le bouton "Changer de prénom" dans le header
function updateChangeNameButton() {
  const navLinks = document.querySelector('.site-header .nav-links');
  if (!navLinks) return;

  let btn = document.getElementById('change-name-btn');
  const name = getChildName();

  if (name) {
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'change-name-btn';
      btn.className = 'change-name-btn';
      btn.innerHTML = `<span class="change-name-current"></span> <span class="change-name-action">Changer</span>`;
      btn.title = "Changer de prénom (pour un autre enfant)";
      btn.addEventListener('click', confirmChangeName);
      navLinks.insertBefore(btn, navLinks.firstChild);
    }
    btn.querySelector('.change-name-current').textContent = name;
    btn.style.display = '';
  } else if (btn) {
    btn.style.display = 'none';
  }
}

function confirmChangeName() {
  if (confirm("Veux-tu passer la main à un autre enfant ? Le prénom actuel sera effacé.")) {
    try {
      localStorage.removeItem(ORORE_NAME_KEY);
      localStorage.removeItem(ORORE_TOUR_KEY);
      localStorage.removeItem('orore_chosen_person');
    } catch(e) {}
    location.reload();
  }
}

// ============================================================
// POPUP PRÉNOM (au démarrage)
// ============================================================
function showNamePopup() {
  // Si déjà un prénom, on skip
  if (getChildName()) {
    applyChildName();
    maybeStartTour();
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'name-popup';
  overlay.innerHTML = `
    <div class="onboarding-card">
      <div class="onboarding-orore">✨</div>
      <h2>Bienvenue sur Orore !</h2>
      <p class="onboarding-sub">Je vais t'accompagner pour préparer ton exposé.<br>Comment tu t'appelles ?</p>
      <input type="text" id="child-name-input" class="onboarding-input" placeholder="Ton prénom…" maxlength="20" autocomplete="off" />
      <button class="btn btn-gold onboarding-btn" id="name-submit">C'est parti ! ✦</button>
      <button class="onboarding-skip" id="name-skip">Passer</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const input = document.getElementById('child-name-input');
  const submit = document.getElementById('name-submit');
  const skip = document.getElementById('name-skip');

  setTimeout(() => input?.focus(), 300);

  const validate = () => {
    const name = input.value.trim();
    if (name) setChildName(name);
    overlay.remove();
    document.body.style.overflow = '';
    applyChildName();
    maybeStartTour();
  };

  submit.addEventListener('click', validate);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') validate(); });
  skip.addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
    maybeStartTour();
  });

  if (typeof twemoji !== 'undefined') twemoji.parse(overlay);
}

// ============================================================
// TOUR GUIDÉ (montre les zones clés)
// ============================================================
const TOUR_STEPS = [
  { selector: '.china-map-container', title: 'La carte interactive', text: 'Clique sur les points rouges pour explorer les villes et monuments de la Chine.' },
  { selector: '.tabs-nav', title: 'Tout pour ton exposé', text: 'Ici tu trouves les mots en chinois, les personnages célèbres, les plats, les traditions, l\'histoire et un quiz !' },
  { selector: '#btn-presentation', title: 'Mode présentation', text: 'Le jour de ton exposé, clique ici pour passer en plein écran devant la classe.' },
  { selector: '#lesson-flag', title: 'Le drapeau', text: 'Clique sur le drapeau pour découvrir sa signification et écouter l\'hymne chinois.' },
];

function maybeStartTour() {
  try { if (localStorage.getItem(ORORE_TOUR_KEY)) return; } catch(e) {}
  // Démarre le tour seulement sur la page leçon
  if (!document.querySelector('.tabs-nav')) return;
  setTimeout(() => startTour(0), 600);
}

function startTour(stepIndex) {
  // Nettoie un éventuel tour existant
  document.querySelectorAll('.tour-spotlight, .tour-tooltip').forEach(e => e.remove());

  if (stepIndex >= TOUR_STEPS.length) {
    try { localStorage.setItem(ORORE_TOUR_KEY, '1'); } catch(e) {}
    return;
  }

  const step = TOUR_STEPS[stepIndex];
  const target = document.querySelector(step.selector);
  if (!target) { startTour(stepIndex + 1); return; }

  // Scroll vers la cible
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    const rect = target.getBoundingClientRect();
    const name = getChildName();

    // Spotlight (overlay sombre avec trou)
    const spotlight = document.createElement('div');
    spotlight.className = 'tour-spotlight';
    spotlight.innerHTML = `<div class="tour-hole" style="
      top: ${rect.top - 8}px; left: ${rect.left - 8}px;
      width: ${rect.width + 16}px; height: ${rect.height + 16}px;
    "></div>`;
    document.body.appendChild(spotlight);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip';
    const isLast = stepIndex === TOUR_STEPS.length - 1;
    tooltip.innerHTML = `
      <div class="tour-step-count">Étape ${stepIndex + 1} / ${TOUR_STEPS.length}</div>
      <h4>${step.title}</h4>
      <p>${step.text}</p>
      <div class="tour-actions">
        <button class="tour-skip-all">Passer le guide</button>
        <button class="btn btn-gold tour-next">${isLast ? 'C\'est compris ✦' : 'Suivant →'}</button>
      </div>
    `;
    document.body.appendChild(tooltip);

    // Position du tooltip (sous ou au-dessus de la cible)
    const tooltipTop = rect.bottom + 20 + tooltip.offsetHeight > window.innerHeight
      ? rect.top - tooltip.offsetHeight - 20
      : rect.bottom + 20;
    tooltip.style.top = Math.max(20, tooltipTop) + 'px';
    tooltip.style.left = Math.max(20, Math.min(
      rect.left + rect.width/2 - tooltip.offsetWidth/2,
      window.innerWidth - tooltip.offsetWidth - 20
    )) + 'px';

    spotlight.addEventListener('click', () => { document.querySelectorAll('.tour-spotlight,.tour-tooltip').forEach(e=>e.remove()); startTour(stepIndex+1); });
    tooltip.querySelector('.tour-next').addEventListener('click', (e) => { e.stopPropagation(); document.querySelectorAll('.tour-spotlight,.tour-tooltip').forEach(el=>el.remove()); startTour(stepIndex+1); });
    tooltip.querySelector('.tour-skip-all').addEventListener('click', (e) => { e.stopPropagation(); document.querySelectorAll('.tour-spotlight,.tour-tooltip').forEach(el=>el.remove()); try{localStorage.setItem(ORORE_TOUR_KEY,'1');}catch(err){} });
  }, 400);
}

// Bouton pour relancer le tour (utile pour la maîtresse)
function addReplayTourButton() {
  // optionnel, on peut l'ajouter à la toolbar
}

// Expose pour reset (debug / maîtresse)
window.ororeResetOnboarding = function() {
  try { localStorage.removeItem(ORORE_NAME_KEY); localStorage.removeItem(ORORE_TOUR_KEY); } catch(e){}
  location.reload();
};

// Démarrage
document.addEventListener('DOMContentLoaded', () => {
  // Petit délai pour laisser lesson-engine charger la page
  setTimeout(showNamePopup, 400);
});