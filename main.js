// main.js

import books from './books.js';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const sermonText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');

const titleDisplay = document.getElementById('titleDisplay');
const temaDisplay = document.getElementById('temaDisplay');
const dateDisplay = document.getElementById('dateDisplay');
const toast = document.getElementById('toast');

extractBtn.addEventListener('click', () => {
  const text = sermonText.value.trim();
  if (!text) {
    showToast('Por favor, ingresa el texto del sermón.');
    return;
  }

  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  // Show metadata
  titleDisplay.textContent = metadata.title;
  temaDisplay.textContent = metadata.tema;
  dateDisplay.textContent = metadata.date;

  // Clear previous list
  verseList.innerHTML = '';

  if (verses.length === 0) {
    verseList.innerHTML = '<li>No se encontraron versículos.</li>';
    copyBtn.disabled = true;
    return;
  }

  // Add verses to list
  verses.forEach(v => {
    const li = document.createElement('li');
    li.textContent = v;
    verseList.appendChild(li);
  });

  copyBtn.disabled = false;
});

copyBtn.addEventListener('click', () => {
  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  if (!versesText) return;

  navigator.clipboard.writeText(versesText).then(() => {
    showToast('Versículos copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

// Extract title, tema, and date
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

// Extract verses with book name and chapter:verse range
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

// Show toast messages
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
