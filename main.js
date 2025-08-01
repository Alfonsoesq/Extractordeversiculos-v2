import { books } from './books.js';

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[”“"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function expandBook(abbrev) {
  const key = Object.keys(books).find(k => {
    return books[k].abbreviations.includes(abbrev.toLowerCase());
  });
  return key || abbrev;
}

function extractVerses(text) {
  const regex = /(?:\b([1-3]?\s?[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,})\.?\s+)?(\d+):(\d+)(?:-(\d+))?/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const bookRaw = match[1]?.trim() || matches[matches.length - 1]?.book || "";
    const chapter = parseInt(match[2]);
    const verseStart = parseInt(match[3]);
    const verseEnd = match[4] ? parseInt(match[4]) : verseStart;
    const book = expandBook(normalizeText(bookRaw));

    matches.push({ book, chapter, verseStart, verseEnd });
  }

  return matches;
}

function groupVerses(verses) {
  const grouped = {};

  for (const { book, chapter, verseStart, verseEnd } of verses) {
    const key = `${book} ${chapter}`;
    if (!grouped[key]) grouped[key] = [];

    grouped[key].push({ start: verseStart, end: verseEnd });
  }

  const final = [];

  for (const key in grouped) {
    const [book, chapter] = key.split(" ");
    const ranges = grouped[key]
      .sort((a, b) => a.start - b.start)
      .reduce((acc, curr) => {
        const last = acc[acc.length - 1];
        if (!last || curr.start > last.end + 1) {
          acc.push({ ...curr });
        } else {
          last.end = Math.max(last.end, curr.end);
        }
        return acc;
      }, []);

    for (const range of ranges) {
      const versePart = range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`;
      final.push(`${book} ${chapter}:${versePart}`);
    }
  }

  return final;
}

// SERMON STRUCTURE EXTRACTION
function extractStructure(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0] || "";
  const tema = lines.find(line => /tema[:\-]/i.test(line)) || "";
  const fecha = lines.find(line => /fecha[:\-]/i.test(line)) || "";

  return {
    title: title.replace(/^t[ií]tulo[:\-]?\s*/i, ""),
    tema: tema.replace(/^tema[:\-]?\s*/i, ""),
    fecha: fecha.replace(/^fecha[:\-]?\s*/i, "")
  };
}

// MAIN FUNCTION
export function processSermon(text) {
  const verses = extractVerses(text);
  const grouped = groupVerses(verses);
  const { title, tema, fecha } = extractStructure(text);

  return {
    title,
    tema,
    fecha,
    verses: [...new Set(grouped)].sort()
  };
}
