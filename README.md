# Orore — L'apprentissage qui s'éveille

Outil pédagogique interactif pour exposés scolaires.
L'enfant présente, Orore l'épaule.

## 🎯 Concept

Orore est un compagnon de classe IA qui aide les enfants à préparer et à présenter leurs exposés.
**L'enfant reste maître de sa parole** — Orore intervient uniquement en soutien :

- 📄 Génère une fiche de prépa imprimable
- 🗺️ Fournit un support visuel interactif (cartes, hotspots, timeline, quiz)
- 🗣️ Prononce les mots étrangers
- 🎤 Répond aux questions des camarades en fin d'exposé (Q&A vocal)

## 📚 Leçons disponibles

- 🇨🇳 **Géographie / La Chine** (CM2) — MVP

D'autres matières et leçons seront ajoutées progressivement.

## 🏗️ Architecture

```
orore-pedagogie/
├── index.html              # Accueil + menu matières
├── geo.html                # Carte du monde (Chine cliquable)
├── lesson.html             # Page leçon générique (lit le YAML)
├── css/
│   └── styles.css          # Design system complet
├── js/
│   ├── lesson-engine.js    # Parse YAML + remplit la page
│   └── qa-agent.js         # Modal Q&A vocale
├── lessons/
│   └── china/
│       ├── config.yaml     # Contenu structuré de la leçon
│       ├── audio/          # Audios prononciations (générés)
│       └── assets/         # Images
├── api/                    # Backend FastAPI (Q&A)
│   └── main.py
└── scripts/                # Scripts utilitaires (génération PDF, TTS)
```

## 🚀 Lancement en local

### Frontend uniquement

Un simple serveur HTTP statique suffit :

```bash
# Avec Python (déjà installé sur Mac)
python3 -m http.server 8000

# Puis ouvrir http://localhost:8000
```

### Backend Q&A (optionnel, pour le mode Q&A vocal)

Voir `api/README.md` (livraison à venir).

## 🌐 Déploiement

- **Frontend** : GitHub Pages (statique, gratuit)
- **Backend** : Render ou Railway (free tier)

## 📝 Stack technique

- HTML5 / CSS3 / JavaScript vanilla
- YAML pour le contenu des leçons (js-yaml côté navigateur)
- FastAPI (Python) pour le Q&A
- GPT-4o-mini pour les réponses
- ElevenLabs pour la synthèse vocale
- Web Speech API pour la reconnaissance vocale

## 📄 Licence

À définir.

---

*Orore — Construit avec passion pour transformer l'apprentissage.*
