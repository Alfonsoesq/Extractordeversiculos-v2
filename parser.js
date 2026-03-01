import books from './books.js';

/**
 * Extracts Title, Tema, and Date from the sermon text.
 */
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

/**
 * Extracts Bible verses using a Hybrid Anchor logic.
 * Standalone verses like (v. 2) always point back to the Book/Chapter in the Title.
 */
export function extractVerses(text, title) {
  // Helper to find book name from Key (MT) or Value (Mateo)
  const findBookName = (inputAbbr) => {
    if (!inputAbbr) return null;
    const cleanAbbr = inputAbbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    
    // 1. Direct Key Lookup
    if (books[cleanAbbr]) return books[cleanAbbr];
    
    // 2. Reverse Value Lookup (Supports "Mateo" -> "Mateo")
    const values = Object.values(books);
    const foundValue = values.find(v => v.toUpperCase() === cleanAbbr);
    return foundValue || null;
  };

  // 1. Set the Anchor from the Title
  const titleRegex = /([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+)\s*(\d{1,3})/i;
  const titleMatch = title ? title.match(titleRegex) : null;
  
  let anchorBook = null;
  let anchorChapter = null;

  if (titleMatch) {
    anchorBook = findBookName(titleMatch[1]);
    anchorChapter = parseInt(titleMatch[2], 10);
  }

  // 2. The Extraction Logic
  const verseRegex = /(([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+))?[\s\.]*(\d{1,3})(?::(\d{1,3}))?([-–]\d{1,3})?|(?:\(v(?:v)?\.?\s*(\d{1,3})([-–]\d{1,3})?\))|(?:Versículos\s*(\d{1,3})([-–]\d{1,3})?)/gi;
  
  const matches = [];
  let match;

  // Add the Title itself to the results
  if (anchorBook) matches.push(`${anchorBook} ${anchorChapter}`);

  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, , rawAbbr, chOrV, vOnly, rangeEnd, standaloneV, standaloneVRange, wordVersiculo, wordVersiculoRange] = match;

    let currentBook = findBookName(rawAbbr);

    // CASE 1: Full Reference found (e.g. 1Co 8:1)
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
    // CASE 2: Standalone or "Versículos" shorthand (Uses the Anchor)
    else if (anchorBook && (standaloneV || wordVersiculo)) {
      let vStart = standaloneV || wordVersiculo;
      let vEndRaw = standaloneVRange || wordVersiculoRange;
      let vEnd = vEndRaw ? vEndRaw.replace(/[-–]/, '') : null;

      matches.push(vEnd ? `${anchorBook} ${anchorChapter}:${vStart}-${vEnd}` : `${anchorBook} ${anchorChapter}:${vStart}`);
    }
  }

  // Returns all matches in order, including duplicates
  return matches; 
}