// main.js (V2.2.1 – Allows duplicate verses, Bible book filtering, UI enhancements, and improved verse range extraction)

import books from './books.js';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const sermonText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');
const metaContainer = document.getElementById('metaContainer');
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
  const metaText = metaContainer.textContent.trim();
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

// Extract verse references with filtering, duplicates allowed, and extended verse ranges scanning
function extractVerses(text) {
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3}))?(?=\)|\b)/g;

  const matches = [];

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, abbr, chapter, verseStartStr] = match;

    // Normalize abbreviation, remove dots & spaces, uppercase for key lookup
    abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    const bookName = books[abbr];
    if (!bookName) continue;

    const chapterNum = parseInt(chapter, 10);
    const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : null;

    // If no verse number (only chapter), just add chapter reference
    if (!verseStart) {
      matches.push(`${bookName} ${chapterNum}`);
      continue;
    }

    // Starting index in text for scanning next verses
    let rangeEnd = verseStart;

    // Position after this match in text
    let searchPos = verseRegex.lastIndex;

    // Regex to find verse numbers that may follow, like: " 20 ", " 21.", " 22,", etc.
    // It should NOT match a new book reference, so exclude letters
    const nextVerseRegex = /(?:^|[\s\.,;])(\d{1,3})(?=\D)/g; 

    nextVerseRegex.lastIndex = searchPos;

    while (true) {
      const nextMatch = nextVerseRegex.exec(text);
      if (!nextMatch) break;

      const nextVerseNum = parseInt(nextMatch[1], 10);

      // Only accept consecutive verse numbers (exactly +1)
      if (nextVerseNum === rangeEnd + 1) {
        rangeEnd = nextVerseNum;
        searchPos = nextVerseRegex.lastIndex;
        nextVerseRegex.lastIndex = searchPos;
      } else if (nextVerseNum <= rangeEnd) {
        // Already included or repeated verse, skip and continue scanning
        searchPos = nextVerseRegex.lastIndex;
        nextVerseRegex.lastIndex = searchPos;
      } else {
        // Non-consecutive verse found, stop range scanning
        break;
      }
    }

    // Format final verse string
    if (rangeEnd > verseStart) {
      matches.push(`${bookName} ${chapterNum}:${verseStart}-${rangeEnd}`);
    } else {
      matches.push(`${bookName} ${chapterNum}:${verseStart}`);
    }
  }

  return matches;
}

// Show metadata in metaContainer with fade-in
function showMetadata({ title, tema, date }) {
  metaContainer.style.opacity = 0;
  metaContainer.style.display = 'block';
  metaContainer.innerHTML = `
    <p><strong>Título:</strong> ${title}</p>
    <p><strong>Tema:</strong> ${tema}</p>
    <p><strong>Fecha:</strong> ${date}</p>
  `;

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
