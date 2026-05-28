// ============================================================
// pdf-fiche.js — Génère la fiche de prépa PDF (v6)
// Clone de la feuille de la maîtresse, côté navigateur (jsPDF)
// ============================================================

console.log("[Orore] pdf-fiche.js — v6 chargé");

function generateFichePrepa() {
  if (typeof window.jspdf === 'undefined') {
    alert("La librairie PDF se charge encore, réessaie dans 2 secondes.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const name = (function(){ try { return localStorage.getItem('orore_child_name') || ''; } catch(e){ return ''; } })();
  const chosenPersonId = (function(){ try { return localStorage.getItem('orore_chosen_person') || ''; } catch(e){ return ''; } })();

  const pageW = 210;
  const margin = 15;
  let y = margin;

  // ---- EN-TÊTE ----
  doc.setDrawColor(40, 40, 60);
  doc.setLineWidth(0.5);

  // Cadre drapeau (en haut à gauche)
  doc.rect(margin, y, 45, 28);
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("(dessine le", margin + 22, y + 12, { align: 'center' });
  doc.text("drapeau)", margin + 22, y + 17, { align: 'center' });

  // Titre MON PAYS
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 60);
  doc.setFont(undefined, 'bold');
  doc.text("MON PAYS :", margin + 55, y + 8);

  // Année + école
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.rect(margin + 105, y, 25, 8);
  doc.text("2025 - 2026", margin + 117, y + 5.5, { align: 'center' });
  doc.rect(margin + 132, y, 48, 8);
  doc.text("ÉCOLE DE SAINT-LOUP CENTRE", margin + 156, y + 5.5, { align: 'center' });

  // Nom du pays (grand cadre)
  doc.rect(margin + 55, y + 12, 75, 16);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 30, 90);
  doc.text("Chine", margin + 92, y + 23, { align: 'center' });

  y += 34;

  // ---- INFOS PRINCIPALES (colonne droite) + cadre culinaire (gauche) ----
  const infoX = margin + 60;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(40, 40, 60);

  const infos = [
    ["CONTINENT :", "Asie"],
    ["CAPITALE :", "Pékin"],
    ["NOMS DES HABITANTS :", "les Chinois"],
    ["LANGUE :", "le chinois (mandarin)"],
    ["MONNAIE :", "le Yuan"],
  ];
  let infoY = y + 4;
  infos.forEach(([label, val]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, infoX, infoY);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(30, 30, 120);
    const labelWidth = doc.getTextWidth(label);
    doc.text(val, infoX + labelWidth + 3, infoY);
    doc.setTextColor(40, 40, 60);
    infoY += 9;
  });

  // Cadre spécialité culinaire (gauche)
  doc.setFont(undefined, 'italic');
  doc.setFontSize(10);
  doc.rect(margin, y, 52, 52);
  doc.text("Spécialité culinaire", margin + 26, y + 6, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("(dessine ou colle", margin + 26, y + 28, { align: 'center' });
  doc.text("une image)", margin + 26, y + 32, { align: 'center' });
  doc.setTextColor(40, 40, 60);

  y += 56;

  // ---- LIEU OU MONUMENT ----
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  doc.rect(margin + 55, y, 125, 26);
  doc.text("Lieu ou monument", margin + 117, y + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 120);
  doc.text("La Grande Muraille de Chine", margin + 117, y + 16, { align: 'center' });
  doc.setTextColor(40, 40, 60);

  y += 30;

  // ---- PERSONNAGE CÉLÈBRE + ÉVÉNEMENT ----
  const halfW = 82;
  doc.setFont(undefined, 'italic');
  doc.rect(margin, y, halfW, 40);
  doc.text("Personnage célèbre", margin + halfW/2, y + 6, { align: 'center' });

  // Si l'enfant a choisi un personnage, on le pré-remplit
  const personNames = {
    confucius: "Confucius", qin: "Qin Shi Huang", mao: "Mao Zedong",
    brucelee: "Bruce Lee", jackiechan: "Jackie Chan", langlang: "Lang Lang",
    yaoming: "Yao Ming", malong: "Ma Long", lina: "Li Na",
    tuyouyou: "Tu Youyou", zhangheng: "Zhang Heng", yangliwei: "Yang Liwei"
  };
  if (chosenPersonId && personNames[chosenPersonId]) {
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 30, 120);
    doc.text(personNames[chosenPersonId], margin + halfW/2, y + 20, { align: 'center' });
    doc.setTextColor(40, 40, 60);
  }

  doc.setFont(undefined, 'italic');
  doc.rect(margin + halfW + 6, y, halfW, 40);
  doc.text("Évènement", margin + halfW + 6 + halfW/2, y + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 120);
  doc.setFontSize(9);
  doc.text("Jeux Olympiques de Pékin (2008)", margin + halfW + 6 + halfW/2, y + 20, { align: 'center' });
  doc.setTextColor(40, 40, 60);
  doc.setFontSize(10);

  y += 44;

  // ---- SPORT ----
  doc.setFont(undefined, 'italic');
  doc.rect(margin, y, 170, 22);
  doc.text("Sport", margin + 85, y + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 120);
  doc.text("Le tennis de table (sport national chinois)", margin + 85, y + 15, { align: 'center' });
  doc.setTextColor(40, 40, 60);

  // ---- PIED DE PAGE PERSONNALISÉ ----
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.setFont(undefined, 'italic');
  const footer = name ? `Fiche de ${name} — préparée avec Orore` : "Préparée avec Orore — l'apprentissage qui s'éveille";
  doc.text(footer, pageW/2, 285, { align: 'center' });

  // ---- PAGE 2 : aide-mémoire ----
  doc.addPage();
  y = margin;
  doc.setTextColor(40, 40, 60);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(name ? `Aide-mémoire de ${name}` : "Aide-mémoire — La Chine", margin, y + 5);
  y += 14;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const memo = [
    "LA CHINE EN BREF",
    "- 1,4 milliard d'habitants (le pays le plus peuplé du monde, avec l'Inde).",
    "- 3e plus grand pays du monde (17 fois la France).",
    "- Capitale : Pékin. Plus grande ville : Shanghai.",
    "",
    "QUELQUES MOTS EN CHINOIS",
    "- Bonjour = Ni hao    - Merci = Xie xie    - Au revoir = Zai jian",
    "",
    "LIEUX IMPORTANTS",
    "- La Grande Muraille : plus de 21 000 km de long.",
    "- La Cité Interdite (Pékin) : palais des empereurs.",
    "- L'armée de terre cuite (Xi'an) : 8 000 soldats en terre cuite.",
    "",
    "TRADITIONS",
    "- Le Nouvel An chinois : la plus grande fête, avec dragons et lanternes.",
    "- L'écriture chinoise : des caractères au lieu d'un alphabet.",
    "- Le panda géant : l'animal symbole de la Chine.",
    "",
    "MON PLAN D'EXPOSÉ (à compléter)",
    "1. Je présente le pays (où, combien d'habitants...).",
    "2. Je montre un lieu ou monument.",
    "3. Je présente mon personnage célèbre.",
    "4. Je parle d'une tradition ou d'un plat.",
    "5. Je termine et je réponds aux questions de la classe.",
  ];
  doc.setFontSize(10);
  memo.forEach(line => {
    if (line === line.toUpperCase() && line.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(180, 100, 30);
    } else {
      doc.setFont(undefined, 'normal');
      doc.setTextColor(40, 40, 60);
    }
    doc.text(line, margin, y);
    y += 6.5;
  });

  // Sauvegarde
  const filename = name ? `Fiche_Chine_${name}.pdf` : "Fiche_Chine_Orore.pdf";
  doc.save(filename);
}

window.generateFichePrepa = generateFichePrepa;
