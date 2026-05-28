// ============================================================
// games.js — Jeux interactifs (v10)
// 5 jeux : Trouve la Chine, Où se trouve, Qui est-ce, Reconnais le plat, Qui suis-je
// Score correct (pénalise les erreurs)
// ============================================================

console.log("[Orore] games.js — v12 chargé (Qui suis-je sans spoiler)");

let LESSON_FOR_GAMES = null;
function setLessonData(data) { LESSON_FOR_GAMES = data; }
window.setLessonData = setLessonData;

// Utilitaire : mélanger un tableau
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// JEU 1 — TROUVE LA CHINE
// ============================================================
async function initGeoGame() {
  const container = document.getElementById('geo-game-container');
  if (!container) return;

  container.innerHTML = `
    <div class="game-intro">
      <h3>🌍 Trouve la Chine !</h3>
      <p>Clique sur la Chine sur la carte du monde.</p>
      <div class="game-feedback" id="geo-game-feedback"></div>
    </div>
    <div class="game-map" id="geo-game-map">Chargement…</div>
  `;

  try {
    const res = await fetch('assets/world-map.svg?v=12');
    const svgText = await res.text();
    const mapDiv = document.getElementById('geo-game-map');
    mapDiv.innerHTML = svgText;
    const svg = mapDiv.querySelector('svg');
    if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.maxHeight = '50vh'; }

    let found = false;
    let errors = 0;
    const feedback = document.getElementById('geo-game-feedback');

    mapDiv.querySelectorAll('.country').forEach(country => {
      country.style.cursor = 'pointer';
      country.addEventListener('click', () => {
        if (found) return;
        const isChina = country.id === 'china-path' || country.getAttribute('data-country') === 'china';
        if (isChina) {
          found = true;
          country.style.fill = 'var(--jade)';
          if (errors === 0) {
            feedback.innerHTML = '<span class="game-win">🎉 Bravo, du premier coup !</span>';
          } else {
            feedback.innerHTML = `<span class="game-win">🎉 Tu as trouvé en ${errors + 1} essais !</span>`;
          }
          feedback.className = 'game-feedback win';
        } else {
          errors++;
          country.style.fill = 'var(--terracotta)';
          setTimeout(() => { country.style.fill = ''; }, 600);
          feedback.innerHTML = '<span class="game-lose">Ce n\'est pas la Chine, essaie encore !</span>';
          feedback.className = 'game-feedback lose';
        }
      });
    });
  } catch (e) {
    console.error('[Orore] Jeu géo échec:', e);
  }
}

// ============================================================
// JEU 2 — OÙ SE TROUVE... ? (avec score qui pénalise les erreurs)
// ============================================================
const PLACE_GAME_QUESTIONS = [
  { id: 'pekin', label: 'Pékin', hint: 'la capitale' },
  { id: 'shanghai', label: 'Shanghai', hint: 'la plus grande ville' },
  { id: 'tibet', label: 'le Tibet (Lhassa)', hint: 'le toit du monde' },
  { id: 'hongkong', label: 'Hong Kong', hint: 'l\'ancienne ville anglaise' },
  { id: 'gobi', label: 'le désert de Gobi', hint: 'le grand désert froid' },
];
let placeGameState = { index: 0, score: 0, currentTriesOk: true };

async function initPlaceGame() {
  const container = document.getElementById('place-game-container');
  if (!container) return;

  placeGameState = { index: 0, score: 0, currentTriesOk: true };

  container.innerHTML = `
    <div class="game-intro">
      <h3>📍 Où se trouve... ?</h3>
      <p id="place-game-question">Clique sur le bon endroit de la carte !</p>
      <div class="game-feedback" id="place-game-feedback"></div>
    </div>
    <div class="game-map" id="place-game-map">Chargement…</div>
  `;

  try {
    const res = await fetch('assets/china-map.svg?v=12');
    const svgText = await res.text();
    const mapDiv = document.getElementById('place-game-map');
    mapDiv.innerHTML = svgText;
    const svg = mapDiv.querySelector('svg');
    if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.maxHeight = '50vh'; }
    mapDiv.querySelectorAll('.hotspot-marker text').forEach(t => t.style.display = 'none');

    askPlaceQuestion(mapDiv);
  } catch (e) {
    console.error('[Orore] Jeu lieux échec:', e);
  }
}

