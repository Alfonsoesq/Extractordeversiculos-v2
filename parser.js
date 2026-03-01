import books from './books.js';

export function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const title = lines[0] || 'Título no encontrado';
  let tema = null; // Changed to null so we can detect if it's missing

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
  const findBookName = (inputAbbr) => {
    if (!inputAbbr) return null;
    const cleanAbbr = inputAbbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    if (books[cleanAbbr]) return books[cleanAbbr];
    const values = Object.values(books);
    const foundValue = values.find(v => v.toUpperCase() === cleanAbbr);
    return foundValue || null;
  };

  // 1. Set Anchor
  const titleRegex = /([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+)\s*(\d{1,3})/i;
  const titleMatch = title ? title.match(titleRegex) : null;
  let anchorBook = null;
  let anchorChapter = null;

  if (titleMatch) {
    anchorBook = findBookName(titleMatch[1]);
    anchorChapter = parseInt(titleMatch[2], 10);
  }

  // 2. The Regex (Improved to catch standalone Ch:V patterns like ; 24:12)
  const verseRegex = /(([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+))?[\s\.]*(\d{1,3}):(\d{1,3})([-–]\d{1,3})?|(([1-3]?\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\.]+))?[\s\.]*(\d{1,3})|(?:\(v(?:v)?\.?\s*(\d{1,3})([-–]\d{1,3})?\))|(?:Versículos\s*(\d{1,3})(?:[-–](\d{1,3}))?)/gi;
  
  const matches = [];
  let lastBook = anchorBook;
  let lastChapter = anchorChapter;
  let match;

  if (anchorBook) matches.push({ book: anchorBook, chapter: anchorChapter, verse: null });

  while ((match = verseRegex.exec(text)) !== null) {
    let [full, b1, rb1, c1, v1, r1, b2, rb2, c2, sv1, svr1, wv1, wvr1] = match;

    let book = findBookName(rb1 || rb2);
    if (book) lastBook = book;

    // Logic for Ch:V patterns (e.g. 21:2 or 24:12)
    if (c1 && v1) {
      lastChapter = parseInt(c1, 10);
      let vStart = parseInt(v1, 10);
      let vEnd = r1 ? parseInt(r1.replace(/[-–]/, ''), 10) : null;
      if (lastBook) matches.push({ book: lastBook, chapter: lastChapter, verse: vStart, end: vEnd });
    }
    // Logic for Book Chapter patterns (e.g. Mateo 15)
    else if (c2 && book) {
      lastChapter = parseInt(c2, 10);
      matches.push({ book: lastBook, chapter: lastChapter, verse: null });
    }
    // Logic for shorthands (v. 2) or (Versículos 1-9)
    else if (anchorBook && (sv1 || wv1)) {
      let vStart = parseInt(sv1 || wv1, 10);
      let vEnd = (svr1 || wvr1) ? parseInt((svr1 || wvr1).replace(/[-–]/, ''), 10) : null;
      matches.push({ book: anchorBook, chapter: anchorChapter, verse: vStart, end: vEnd });
    }
  }

  // 3. THE COLLAPSE LOGIC
  // This groups consecutive verses: Mateo 15:1, Mateo 15:2 -> Mateo 15:1-2
  const collapsed = [];
  for (let m of matches) {
    let last = collapsed[collapsed.length - 1];
    if (last && m.verse && last.verse && m.book === last.book && m.chapter === last.chapter && (m.verse === last.end + 1 || m.verse === last.verse + 1)) {
      last.end = m.end || m.verse;
    } else {
      collapsed.push({ ...m, end: m.end || m.verse });
    }
  }

  return collapsed.map(m => {
    if (!m.verse) return `${m.book} ${m.chapter}`;
    return m.end && m.end !== m.verse ? `${m.book} ${m.chapter}:${m.verse}-${m.end}` : `${m.book} ${m.chapter}:${m.verse}`;
  });
}