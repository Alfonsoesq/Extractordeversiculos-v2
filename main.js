// V2 - main.js

import books from './books.js';

const extractButton = document.getElementById('extractButton');
const inputText = document.getElementById('inputText');
const outputArea = document.getElementById('outputArea');

extractButton.addEventListener('click', () => {
  const text = inputText.value;
  const metadata = extractMetadata(text);
  const verses = extractVerses(text);
  const formatted = formatOutput(metadata, verses);
  outputArea.value = formatted || 'No se encontraron versículos.';
});

function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const title = lines[0] || 'Título no encontrado';

  let tema = 'Tema no encontrado';
  for (const line of lines.slice(1)) {
    if (line.toLowerCase().startsWith('tema')) {
      tema = line;
      break;
    }
  }

  const today = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const formattedDate = `${days[today.getDay()]} ${today.getDate()} de ${months[today.getMonth()]}, ${today.getFullYear()}`;

  return { title, tema, date: formattedDate };
}

function extractVerses(text) {
  const verseRegex = /(?:\(|\b)([1-3]?[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;
  const matches = new Set();

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [_, abbr, chapter, verseStart, verseEnd] = match;
    abbr = abbr.replace(/\.$/, '').toLowerCase();
    const bookName = books[abbr] || abbr.toUpperCase();
    const range = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
    matches.add(`${bookName} ${chapter}:${range}`);
  }

  return Array.from(matches);
}

function formatOutput(metadata, verses) {
  const { title, tema, date } = metadata;
  const formattedVerses = verses.length > 0 ? verses.map(v => `- ${v}`).join('\n') : '';
  return `Título: ${title}\n${tema}\nFecha: ${date}\n\nVersículos Extraídos:\n${formattedVerses}`;
}
