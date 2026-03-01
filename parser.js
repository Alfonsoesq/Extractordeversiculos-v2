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
  // HELPER: Resolves book names from either Key (MT) or Value (Mateo)
  const findBookName = (inputAbbr) => {
    if (!inputAbbr) return null;
    const cleanAbbr = inputAbbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    
    // 1. Check if it's a key (e.g., 'MT')
    if (books[cleanAbbr]) return books[cleanAbbr];
    
    // 2. Check if it's a value (e.g., 'MATEO')
    const values = Object.values(books);
    const foundValue = values.find(v => v.toUpperCase() === cleanAbbr);
    return foundValue || null;
  };

  // 1. SET THE ANCHOR FROM TITLE
  const titleRegex = /([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+)\s*(\d{1,3})/i;
  const titleMatch = title ? title.match(titleRegex) : null;
  
  let anchorBook = null;
  let anchorChapter = null;

  if (titleMatch) {
    anchorBook = findBookName(titleMatch[1]);
    anchorChapter = parseInt(titleMatch[2], 10);
  }

  // 2. REGEX FOR MATCHING
  // Groups: 3=ChapterOrStandalone, 4=Verse, 5=Range, 6=StandaloneV, 7=StandaloneVRange, 8=WordVersiculo, 9=WordVersiculoRange
  const verseRegex = /(([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+))?[\s\.]*(\d{1,3})(?::(\d{1,3}))?([-–]\d{1,3})?|(?:\(v(?:v)?\.?\s*(\d{1,3})([-–]\d{1,3})?\))|(?:Versículos\s*(\d{1,3})([-–]\d{1,3})?)/gi;
  
  const matches = [];
  let match;

  // Add the Title itself if it's a valid reference
  if (anchorBook) matches.push(`${anchorBook} ${anchorChapter}`);

  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, , rawAbbr, chOrV, vOnly, rangeEnd, standaloneV, standaloneVRange, wordVersiculo, wordVersiculoRange] = match;

    let currentBook = findBookName(rawAbbr);

    // CASE 1: FULL REFERENCE (e.g., 1Co. 8:1)
    if (currentBook) {
      let ch = parseInt(chOrV, 10);
      let vStart = vOnly ? parseInt(vOnly, 10) : null;
      let vEnd = rangeEnd ? rangeEnd.replace(/[-–]/, '') : null;

      if (vStart) {
        matches.push(vEnd ? `${currentBook} ${ch}:${vStart}-${vEnd}` : `${currentBook} ${ch}:${vStart}`);
      } else {
        matches.push(`${currentBook} ${ch}`);
      }
    } 
    // CASE 2: STANDALONE VERSE (Uses Anchor from Title)
    else if (anchorBook && (standaloneV || wordVersiculo)) {
      let vStart = standaloneV || wordVersiculo;
      let vEndRaw = standaloneVRange || wordVersiculoRange;
      let vEnd = vEndRaw ? vEndRaw.replace(/[-–]/, '') : null;

      matches.push(vEnd ? `${anchorBook} ${anchorChapter}:${vStart}-${vEnd}` : `${anchorBook} ${anchorChapter}:${vStart}`);
    }
  }

  return [...new Set(matches)];
}