function askPlaceQuestion(mapDiv) {
  const questionEl = document.getElementById('place-game-question');
  const feedback = document.getElementById('place-game-feedback');

  if (placeGameState.index >= PLACE_GAME_QUESTIONS.length) {
    const total = PLACE_GAME_QUESTIONS.length;
    const score = placeGameState.score;
    let comment;
    if (score === total) comment = "Parfait, tu connais la Chine par cœur !";
    else if (score >= total * 0.7) comment = "Très bien !";
    else if (score >= total * 0.4) comment = "Pas mal, tu peux faire mieux !";
    else comment = "Il faut réviser un peu ! Recommence ?";

    questionEl.innerHTML = `<strong>Jeu terminé !</strong>`;
    feedback.innerHTML = `
      <div style="font-family: var(--font-display); font-size: 2.5rem; color: var(--ochre-dark); line-height: 1;">${score}<span style="font-size: 1.2rem; color: var(--ink-soft);">/${total}</span></div>
      <p style="margin: 0.5rem 0 1rem; font-family: var(--font-display); font-style: italic;">${comment}</p>
      <button class="btn btn-gold" onclick="initPlaceGame()">🔄 Rejouer</button>
    `;
    feedback.className = 'game-feedback';
    return;
  }

  const q = PLACE_GAME_QUESTIONS[placeGameState.index];
  placeGameState.currentTriesOk = true;  // reset pour la nouvelle question

  questionEl.innerHTML = `Trouve <strong>${q.label}</strong> <span style="opacity:0.7">(${q.hint})</span>`;
  feedback.innerHTML = `Question ${placeGameState.index + 1} / ${PLACE_GAME_QUESTIONS.length} — Score : ${placeGameState.score}`;
  feedback.className = 'game-feedback';

  // Reset les listeners
  mapDiv.querySelectorAll('.hotspot-marker').forEach(marker => {
    const newMarker = marker.cloneNode(true);
    marker.parentNode.replaceChild(newMarker, marker);
  });

  mapDiv.querySelectorAll('.hotspot-marker').forEach(marker => {
    marker.style.cursor = 'pointer';
    marker.addEventListener('click', () => {
      const clickedId = marker.getAttribute('data-hotspot-id');
      const inner = marker.querySelector('circle.inner');
      if (clickedId === q.id) {
        if (placeGameState.currentTriesOk) {
          placeGameState.score++;
        }
        if (inner) inner.style.fill = 'var(--jade)';
        feedback.innerHTML = placeGameState.currentTriesOk
          ? '<span class="game-win">🎉 Bravo, du premier coup !</span>'
          : '<span class="game-win">Bien joué, tu l\'as trouvé !</span>';
        feedback.className = 'game-feedback win';
        placeGameState.index++;
        setTimeout(() => askPlaceQuestion(mapDiv), 1300);
      } else {
        placeGameState.currentTriesOk = false;  // erreur : on ne comptera plus le point
        if (inner) {
          const orig = inner.style.fill;
          inner.style.fill = 'var(--terracotta)';
          setTimeout(() => { inner.style.fill = orig; }, 600);
        }
        feedback.innerHTML = '<span class="game-lose">Presque ! Essaie encore.</span>';
        feedback.className = 'game-feedback lose';
      }
    });
  });
}

// ============================================================
// JEU 3 — QUI EST-CE ? (photo → choisir le nom)
// ============================================================
let personGameState = { questions: [], index: 0, score: 0, locked: false, currentTriesOk: true };

