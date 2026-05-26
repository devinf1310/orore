// ============================================================
// lesson-engine.js — PLACEHOLDER
// La version complète arrive dans la livraison 3
// Pour l'instant, ce fichier permet juste de ne pas crasher lesson.html
// ============================================================

console.log("[Orore] lesson-engine.js — placeholder, en attente de livraison 3");

// Charge basique du YAML pour affichage du titre uniquement (test)
(async function() {
  try {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('id') || 'china';

    const response = await fetch(`lessons/${lessonId}/config.yaml`);
    if (!response.ok) throw new Error("YAML introuvable");

    const yamlText = await response.text();
    const data = jsyaml.load(yamlText);
    const lesson = data.lesson;

    // Met juste le titre, le reste viendra avec lesson-engine complet
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-subtitle').textContent = lesson.intro.subtitle;

    // Indication que c'est un placeholder
    const panel = document.getElementById('hotspot-panel');
    if (panel) {
      panel.innerHTML = `
        <div style="text-align:center; padding: 2rem;">
          <h3 style="margin-bottom: 1rem;">🚧 En cours de construction</h3>
          <p style="color: var(--ink-soft); font-style: italic;">
            La logique interactive sera ajoutée dans la prochaine livraison.<br>
            YAML chargé avec succès : ${Object.keys(lesson.hotspots || []).length} hotspots détectés.
          </p>
        </div>
      `;
      panel.classList.remove('empty');
    }

  } catch (err) {
    console.error("[Orore] Erreur chargement YAML:", err);
    document.getElementById('lesson-title').textContent = "Erreur de chargement";
  }
})();
