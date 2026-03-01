import books from './books.js';

export function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const title = lines[0] || 'Título no encontrado';
  let tema = 'Tema no encontrado';

  for (const line of lines.slice(1)) {
    if (line.toLowerCase().startsWith('tema')) {
      tema = line.replace(/^tema\s*:?\s*/i, '');
      break;
    }
  }

  const today = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const formattedDate = `${days[today.getDay()]} ${today.getDate()} de ${months[today.getMonth()]}, ${today.getFullYear()}`;

  return { title, tema, date: formattedDate };
}

export function extractVerses(text, title) {
  // 1. DETERMINE THE ANCHOR FROM TITLE
  // We look at the title (e.g., "Mateo 15") to set the "Home Base"
  const titleRegex = /([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+)\s*(\d{1,3})/i;
  const titleMatch = title.match(titleRegex);
  
  let anchorBook = null;
  let anchorChapter = null;

  if (titleMatch) {
    let abbr = titleMatch[1].replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    anchorBook = books[abbr] || null;
    anchorChapter = parseInt(titleMatch[2], 10);
  }

  // 2. REGEX FOR MATCHING
  // Captures Full Refs, (v. 2), or "Versículos 1-9"
  const verseRegex = /(([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+))?[\s\.]*(\d{1,3})(?::(\d{1,3}))?([-–]\d{1,3})?|(?:\(v(?:v)?\.?\s*(\d{1,3})([-–]\d{1,3})?\))|(?:Versículos\s*(\d{1,3})([-–]\d{1,3})?)/gi;
  
  const matches = [];
  let match;

  // Add the Title itself to the list if it's a valid reference
  if (anchorBook) matches.push(`${anchorBook} ${anchorChapter}`);

  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, , rawAbbr, chapterOrVerse, verseOnly, rangeEnd, standaloneV, standaloneVRange, wordVersiculo, wordVersiculoRange] = match;

    let abbr = rawAbbr ? rawAbbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase() : null;
    let currentBook = abbr ? books[abbr] : null;

    // --- CASE 1: FULL REFERENCE (e.g., 1Co. 8:1) ---
    if (currentBook) {
      let ch = parseInt(chapterOrVerse, 10);
      let vStart = verseOnly ? parseInt(verseOnly, 10) : null;
      let vEnd = rangeEnd ? rangeEnd.replace(/[-–]/, '') : null;

      if (vStart) {
        matches.push(vEnd ? `${currentBook} ${ch}:${vStart}-${vEnd}` : `${currentBook} ${ch}:${vStart}`);
      } else {
        matches.push(`${currentBook} ${ch}`);
      }
    } 
    // --- CASE 2: STANDALONE VERSE (e.g., v. 2 or Versículos 1-9) ---
    // These ALWAYS use the Anchor from the Title
    else if (anchorBook && (standaloneV || wordVersiculo)) {
      let vStart = standaloneV || wordVersiculo;
      let vEndRaw = standaloneVRange || wordVersiculoRange;
      let vEnd = vEndRaw ? vEndRaw.replace(/[-–]/, '') : null;

      matches.push(vEnd ? `${anchorBook} ${anchorChapter}:${vStart}-${vEnd}` : `${anchorBook} ${anchorChapter}:${vStart}`);
    }
  }

  return [...new Set(matches)];
}