function initPersonGame() {
  const container = document.getElementById('person-game-container');
  if (!container) return;
  if (!LESSON_FOR_GAMES) {
    container.innerHTML = '<p style="text-align:center; color:var(--ink-soft);">Chargement des données…</p>';
    return;
  }

  // Récupère tous les personnages
  const allPersons = [];
  (LESSON_FOR_GAMES.personalities?.themes || []).forEach(t => {
    t.people.forEach(p => allPersons.push(p));
  });

  if (allPersons.length < 4) return;

  // Génère 6 questions
  const shuffled = shuffle(allPersons);
  personGameState.questions = shuffled.slice(0, 6).map(target => {
    const wrongs = shuffle(allPersons.filter(p => p.id !== target.id)).slice(0, 3);
    const choices = shuffle([target, ...wrongs]);
    return { target, choices };
  });
  personGameState.index = 0;
  personGameState.score = 0;
  personGameState.locked = false;
  personGameState.currentTriesOk = true;

  renderPersonQuestion();
}

function renderPersonQuestion() {
  const container = document.getElementById('person-game-container');
  if (!container) return;
  const total = personGameState.questions.length;

  if (personGameState.index >= total) {
    const score = personGameState.score;
    let comment;
    if (score === total) comment = "Excellente mémoire !";
    else if (score >= total * 0.7) comment = "Très bien !";
    else if (score >= total * 0.4) comment = "Pas mal, continue !";
    else comment = "Retourne les voir dans l'onglet Personnages !";

    container.innerHTML = `
      <div class="game-intro">
        <h3>👤 Qui est-ce ?</h3>
        <div class="game-feedback">
          <div style="font-family: var(--font-display); font-size: 2.5rem; color: var(--ochre-dark); line-height: 1;">${score}<span style="font-size: 1.2rem; color: var(--ink-soft);">/${total}</span></div>
          <p style="margin: 0.5rem 0 1rem; font-family: var(--font-display); font-style: italic;">${comment}</p>
          <button class="btn btn-gold" onclick="initPersonGame()">🔄 Rejouer</button>
        </div>
      </div>
    `;
    return;
  }

  const q = personGameState.questions[personGameState.index];
  personGameState.locked = false;
  personGameState.currentTriesOk = true;

  container.innerHTML = `
    <div class="game-intro">
      <h3>👤 Qui est-ce ?</h3>
      <p>Question ${personGameState.index + 1} / ${total} — Score : ${personGameState.score}</p>
    </div>
    <div class="picture-game-card">
      <div class="picture-game-photo">
        <div class="photo-placeholder-large" data-initials="${getInitialsForGame(q.target.name)}"></div>
        <img src="lessons/china/assets/${q.target.image}" alt="?"
             onload="this.previousElementSibling.style.display='none'; this.style.display='block';"
             onerror="this.style.display='none';" style="display:none;" />
      </div>
      <div class="picture-game-choices">
        ${q.choices.map((c, i) => `
          <button class="picture-game-choice" data-choice-id="${c.id}" data-correct="${c.id === q.target.id}">${c.name}</button>
        `).join('')}
      </div>
      <div class="game-feedback" id="person-game-feedback"></div>
    </div>
  `;

  container.querySelectorAll('.picture-game-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (personGameState.locked) return;
      const isCorrect = btn.getAttribute('data-correct') === 'true';
      const feedback = document.getElementById('person-game-feedback');

      if (isCorrect) {
        personGameState.locked = true;
        btn.classList.add('correct');
        if (personGameState.currentTriesOk) personGameState.score++;
        feedback.innerHTML = personGameState.currentTriesOk
          ? `<span class="game-win">🎉 Bravo ! C'est bien ${q.target.name}.</span>`
          : `<span class="game-win">Oui, c'est ${q.target.name} !</span>`;
        feedback.className = 'game-feedback win';
        personGameState.index++;
        setTimeout(() => renderPersonQuestion(), 1500);
      } else {
        personGameState.currentTriesOk = false;
        btn.classList.add('wrong');
        btn.disabled = true;
        feedback.innerHTML = '<span class="game-lose">Non, essaie encore.</span>';
        feedback.className = 'game-feedback lose';
      }
    });
  });
}

