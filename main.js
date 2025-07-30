// main.js (V2 with full copy including metadata and verses)

import books from './books.js';

const extractButton = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const inputText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');

// Create display elements for metadata
const titleDisplay = document.createElement('p');
const temaDisplay = document.createElement('p');
const dateDisplay = document.createElement('p');
verseList.parentNode.insertBefore(titleDisplay, verseList);
verseList.parentNode.insertBefore(temaDisplay, verseList);
verseList.parentNode.insertBefore(dateDisplay, verseList);

const toast = document.createElement('div');
toast.id = 'toast';
document.body.appendChild(toast);

extractButton.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showToast('Por favor, ingresa el texto del sermón.');
    return;
  }

  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  // Update metadata display
  titleDisplay.textContent = `Título: ${metadata.title}`;
  temaDisplay.textContent = `Tema: ${metadata.tema}`;
  dateDisplay.textContent = `Fecha: ${metadata.date}`;

  // Clear previous verses
  verseList.innerHTML = '';

  if (verses.length === 0) {
    verseList.innerHTML = '<li>No se encontraron versículos.</li>';
    copyBtn.disabled = true;
  } else {
    verses.forEach(v => {
      const li = document.createElement('li');
      li.textContent = v;
      verseList.appendChild(li);
    });
    copyBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', () => {
  const metadataText = 
    `${titleDisplay.textContent}\n` +
    `${temaDisplay.textContent}\n` +
    `${dateDisplay.textContent}\n\n` +
    `Versículos Extraídos:\n`;

  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  if (!versesText) {
    showToast('No hay versículos para copiar.');
    return;
  }

  const fullText = metadataText + versesText;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Versículos y metadatos copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

// Extracts title, tema (topic), and today's date formatted in Spanish
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

// Extract verses with book abbreviations and chapter:verse ranges
function extractVerses(text) {
  const verseRegex = /(?:\(|\b)([1-3]?[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;
  const matches = new Set();

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [_, abbr, chapter, verseStart, verseEnd] = match;
    abbr = abbr.replace(/\.$/, '').toUpperCase(); // normalize abbreviation
    const bookName = books[abbr] || abbr;
    const range = verseEnd ? `${verseStart}-${verseEnd}` : verseStart || '';
    matches.add(`${bookName} ${chapter}:${range}`);
  }

  return Array.from(matches);
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
