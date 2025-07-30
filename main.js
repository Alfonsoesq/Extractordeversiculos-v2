// main.js
import books from './books.js';

const extractButton = document.getElementById('extractBtn');
const copyButton = document.getElementById('copyBtn');
const inputText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');

// Create container elements dynamically for metadata display
let metaContainer = document.getElementById('metaContainer');
if (!metaContainer) {
  metaContainer = document.createElement('div');
  metaContainer.id = 'metaContainer';
  inputText.insertAdjacentElement('afterend', metaContainer);
}

const toast = document.createElement('div');
toast.id = 'toast';
document.body.appendChild(toast);

extractButton.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showToast('Por favor ingresa el texto del sermón.');
    return;
  }

  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  // Show metadata on page
  metaContainer.innerHTML = `
    <p><strong>Título:</strong> ${metadata.title}</p>
    <p><strong>Tema:</strong> ${metadata.tema}</p>
    <p><strong>Fecha:</strong> ${metadata.date}</p>
  `;

  // Show verses in list
  verseList.innerHTML = verses.length > 0
    ? verses.map(v => `<li>${v}</li>`).join('')
    : '<li>No se encontraron versículos.</li>';

  // Enable copy button only if verses found
  copyButton.disabled = verses.length === 0;
});

copyButton.addEventListener('click', () => {
  const titleText = metaContainer.querySelector('p:nth-child(1)').textContent;
  const temaText = metaContainer.querySelector('p:nth-child(2)').textContent;
  const dateText = metaContainer.querySelector('p:nth-child(3)').textContent;

  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  if (!versesText) {
    showToast('No hay versículos para copiar.');
    return;
  }

  const textToCopy = `${titleText}\n${temaText}\n${dateText}\n\nVersículos Extraídos:\n${versesText}`;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast('Versículos copiados!');
    })
    .catch(() => {
      showToast('Error al copiar, intenta manualmente.');
    });
});

// --- Helper functions ---

function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const title = lines[0] || 'Título no encontrado';

  let tema = 'Tema no encontrado';
  for (const line of lines.slice(1)) {
    if (line.toLowerCase().startsWith('tema')) {
      tema = line.replace(/^tema[:\s]*/i, ''); // Remove "Tema:" prefix if exists
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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