function getInitialsForGame(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

// ============================================================
// JEU 4 — RECONNAIS LE PLAT (nom → choisir la photo)
// ============================================================
let dishGameState = { questions: [], index: 0, score: 0, locked: false, currentTriesOk: true };

function initDishGame() {
  const container = document.getElementById('dish-game-container');
  if (!container) return;
  if (!LESSON_FOR_GAMES) { container.innerHTML = '<p>Chargement…</p>'; return; }

  const allDishes = LESSON_FOR_GAMES.cuisine || [];
  if (allDishes.length < 4) return;

  // 4 questions max (on a 6 plats donc 4 c'est bien)
  const shuffled = shuffle(allDishes);
  dishGameState.questions = shuffled.slice(0, 4).map(target => {
    const wrongs = shuffle(allDishes.filter(d => d.id !== target.id)).slice(0, 3);
    const choices = shuffle([target, ...wrongs]);
    return { target, choices };
  });
  dishGameState.index = 0;
  dishGameState.score = 0;
  dishGameState.locked = false;
  dishGameState.currentTriesOk = true;

  renderDishQuestion();
}

function renderDishQuestion() {
  const container = document.getElementById('dish-game-container');
  if (!container) return;
  const total = dishGameState.questions.length;

  if (dishGameState.index >= total) {
    const score = dishGameState.score;
    container.innerHTML = `
      <div class="game-intro">
        <h3>🍜 Reconnais le plat</h3>
        <div class="game-feedback">
          <div style="font-family: var(--font-display); font-size: 2.5rem; color: var(--ochre-dark); line-height: 1;">${score}<span style="font-size: 1.2rem; color: var(--ink-soft);">/${total}</span></div>
          <p style="margin: 0.5rem 0 1rem; font-family: var(--font-display); font-style: italic;">${score === total ? "Tu es un véritable gourmet !" : "Bien joué, regarde l'onglet Cuisine pour réviser."}</p>
          <button class="btn btn-gold" onclick="initDishGame()">🔄 Rejouer</button>
        </div>
      </div>
    `;
    return;
  }

  const q = dishGameState.questions[dishGameState.index];
  dishGameState.locked = false;
  dishGameState.currentTriesOk = true;

  container.innerHTML = `
    <div class="game-intro">
      <h3>🍜 Reconnais le plat</h3>
      <p>Question ${dishGameState.index + 1} / ${total} — Score : ${dishGameState.score}</p>
      <p style="font-family: var(--font-display); font-size: 1.4rem; color: var(--ochre-dark); margin-top: 0.75rem;">Trouve : <strong>${q.target.name}</strong></p>
    </div>
    <div class="dish-game-grid">
      ${q.choices.map(c => `
        <button class="dish-game-choice" data-correct="${c.id === q.target.id}">
          <div class="photo-placeholder" data-initials="🍜" style="width:100%; height:120px; border-radius:8px;"></div>
          <img src="lessons/china/assets/${c.image}" alt="?"
               onload="this.previousElementSibling.style.display='none'; this.style.display='block';"
               onerror="this.style.display='none';" style="display:none; width:100%; height:120px; border-radius:8px; object-fit:cover;" />
        </button>
      `).join('')}
    </div>
    <div class="game-feedback" id="dish-game-feedback"></div>
  `;

  container.querySelectorAll('.dish-game-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (dishGameState.locked) return;
      const isCorrect = btn.getAttribute('data-correct') === 'true';
      const feedback = document.getElementById('dish-game-feedback');

      if (isCorrect) {
        dishGameState.locked = true;
        btn.classList.add('correct');
        if (dishGameState.currentTriesOk) dishGameState.score++;
        feedback.innerHTML = dishGameState.currentTriesOk
          ? `<span class="game-win">🎉 Bravo, c'est bien ça !</span>`
          : `<span class="game-win">Oui, c'est bien ${q.target.name} !</span>`;
        feedback.className = 'game-feedback win';
        dishGameState.index++;
        setTimeout(() => renderDishQuestion(), 1500);
      } else {
        dishGameState.currentTriesOk = false;
        btn.classList.add('wrong');
        btn.disabled = true;
        feedback.innerHTML = '<span class="game-lose">Non, regarde mieux les photos.</span>';
        feedback.className = 'game-feedback lose';
      }
    });
  });
}

