// main.js (V2)

import books from './books.js';

document.addEventListener('DOMContentLoaded', () => {
  const extractButton = document.getElementById('extractBtn');
  const inputText = document.getElementById('sermonText');
  const outputArea = document.getElementById('verseList');

  extractButton.addEventListener('click', () => {
    const text = inputText.value;
    const metadata = extractMetadata(text);
    const verses = extractVerses(text);

    // Clear previous results
    outputArea.innerHTML = '';

    // Show metadata as list items
    const metaTitle = document.createElement('li');
    metaTitle.textContent = `Título: ${metadata.title}`;
    outputArea.appendChild(metaTitle);

    const metaTema = document.createElement('li');
    metaTema.textContent = `${metadata.tema}`;
    outputArea.appendChild(metaTema);

    const metaDate = document.createElement('li');
    metaDate.textContent = `Fecha: ${metadata.date}`;
    outputArea.appendChild(metaDate);

    if (verses.length === 0) {
      const noVerses = document.createElement('li');
      noVerses.textContent = 'No se encontraron versículos.';
      outputArea.appendChild(noVerses);
    } else {
      for (const verse of verses) {
        const li = document.createElement('li');
        li.textContent = verse;
        outputArea.appendChild(li);
      }
    }
  });
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
    abbr = abbr.replace(/\.$/, '').toUpperCase();
    const bookName = books[abbr] || abbr;
    const range = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
    matches.add(`${bookName} ${chapter}:${range}`);
  }

  return Array.from(matches);
}
