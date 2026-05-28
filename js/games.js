// ============================================================
// games.js — Jeux carte interactifs (v6)
// Jeu 1 : Trouve la Chine (carte du monde)
// Jeu 2 : Où se trouve... ? (carte de Chine)
// ============================================================

console.log("[Orore] games.js — v6 chargé");

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
    const res = await fetch('assets/world-map.svg?v=6');
    const svgText = await res.text();
    const mapDiv = document.getElementById('geo-game-map');
    mapDiv.innerHTML = svgText;
    const svg = mapDiv.querySelector('svg');
    if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.maxHeight = '50vh'; }

    let found = false;
    const feedback = document.getElementById('geo-game-feedback');

    // Tous les pays sont cliquables pour ce jeu
    mapDiv.querySelectorAll('.country').forEach(country => {
      country.style.cursor = 'pointer';
      country.addEventListener('click', () => {
        if (found) return;
        const isChina = country.id === 'china-path' || country.getAttribute('data-country') === 'china';
        if (isChina) {
          found = true;
          country.style.fill = 'var(--jade)';
          feedback.innerHTML = '<span class="game-win">🎉 Bravo ! Tu as trouvé la Chine !</span>';
          feedback.className = 'game-feedback win';
        } else {
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
// JEU 2 — OÙ SE TROUVE... ? (carte de Chine)
// ============================================================
const PLACE_GAME_QUESTIONS = [
  { id: 'pekin', label: 'Pékin', hint: 'la capitale' },
  { id: 'shanghai', label: 'Shanghai', hint: 'la plus grande ville' },
  { id: 'tibet', label: 'le Tibet (Lhassa)', hint: 'le toit du monde' },
  { id: 'hongkong', label: 'Hong Kong', hint: 'l\'ancienne ville anglaise' },
  { id: 'gobi', label: 'le désert de Gobi', hint: 'le grand désert froid' },
];
let placeGameIndex = 0;
let placeGameScore = 0;

async function initPlaceGame() {
  const container = document.getElementById('place-game-container');
  if (!container) return;

  placeGameIndex = 0;
  placeGameScore = 0;

  container.innerHTML = `
    <div class="game-intro">
      <h3>📍 Où se trouve... ?</h3>
      <p id="place-game-question">Clique sur le bon endroit de la carte !</p>
      <div class="game-feedback" id="place-game-feedback"></div>
    </div>
    <div class="game-map" id="place-game-map">Chargement…</div>
  `;

  try {
    const res = await fetch('assets/china-map.svg?v=6');
    const svgText = await res.text();
    const mapDiv = document.getElementById('place-game-map');
    mapDiv.innerHTML = svgText;
    const svg = mapDiv.querySelector('svg');
    if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.maxHeight = '50vh'; }

    // On masque les labels texte des hotspots (sinon trop facile)
    mapDiv.querySelectorAll('.hotspot-marker text').forEach(t => t.style.display = 'none');

    askPlaceQuestion(mapDiv);
  } catch (e) {
    console.error('[Orore] Jeu lieux échec:', e);
  }
}

function askPlaceQuestion(mapDiv) {
  const questionEl = document.getElementById('place-game-question');
  const feedback = document.getElementById('place-game-feedback');

  if (placeGameIndex >= PLACE_GAME_QUESTIONS.length) {
    questionEl.innerHTML = `<strong>Jeu terminé ! Score : ${placeGameScore}/${PLACE_GAME_QUESTIONS.length}</strong>`;
    feedback.innerHTML = '<button class="btn btn-gold" onclick="initPlaceGame()">🔄 Rejouer</button>';
    feedback.className = 'game-feedback';
    return;
  }

  const q = PLACE_GAME_QUESTIONS[placeGameIndex];
  questionEl.innerHTML = `Trouve <strong>${q.label}</strong> <span style="opacity:0.7">(${q.hint})</span>`;
  feedback.innerHTML = `Question ${placeGameIndex + 1} / ${PLACE_GAME_QUESTIONS.length}`;
  feedback.className = 'game-feedback';

  const markers = mapDiv.querySelectorAll('.hotspot-marker');
  markers.forEach(marker => {
    const newMarker = marker.cloneNode(true);
    marker.parentNode.replaceChild(newMarker, marker);
  });

  mapDiv.querySelectorAll('.hotspot-marker').forEach(marker => {
    marker.style.cursor = 'pointer';
    marker.addEventListener('click', () => {
      const clickedId = marker.getAttribute('data-hotspot-id');
      const inner = marker.querySelector('circle.inner');
      if (clickedId === q.id) {
        placeGameScore++;
        if (inner) inner.style.fill = 'var(--jade)';
        feedback.innerHTML = '<span class="game-win">🎉 Bravo, c\'est exact !</span>';
        feedback.className = 'game-feedback win';
        placeGameIndex++;
        setTimeout(() => askPlaceQuestion(mapDiv), 1200);
      } else {
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

window.initGeoGame = initGeoGame;
window.initPlaceGame = initPlaceGame;
