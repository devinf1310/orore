// ============================================================
// qa-agent.js — PLACEHOLDER
// La version complète arrive dans la livraison 4 (backend FastAPI + ElevenLabs)
// ============================================================

console.log("[Orore] qa-agent.js — placeholder, en attente du backend (livraison 4)");

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-launch-qa');
  if (btn) {
    btn.addEventListener('click', () => {
      alert(
        "🎤 Le mode Questions vocales avec Orore arrive dans la prochaine livraison ✦\n\n" +
        "Ce mode nécessite :\n" +
        "• Un backend déployé (FastAPI sur Render)\n" +
        "• Une clé API OpenAI (GPT-4o-mini)\n" +
        "• Une clé API ElevenLabs (voix française)\n\n" +
        "On configure tout ça à la prochaine étape."
      );
    });
  }
});