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

export function extractVerses(text) {
  // Enhanced Regex: Identifies Book + Numbers OR Standalone Numbers
  // Group 1: Optional Book Name (with accents)
  // Group 3: First Number (Chapter or Standalone Verse)
  // Group 4: Optional Second Number (Verse)
  const verseRegex = /(([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+))?[\s\.]*(\d{1,3})(?::(\d{1,3}))?/g;
  
  const matches = [];
  let lastBook = null;
  let lastChapter = null;
  let match;

  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, , rawAbbr, chapterOrVerse, verseOnly] = match;

    // Normalize the abbreviation to check against books.js
    let abbr = rawAbbr ? rawAbbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase() : null;
    let bookName = abbr ? books[abbr] : null;

    if (bookName) {
      // SCENARIO A: We found a book name (e.g., "Juan 3:16" or "Juan 3")
      lastBook = bookName;
      lastChapter = parseInt(chapterOrVerse, 10);
      let verseStart = verseOnly ? parseInt(verseOnly, 10) : null;
      
      if (verseStart) {
        matches.push(`${lastBook} ${lastChapter}:${verseStart}`);
      } else {
        // Just a chapter reference (e.g., "Salmo 23")
        matches.push(`${lastBook} ${lastChapter}`);
      }
    } 
    else if (lastBook && !rawAbbr && !fullMatch.includes(':')) {
      // SCENARIO B: No book found, but we have "memory" of a previous book
      // This handles lists like "Juan 3:16, 18" where '18' is chapterOrVerse
      let nextVerse = parseInt(chapterOrVerse, 10);
      
      // Basic validation: ensure it's not a huge random number
      if (nextVerse > 0 && nextVerse < 200) {
        matches.push(`${lastBook} ${lastChapter}:${nextVerse}`);
      }
    }
  }

  // Remove duplicates and return
  return [...new Set(matches)];
}