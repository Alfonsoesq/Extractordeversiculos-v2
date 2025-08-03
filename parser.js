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
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*(\d{1,3})(?::(\d{1,3}))?(?=\)|\b)/g;
  const matches = [];
  let match;

  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, abbr, chapter, verseStartStr] = match;
    abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    const bookName = books[abbr];
    if (!bookName) continue;

    const chapterNum = parseInt(chapter, 10);
    const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : null;

    if (!verseStart) {
      matches.push(`${bookName} ${chapterNum}`);
      continue;
    }

    let rangeEnd = verseStart;
    let searchPos = verseRegex.lastIndex;
    const verseArea = text.slice(searchPos, searchPos + 600);
    const numRegex = /(?:\b|\s)(\d{1,3})(?=\D)/g;

    let localMatch;
    while ((localMatch = numRegex.exec(verseArea)) !== null) {
      const num = parseInt(localMatch[1]);
      if (num === rangeEnd + 1) {
        rangeEnd = num;
      } else if (num <= rangeEnd) {
        continue;
      } else {
        break;
      }
    }

    if (rangeEnd > verseStart) {
      matches.push(`${bookName} ${chapterNum}:${verseStart}-${rangeEnd}`);
    } else {
      matches.push(`${bookName} ${chapterNum}:${verseStart}`);
    }
  }

  return matches;
}