// ============================================================
// JEU 5 — QUI SUIS-JE ? (description → personnage)
// ============================================================
let whoamiState = { questions: [], index: 0, score: 0, locked: false, currentTriesOk: true };

function initWhoamiGame() {
  const container = document.getElementById('whoami-game-container');
  if (!container) return;
  if (!LESSON_FOR_GAMES) { container.innerHTML = '<p>Chargement…</p>'; return; }

  const allPersons = [];
  (LESSON_FOR_GAMES.personalities?.themes || []).forEach(t => {
    t.people.forEach(p => allPersons.push(p));
  });
  if (allPersons.length < 4) return;

  const shuffled = shuffle(allPersons);
  whoamiState.questions = shuffled.slice(0, 5).map(target => {
    const wrongs = shuffle(allPersons.filter(p => p.id !== target.id)).slice(0, 3);
    const choices = shuffle([target, ...wrongs]);
    return { target, choices };
  });
  whoamiState.index = 0;
  whoamiState.score = 0;
  whoamiState.locked = false;
  whoamiState.currentTriesOk = true;

  renderWhoamiQuestion();
}

function renderWhoamiQuestion() {
  const container = document.getElementById('whoami-game-container');
  if (!container) return;
  const total = whoamiState.questions.length;

  if (whoamiState.index >= total) {
    const score = whoamiState.score;
    container.innerHTML = `
      <div class="game-intro">
        <h3>🗣️ Qui suis-je ?</h3>
        <div class="game-feedback">
          <div style="font-family: var(--font-display); font-size: 2.5rem; color: var(--ochre-dark); line-height: 1;">${score}<span style="font-size: 1.2rem; color: var(--ink-soft);">/${total}</span></div>
          <p style="margin: 0.5rem 0 1rem; font-family: var(--font-display); font-style: italic;">${score >= total * 0.7 ? "Tu connais bien tes personnages !" : "Relis les présentations et réessaie."}</p>
          <button class="btn btn-gold" onclick="initWhoamiGame()">🔄 Rejouer</button>
        </div>
      </div>
    `;
    return;
  }

  const q = whoamiState.questions[whoamiState.index];
  whoamiState.locked = false;
  whoamiState.currentTriesOk = true;

  container.innerHTML = `
    <div class="game-intro">
      <h3>🗣️ Qui suis-je ?</h3>
      <p>Question ${whoamiState.index + 1} / ${total} — Score : ${whoamiState.score}</p>
    </div>
    <div class="whoami-card">
      <div class="whoami-bubble">
        <span class="bubble-label">Mystère…</span>
        <p>« ${q.target.riddle || q.target.intro} »</p>
      </div>
      <div class="picture-game-choices">
        ${q.choices.map(c => `
          <button class="picture-game-choice" data-correct="${c.id === q.target.id}">${c.name}</button>
        `).join('')}
      </div>
      <div class="game-feedback" id="whoami-feedback"></div>
    </div>
  `;

  container.querySelectorAll('.picture-game-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (whoamiState.locked) return;
      const isCorrect = btn.getAttribute('data-correct') === 'true';
      const feedback = document.getElementById('whoami-feedback');

      if (isCorrect) {
        whoamiState.locked = true;
        btn.classList.add('correct');
        if (whoamiState.currentTriesOk) whoamiState.score++;
        feedback.innerHTML = whoamiState.currentTriesOk
          ? `<span class="game-win">🎉 Exact ! C'est bien ${q.target.name}.</span>`
          : `<span class="game-win">Oui, c'est ${q.target.name} !</span>`;
        feedback.className = 'game-feedback win';
        whoamiState.index++;
        setTimeout(() => renderWhoamiQuestion(), 1700);
      } else {
        whoamiState.currentTriesOk = false;
        btn.classList.add('wrong');
        btn.disabled = true;
        feedback.innerHTML = '<span class="game-lose">Non, relis bien la description.</span>';
        feedback.className = 'game-feedback lose';
      }
    });
  });
}

// Expose
window.initGeoGame = initGeoGame;
window.initPlaceGame = initPlaceGame;
window.initPersonGame = initPersonGame;
window.initDishGame = initDishGame;
window.initWhoamiGame = initWhoamiGame;