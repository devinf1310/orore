// ============================================================
// lesson-engine.js — Version partielle (chargement carte + YAML)
// La version complète (interactivité hotspots, onglets, quiz) arrive en livraison 3
// ============================================================

console.log("[Orore] lesson-engine.js — version partielle");

(async function() {
  try {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('id') || 'china';

    // 1. Charger le YAML
    const yamlRes = await fetch(`lessons/${lessonId}/config.yaml`);
    if (!yamlRes.ok) throw new Error("YAML introuvable");
    const data = jsyaml.load(await yamlRes.text());
    const lesson = data.lesson;

    // 2. Remplir l'entête
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-subtitle').textContent = lesson.intro.subtitle;

    // 3. Charger la carte SVG de la Chine
    const mapTarget = document.getElementById('china-map-target');
    if (mapTarget) {
      try {
        const mapRes = await fetch('assets/china-map.svg');
        if (mapRes.ok) {
          mapTarget.innerHTML = await mapRes.text();
          const svg = mapTarget.querySelector('svg');
          if (svg) {
            svg.style.width = '100%';
            svg.style.height = 'auto';
            svg.style.maxHeight = '70vh';
          }

          // Branchement basique des hotspots (juste l'affichage du nom au clic pour l'instant)
          const markers = mapTarget.querySelectorAll('.hotspot-marker');
          markers.forEach(marker => {
            marker.addEventListener('click', () => {
              const hotspotId = marker.getAttribute('data-hotspot-id');
              const hotspot = (lesson.hotspots || []).find(h => h.id === hotspotId);
              if (hotspot) {
                showHotspot(hotspot);
                markers.forEach(m => m.classList.remove('active'));
                marker.classList.add('active');
              }
            });
          });
        }
      } catch (e) {
        console.error('[Orore] Carte Chine non chargée:', e);
        mapTarget.innerHTML = '<p style="text-align:center; color:var(--terracotta);">Carte indisponible</p>';
      }
    }

    // 4. Remplir les key facts (intro)
    const keyFactsContainer = document.getElementById('key-facts');
    if (keyFactsContainer && lesson.intro && lesson.intro.key_facts) {
      keyFactsContainer.innerHTML = lesson.intro.key_facts.map(f => `
        <div class="key-fact">
          <div class="icon">${f.icon || '✦'}</div>
          <div class="label">${f.label}</div>
          <div class="value">${f.value}</div>
          ${f.comment ? `<div class="comment">${f.comment}</div>` : ''}
        </div>
      `).join('');
    }

  } catch (err) {
    console.error("[Orore] Erreur chargement leçon:", err);
    document.getElementById('lesson-title').textContent = "Erreur de chargement";
  }
})();

// Affiche un hotspot dans le panel latéral
function showHotspot(h) {
  const panel = document.getElementById('hotspot-panel');
  if (!panel) return;

  const c = h.content || {};
  const images = (c.images || []).map(img => {
    return `<div class="image-placeholder">${img.caption || h.name}</div>`;
  }).join('');

  panel.classList.remove('empty');
  panel.innerHTML = `
    <div style="margin-bottom: 0.5rem;">
      <h3>${c.title || h.name}</h3>
      <div class="chinese-name">${h.chinese_name || ''}</div>
      <div class="pinyin">${h.pinyin || ''}</div>
    </div>
    ${c.intro ? `<p class="intro-text">${c.intro}</p>` : ''}
    ${images}
    ${c.key_points ? `<ul class="key-points">${c.key_points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
    ${c.anecdote ? `<div class="anecdote">${c.anecdote}</div>` : ''}
  `;
}

// Onglets : navigation basique
document.addEventListener('DOMContentLoaded', () => {
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

  // Mode présentation
  const presBtn = document.getElementById('btn-presentation');
  if (presBtn) {
    presBtn.addEventListener('click', () => {
      document.body.classList.toggle('presentation-mode');
      if (document.body.classList.contains('presentation-mode')) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  }
});
