// main.js (V2 updated for better UI & meta display)

import books from './books.js';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const sermonText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');
const metaContainer = document.getElementById('metaContainer');
const metadataTitle = document.getElementById('metadataTitle');
const metadataTema = document.getElementById('metadataTema');
const metadataDate = document.getElementById('metadataDate');
const toast = document.getElementById('toast');

// Initially disable copy button
copyBtn.disabled = true;

extractBtn.addEventListener('click', () => {
  const text = sermonText.value.trim();

  if (!text) {
    showToast('Por favor escribe el sermón primero.');
    return;
  }

  // Extract metadata & verses
  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  // Show metadata (title, tema, date) nicely in metaContainer
  showMetadata(metadata);

  // Show verses in list
  displayVerses(verses);

  // Enable or disable copy button based on verses found
  copyBtn.disabled = verses.length === 0;

  if (verses.length === 0) {
    showToast('No se encontraron versículos.');
  }
});

copyBtn.addEventListener('click', () => {
  // Compose full text to copy: meta + verses
  const metaText = `Título: ${metadataTitle.textContent}
Tema: ${metadataTema.textContent}
Fecha: ${metadataDate.textContent}`;

  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  if (!versesText) {
    showToast('No hay versículos para copiar.');
    return;
  }

  const fullText = `${metaText}\n\nVersículos Extraídos:\n${versesText}`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Versículos y metadata copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

// Extract title, tema, date from sermon text
function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

  const title = lines[0] || 'Título no encontrado';

  let tema = 'Tema no encontrado';
  for (const line of lines.slice(1)) {
    if (line.toLowerCase().startsWith('tema')) {
      // Remove "Tema:" prefix if exists, trim spaces
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

// Extract verse references with improved regex and book abbreviation mapping
function extractVerses(text) {
  // Regex explanation:
  // Matches optional opening "(" or word boundary
  // Then book abbreviation (including 1,2,3 prefix)
  // Then optional dot or spaces
  // Then chapter number
  // Then optional :verse or verse range (e.g. 1:1-32)
  // Stops before closing ")" or word boundary
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;

  const matches = new Set();

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [_, abbr, chapter, verseStart, verseEnd] = match;

    // Normalize abbreviation, remove spaces & dots, uppercase for matching keys
    abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

    // Lookup full book name
    const bookName = books[abbr] || abbr;

    const range = verseEnd ? `${verseStart}-${verseEnd}` : verseStart || '';

    // Format like: "Lucas 15:1-32" or "Hebreos 1"
    const formattedVerse = range ? `${bookName} ${chapter}:${range}` : `${bookName} ${chapter}`;

    matches.add(formattedVerse);
  }

  return Array.from(matches);
}

// Show metadata in metaContainer with fade-in
function showMetadata({ title, tema, date }) {
  metadataTitle.textContent = title;
  metadataTema.textContent = tema;
  metadataDate.textContent = date;

  metaContainer.style.opacity = 0;
  metaContainer.style.display = 'block';

  // Animate fade in
  setTimeout(() => {
    metaContainer.style.transition = 'opacity 0.4s ease';
    metaContainer.style.opacity = 1;
  }, 20);
}

// Display verses in the verseList as <li>
function displayVerses(verses) {
  verseList.innerHTML = '';

  if (verses.length === 0) return;

  verses.forEach(v => {
    const li = document.createElement('li');
    li.textContent = v;
    verseList.appendChild(li);
  });
}

// Show toast notifications with fade in/out
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
