// main.js
import books from './books.js';

const extractButton = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const inputText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');
const toast = document.getElementById('toast');

extractButton.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    showToast('Por favor ingresa texto del sermón.');
    return;
  }

  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  if (verses.length === 0) {
    showToast('No se encontraron versículos.');
    verseList.innerHTML = '';
    hideMetadata();
    copyBtn.disabled = true;
    return;
  }

  showMetadata(metadata);
  renderVerses(verses);
  copyBtn.disabled = false;
});

copyBtn.addEventListener('click', () => {
  const metadataText = getMetadataText();
  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  const fullText = `${metadataText}\n\nVersículos Extraídos:\n${versesText}`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Versículos copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

// Extract title, tema, and date from sermon text
function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const title = lines[0] || 'Título no encontrado';

  let tema = 'Tema no encontrado';
  for (const line of lines.slice(1)) {
    if (line.toLowerCase().startsWith('tema')) {
      tema = line.replace(/tema[:\s]*/i, '').trim();
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
  // Regex to capture book abbrev, chapter, verse range
  const verseRegex = /(?:\(|\b)([1-3]?[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;
  const matches = new Set();

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [_, abbr, chapter, verseStart, verseEnd] = match;
    abbr = abbr.replace(/\.$/, '').toUpperCase();

    if (!(abbr in books)) {
      // Skip non-bible books
      continue;
    }

    const bookName = books[abbr];
    const range = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
    matches.add(`${bookName} ${chapter}:${range}`);
  }

  return Array.from(matches);
}

function renderVerses(verses) {
  verseList.innerHTML = '';
  verses.forEach(v => {
    const li = document.createElement('li');
    li.textContent = v;
    verseList.appendChild(li);
  });
}

function showMetadata({ title, tema, date }) {
  document.getElementById('metadataTitle').textContent = title;
  document.getElementById('metadataTema').textContent = tema;
  document.getElementById('metadataDate').textContent = date;

  document.getElementById('metadata').style.display = 'block';
}

function hideMetadata() {
  document.getElementById('metadata').style.display = 'none';
}

function getMetadataText() {
  const title = document.getElementById('metadataTitle').textContent;
  const tema = document.getElementById('metadataTema').textContent;
  const date = document.getElementById('metadataDate').textContent;

  return `Título: ${title}\nTema: ${tema}\nFecha: ${date}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
