// ============================================================
// pdf-fiche.js — Génère la fiche d'exposé PDF multi-pages (v15)
// Page 1 : fiche officielle "MON PAYS"
// Pages 2+ : aide-mémoire en bullets pour présenter sans regarder l'écran
// ============================================================

console.log("[Orore] pdf-fiche.js — v15 chargé");

function generateFichePrepa(formData) {
  if (typeof window.jspdf === 'undefined') {
    alert("La librairie PDF se charge encore, réessaie dans 2 secondes.");
    return;
  }
  if (!window.LESSON_DATA) {
    alert("Les données ne sont pas chargées. Recharge la page.");
    return;
  }

  const data = formData || {};
  const L = window.LESSON_DATA;

  const findById = (arr, id) => (arr || []).find(x => x.id === id);
  const findPersonById = (id) => {
    for (const t of (L.personalities?.themes || [])) {
      const p = t.people.find(x => x.id === id);
      if (p) return p;
    }
    return null;
  };

  const personnage = findPersonById(data.personnage_id);
  const plat = findById(L.cuisine, data.plat_id);
  const monument = findById(L.monuments, data.monument_id);
  const sport = findById(L.sports, data.sport_id);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ============================================================
  // PAGE 1 — FICHE OFFICIELLE "MON PAYS"
  // ============================================================
  drawFichePage(doc, data, { personnage, plat, monument, sport });

  // ============================================================
  // PAGES 2+ — AIDE-MÉMOIRE EN BULLETS
  // ============================================================
  // Construction des sections à afficher selon les choix
  const sections = buildSections(data, { personnage, plat, monument, sport });

  // Mise en page intelligente : on accumule les sections jusqu'à remplir une page
  drawMemoPages(doc, data, sections);

  // Nom de fichier
  const safePrenom = (data.prenom || 'Orore').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Fiche_Chine_${safePrenom}.pdf`);
}

// ============================================================
// PAGE 1 : FICHE OFFICIELLE
// ============================================================
function drawFichePage(doc, data, picks) {
  const margin = 15;
  const pageW = 210;
  let y = margin;

  doc.setDrawColor(40, 40, 60);
  doc.setLineWidth(0.5);

  // Cadre drapeau (en haut à gauche) — on dessine un mini drapeau chinois
  doc.rect(margin, y, 45, 28);
  drawMiniFlag(doc, margin + 2, y + 2, 41, 24);

  // Titre MON PAYS
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 60);
  doc.setFont(undefined, 'bold');
  doc.text("MON PAYS :", margin + 55, y + 8);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.rect(margin + 105, y, 25, 8);
  doc.text("2025 - 2026", margin + 117, y + 5.5, { align: 'center' });
  doc.rect(margin + 132, y, 48, 8);
  const ecole = data.ecole_nom || "ÉCOLE";
  doc.setFontSize(7);
  doc.text(ecole.substring(0, 35), margin + 156, y + 5.5, { align: 'center' });

  // Nom du pays
  doc.rect(margin + 55, y + 12, 75, 16);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 30, 90);
  doc.text("Chine", margin + 92, y + 23, { align: 'center' });

  y += 34;

  // Infos principales (colonne droite)
  const infoX = margin + 60;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(40, 40, 60);

  const infos = [
    ["CONTINENT :", "Asie"],
    ["CAPITALE :", "Pékin"],
    ["HABITANTS :", "les Chinois (1,4 milliard)"],
    ["LANGUE :", "le mandarin (chinois)"],
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
  if (picks.plat) {
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 30, 120);
    doc.setFontSize(11);
    doc.text(picks.plat.name, margin + 26, y + 30, { align: 'center', maxWidth: 48 });
    doc.setTextColor(40, 40, 60);
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("(à dessiner)", margin + 26, y + 30, { align: 'center' });
    doc.setTextColor(40, 40, 60);
  }
  doc.setFontSize(10);

  y += 56;

  // Lieu ou monument
  doc.setFont(undefined, 'italic');
  doc.rect(margin + 55, y, 125, 26);
  doc.text("Lieu ou monument", margin + 117, y + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 120);
  doc.setFontSize(12);
  doc.text(picks.monument ? picks.monument.name : "_____________________", margin + 117, y + 17, { align: 'center', maxWidth: 120 });
  doc.setTextColor(40, 40, 60);
  doc.setFontSize(10);

  y += 30;

  // Personnage célèbre + Évènement
  const halfW = 82;
  doc.setFont(undefined, 'italic');
  doc.rect(margin, y, halfW, 40);
  doc.text("Personnage célèbre", margin + halfW/2, y + 6, { align: 'center' });
  if (picks.personnage) {
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 30, 120);
    doc.setFontSize(12);
    doc.text(picks.personnage.name, margin + halfW/2, y + 20, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(picks.personnage.role || '', margin + halfW/2, y + 27, { align: 'center' });
    doc.setTextColor(40, 40, 60);
  }

  doc.setFont(undefined, 'italic');
  doc.setFontSize(10);
  doc.rect(margin + halfW + 6, y, halfW, 40);
  doc.text("Évènement", margin + halfW + 6 + halfW/2, y + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 120);
  doc.setFontSize(10);
  doc.text("Jeux Olympiques de Pékin", margin + halfW + 6 + halfW/2, y + 18, { align: 'center' });
  doc.text("(2008)", margin + halfW + 6 + halfW/2, y + 25, { align: 'center' });
  doc.setTextColor(40, 40, 60);

  y += 44;

  // Sport
  doc.setFont(undefined, 'italic');
  doc.setFontSize(10);
  doc.rect(margin, y, 170, 22);
  doc.text("Sport", margin + 85, y + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 30, 120);
  doc.setFontSize(12);
  doc.text(picks.sport ? picks.sport.name : "_____________________", margin + 85, y + 15, { align: 'center' });
  doc.setTextColor(40, 40, 60);

  // Pied de page
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.setFont(undefined, 'italic');
  const fullName = [data.prenom, data.nom].filter(Boolean).join(' ');
  const footer = fullName
    ? `Fiche de ${fullName}${data.maitre ? ' — Classe de ' + data.maitre : ''} — préparée avec Orore`
    : "Préparée avec Orore";
  doc.text(footer, pageW/2, 285, { align: 'center', maxWidth: 170 });
}

// Mini drapeau chinois en jsPDF (rectangle rouge + grande étoile)
function drawMiniFlag(doc, x, y, w, h) {
  doc.setFillColor(222, 41, 16);
  doc.rect(x, y, w, h, 'F');
  // Une grande étoile jaune simplifiée (cercle approximé)
  doc.setFillColor(255, 222, 0);
  doc.circle(x + w * 0.22, y + h * 0.35, 2.5, 'F');
  // 4 micro-points pour les petites étoiles
  doc.circle(x + w * 0.40, y + h * 0.18, 0.7, 'F');
  doc.circle(x + w * 0.48, y + h * 0.30, 0.7, 'F');
  doc.circle(x + w * 0.48, y + h * 0.48, 0.7, 'F');
  doc.circle(x + w * 0.40, y + h * 0.60, 0.7, 'F');
}

// ============================================================
// CONSTRUCTION DES SECTIONS D'AIDE-MÉMOIRE
// ============================================================
function buildSections(data, picks) {
  const sections = [];

  // 1. Mon plan d'exposé (toujours présent)
  sections.push({
    title: "Mon plan d'exposé",
    icon: "📋",
    bullets: [
      "Je dis bonjour et je présente le pays.",
      "Je montre où se trouve la Chine sur la carte du monde.",
      "Je parle des habitants, de la langue et de la monnaie.",
      "Je présente le lieu ou monument que j'ai choisi.",
      "Je présente le personnage célèbre que j'ai choisi.",
      "Je parle d'un plat ou d'une tradition.",
      "Je parle du sport.",
      "Je termine et je réponds aux questions de la classe.",
    ],
  });

  // 2. La Chine en bref
  sections.push({
    title: "La Chine en bref",
    icon: "🇨🇳",
    bullets: [
      "1,4 milliard d'habitants — c'est 20 fois plus qu'en France !",
      "3ème plus grand pays du monde (17 fois la France).",
      "Capitale : Pékin. Plus grande ville : Shanghai.",
      "Langue : le mandarin (aussi appelé « chinois »).",
      "Monnaie : le Yuan.",
      "Continent : Asie.",
    ],
  });

  // 3. Quelques mots en chinois
  sections.push({
    title: "Quelques mots en chinois",
    icon: "🗣️",
    bullets: [
      "Bonjour = Ni hao (nii-haaow)",
      "Merci = Xie xie (chié-chié)",
      "Au revoir = Zai jian (dzai-djienn)",
      "Chine = Zhongguo (jong-gwo)",
    ],
  });

  // 4. Lieu/monument (si choisi)
  if (picks.monument) {
    sections.push({
      title: picks.monument.name,
      icon: "🏛️",
      bullets: picks.monument.bullets || [],
    });
  }

  // 5. Personnage (si choisi)
  if (picks.personnage) {
    const p = picks.personnage;
    const bullets = [];
    bullets.push(`${p.role}.`);
    if (p.dates) bullets.push(`${p.dates}.`);
    if (p.intro) bullets.push(p.intro);
    if (p.details && p.details.length) bullets.push(...p.details);
    if (p.fun_fact) bullets.push(`💡 ${p.fun_fact}`);
    sections.push({
      title: p.name,
      icon: "👤",
      bullets,
    });
  }

  // 6. Plat (si choisi)
  if (picks.plat) {
    const p = picks.plat;
    const bullets = [];
    if (p.intro) bullets.push(p.intro);
    if (p.details && p.details.length) bullets.push(...p.details);
    if (p.fun_fact) bullets.push(`💡 ${p.fun_fact}`);
    sections.push({
      title: p.name,
      icon: "🍜",
      bullets,
    });
  }

  // 7. Sport (si choisi)
  if (picks.sport) {
    sections.push({
      title: picks.sport.name,
      icon: "⚽",
      bullets: picks.sport.bullets || [],
    });
  }

  return sections;
}

// ============================================================
// PAGES D'AIDE-MÉMOIRE — Mise en page intelligente
// ============================================================
function drawMemoPages(doc, data, sections) {
  const margin = 18;
  const pageW = 210;
  const pageH = 297;
  const contentW = pageW - 2 * margin;
  const bottomLimit = pageH - 25;

  doc.addPage();
  let y = margin;

  // En-tête de la première page d'aide-mémoire
  doc.setFont(undefined, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 60);
  const fullName = [data.prenom, data.nom].filter(Boolean).join(' ');
  doc.text(fullName ? `Mon aide-mémoire — ${fullName}` : "Mon aide-mémoire", margin, y);
  doc.setFont(undefined, 'italic');
  doc.setFontSize(11);
  doc.setTextColor(120);
  y += 8;
  doc.text("Tiens cette fiche à la main pendant ton exposé.", margin, y);
  y += 12;

  // Configuration de mise en page
  const SECTION_TITLE_SIZE = 14;
  const SECTION_TITLE_HEIGHT = 9;
  const BULLET_SIZE = 11.5;
  const BULLET_LINE_HEIGHT = 6;
  const SECTION_GAP = 7;

  for (const section of sections) {
    // Estimer la hauteur nécessaire pour la section
    const wrappedBullets = section.bullets.map(b => {
      const lines = doc.splitTextToSize(b, contentW - 8);
      return lines;
    });
    const totalBulletLines = wrappedBullets.reduce((acc, lines) => acc + lines.length, 0);
    const sectionHeight = SECTION_TITLE_HEIGHT + (totalBulletLines * BULLET_LINE_HEIGHT) + SECTION_GAP;

    // Si ça dépasse, on passe à la page suivante
    if (y + sectionHeight > bottomLimit) {
      doc.addPage();
      y = margin;
    }

    // Titre de section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(SECTION_TITLE_SIZE);
    doc.setTextColor(180, 100, 30); // ocre
    doc.text(`${section.icon}  ${section.title}`, margin, y);
    y += 3;
    // Soulignement
    doc.setDrawColor(220, 180, 100);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageW - margin, y);
    y += SECTION_TITLE_HEIGHT - 3;

    // Bullets
    doc.setFont(undefined, 'normal');
    doc.setFontSize(BULLET_SIZE);
    doc.setTextColor(30, 30, 50);
    section.bullets.forEach((bullet, idx) => {
      const lines = doc.splitTextToSize(bullet, contentW - 8);
      lines.forEach((line, li) => {
        // Si on dépasse en plein milieu d'un bullet, on passe à la page suivante
        if (y > bottomLimit) {
          doc.addPage();
          y = margin;
        }
        if (li === 0) {
          doc.setTextColor(180, 100, 30);
          doc.text("•", margin + 2, y);
          doc.setTextColor(30, 30, 50);
        }
        doc.text(line, margin + 8, y);
        y += BULLET_LINE_HEIGHT;
      });
    });
    y += SECTION_GAP;
  }

  // Pied de page sur toutes les pages d'aide-mémoire
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(undefined, 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Préparé avec Orore — Page ${i} / ${pageCount}`, pageW/2, pageH - 10, { align: 'center' });
  }
}

window.generateFichePrepa = generateFichePrepa;