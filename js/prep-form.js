// ============================================================
// prep-form.js — Formulaire de préparation de la fiche d'exposé
// Ouvre une modale avec un formulaire, génère le PDF personnalisé
// ============================================================

console.log("[Orore] prep-form.js — v15 chargé");

const PREP_FORM_KEY = 'orore_prep_form';

function getPrepFormData() {
  try {
    const raw = localStorage.getItem(PREP_FORM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}
function savePrepFormData(data) {
  try { localStorage.setItem(PREP_FORM_KEY, JSON.stringify(data)); } catch(e) {}
}

// Récupère les choix éventuels faits ailleurs (popup prénom, choix personnage)
function getPrefilledData() {
  const saved = getPrepFormData();
  // Pré-remplir avec le prénom du popup et le personnage choisi
  if (!saved.prenom) {
    try { saved.prenom = localStorage.getItem('orore_child_name') || ''; } catch(e){}
  }
  if (!saved.personnage_id) {
    try { saved.personnage_id = localStorage.getItem('orore_chosen_person') || ''; } catch(e){}
  }
  return saved;
}

// ============================================================
// OUVERTURE DU FORMULAIRE
// ============================================================
function openPrepForm() {
  if (!window.LESSON_DATA) {
    alert("Les données de la leçon ne sont pas encore chargées. Attends un instant et réessaie.");
    return;
  }

  const saved = getPrefilledData();

  // Construire les options de personnages
  const allPersons = [];
  (window.LESSON_DATA.personalities?.themes || []).forEach(t => {
    t.people.forEach(p => allPersons.push({ id: p.id, name: p.name, role: p.role }));
  });

  const overlay = document.createElement('div');
  overlay.className = 'prep-form-overlay';
  overlay.id = 'prep-form-overlay';

  overlay.innerHTML = `
    <div class="prep-form-card">
      <button class="prep-form-close" id="prep-form-close" aria-label="Fermer">✕</button>
      <header class="prep-form-header">
        <h2>Ma fiche d'exposé</h2>
        <p>Remplis ce formulaire pour préparer ta fiche. Tu pourras ensuite la télécharger et l'imprimer.</p>
      </header>

      <form id="prep-form" class="prep-form" autocomplete="off">

        <fieldset>
          <legend>👤 Toi</legend>
          <div class="form-row">
            <label>
              <span>Prénom</span>
              <input type="text" name="prenom" value="${(saved.prenom || '').replace(/"/g,'&quot;')}" placeholder="Ton prénom" maxlength="30" />
            </label>
            <label>
              <span>Nom</span>
              <input type="text" name="nom" value="${(saved.nom || '').replace(/"/g,'&quot;')}" placeholder="Ton nom de famille" maxlength="30" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>🏫 Ton école</legend>
          <label class="full">
            <span>Recherche ton école</span>
            <input type="text" name="ecole_search" id="ecole-search" placeholder="Tape le nom de ton école..." autocomplete="off" />
            <div class="autocomplete-list" id="ecole-results"></div>
            <small class="form-hint" id="ecole-selected">${saved.ecole_nom ? '✓ ' + saved.ecole_nom + (saved.ecole_ville ? ' — ' + saved.ecole_ville : '') : 'Source : annuaire officiel de l’Éducation nationale'}</small>
          </label>
          <input type="hidden" name="ecole_nom" value="${(saved.ecole_nom || '').replace(/"/g,'&quot;')}" />
          <input type="hidden" name="ecole_ville" value="${(saved.ecole_ville || '').replace(/"/g,'&quot;')}" />
          <input type="hidden" name="ecole_cp" value="${(saved.ecole_cp || '').replace(/"/g,'&quot;')}" />

          <label class="full">
            <span>Maître ou maîtresse</span>
            <input type="text" name="maitre" value="${(saved.maitre || '').replace(/"/g,'&quot;')}" placeholder="Ex. Madame Dupont" maxlength="50" />
          </label>
        </fieldset>

        <fieldset>
          <legend>✦ Tes choix pour l'exposé</legend>

          <label class="full">
            <span>Personnage célèbre</span>
            <select name="personnage_id">
              <option value="">— Choisis un personnage —</option>
              ${allPersons.map(p => `
                <option value="${p.id}" ${saved.personnage_id === p.id ? 'selected' : ''}>${p.name} — ${p.role}</option>
              `).join('')}
            </select>
          </label>

          <label class="full">
            <span>Spécialité culinaire</span>
            <select name="plat_id">
              <option value="">— Choisis un plat —</option>
              ${(window.LESSON_DATA.cuisine || []).map(d => `
                <option value="${d.id}" ${saved.plat_id === d.id ? 'selected' : ''}>${d.name}</option>
              `).join('')}
            </select>
          </label>

          <label class="full">
            <span>Lieu ou monument</span>
            <select name="monument_id">
              <option value="">— Choisis un lieu —</option>
              ${(window.LESSON_DATA.monuments || []).map(m => `
                <option value="${m.id}" ${saved.monument_id === m.id ? 'selected' : ''}>${m.name}</option>
              `).join('')}
            </select>
          </label>

          <label class="full">
            <span>Sport</span>
            <select name="sport_id">
              <option value="">— Choisis un sport —</option>
              ${(window.LESSON_DATA.sports || []).map(s => `
                <option value="${s.id}" ${saved.sport_id === s.id ? 'selected' : ''}>${s.name}</option>
              `).join('')}
            </select>
          </label>
        </fieldset>

        <fieldset class="auto-section">
          <legend>✨ Rempli automatiquement</legend>
          <div class="auto-grid">
            <div><span class="auto-label">Pays</span> <strong>Chine 🇨🇳</strong></div>
            <div><span class="auto-label">Année scolaire</span> <strong>2025–2026</strong></div>
          </div>
        </fieldset>

        <div class="prep-form-actions">
          <button type="button" class="btn" id="prep-save-only">💾 Sauvegarder pour plus tard</button>
          <button type="button" class="btn btn-gold" id="prep-generate">📄 Générer ma fiche</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Brancher l'autocomplete école
  setupEcoleAutocomplete();
  // Brancher les boutons
  document.getElementById('prep-form-close').addEventListener('click', closePrepForm);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePrepForm(); });
  document.getElementById('prep-save-only').addEventListener('click', () => {
    const data = collectFormData();
    savePrepFormData(data);
    alert("Tes choix sont sauvegardés ✦ Tu peux revenir plus tard.");
  });
  document.getElementById('prep-generate').addEventListener('click', () => {
    const data = collectFormData();
    savePrepFormData(data);
    if (typeof generateFichePrepa === 'function') {
      generateFichePrepa(data);
    }
  });
}

function closePrepForm() {
  const overlay = document.getElementById('prep-form-overlay');
  if (overlay) overlay.remove();
  document.body.style.overflow = '';
}

function collectFormData() {
  const form = document.getElementById('prep-form');
  if (!form) return {};
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) data[k] = v;
  return data;
}

// ============================================================
// AUTOCOMPLETE ÉCOLE (API ministère)
// ============================================================
let ecoleSearchTimer = null;

function setupEcoleAutocomplete() {
  const input = document.getElementById('ecole-search');
  const resultsBox = document.getElementById('ecole-results');
  if (!input || !resultsBox) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (ecoleSearchTimer) clearTimeout(ecoleSearchTimer);
    if (q.length < 3) {
      resultsBox.innerHTML = '';
      resultsBox.style.display = 'none';
      return;
    }
    ecoleSearchTimer = setTimeout(() => searchEcoles(q, resultsBox), 350);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => { resultsBox.style.display = 'none'; }, 200);
  });
  input.addEventListener('focus', () => {
    if (resultsBox.innerHTML.trim()) resultsBox.style.display = 'block';
  });
}

async function searchEcoles(query, resultsBox) {
  // API publique data.education.gouv.fr - dataset annuaire-education
  // Filtre sur écoles uniquement (premier degré)
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records?` +
    `select=nom_etablissement,nom_commune,code_postal,libelle_nature&` +
    `where=search(nom_etablissement,"${encodeURIComponent(query)}") and (type_etablissement="Ecole")&` +
    `limit=8`;

  try {
    resultsBox.innerHTML = '<div class="autocomplete-loading">Recherche...</div>';
    resultsBox.style.display = 'block';

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    const json = await res.json();
    const results = json.results || [];

    if (results.length === 0) {
      resultsBox.innerHTML = '<div class="autocomplete-empty">Aucune école trouvée. Vérifie l\'orthographe.</div>';
      return;
    }

    resultsBox.innerHTML = results.map(r => `
      <div class="autocomplete-item"
           data-nom="${(r.nom_etablissement || '').replace(/"/g,'&quot;')}"
           data-ville="${(r.nom_commune || '').replace(/"/g,'&quot;')}"
           data-cp="${(r.code_postal || '').replace(/"/g,'&quot;')}">
        <strong>${r.nom_etablissement || ''}</strong>
        <small>${r.nom_commune || ''} ${r.code_postal ? '· ' + r.code_postal : ''}</small>
      </div>
    `).join('');

    resultsBox.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // évite le blur avant click
        const nom = item.getAttribute('data-nom');
        const ville = item.getAttribute('data-ville');
        const cp = item.getAttribute('data-cp');
        document.getElementById('ecole-search').value = nom;
        document.querySelector('input[name="ecole_nom"]').value = nom;
        document.querySelector('input[name="ecole_ville"]').value = ville;
        document.querySelector('input[name="ecole_cp"]').value = cp;
        document.getElementById('ecole-selected').textContent = `✓ ${nom} — ${ville}`;
        resultsBox.style.display = 'none';
      });
    });
  } catch (e) {
    console.error('[Orore] Recherche école échouée:', e);
    resultsBox.innerHTML = '<div class="autocomplete-empty">Erreur de connexion à l\'annuaire. Tu peux taper le nom de ton école directement.</div>';
    // Fallback : si l'API rate, on permet quand même de remplir le nom à la main
    document.querySelector('input[name="ecole_nom"]').value = query;
  }
}

window.openPrepForm = openPrepForm;
