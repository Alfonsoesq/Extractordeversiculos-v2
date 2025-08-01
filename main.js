// main.js (V2.2 – Allows duplicate verses, Bible book filtering, UI enhancements, and verse range detection)

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

// Extract verse references with filtering, duplicates allowed, and expanded verse ranges
function extractVerses(text) {
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;

  const matches = [];

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, abbr, chapter, verseStart, verseEnd] = match;

    // Normalize abbreviation, remove dots & spaces, uppercase for key lookup
    const abbrKey = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

    // Lookup full book name - skip if not found to avoid false positives
    const bookName = books[abbrKey];
    if (!bookName) continue;

    // Determine the position right after this match in the text to look ahead for verses
    const afterMatchIndex = verseRegex.lastIndex;

    // Prepare to find continuous verses if verseEnd is not specified (i.e., no explicit range)
    let rangeEnd = verseEnd ? Number(verseEnd) : null;
    const startVerseNum = verseStart ? Number(verseStart) : null;

    if (!rangeEnd && startVerseNum !== null) {
      // Look ahead in text to find following verses for this same book and chapter
      // Extract text after current match up to next verse reference or end of text
      const textAfter = text.slice(afterMatchIndex);

      // Match possible verse numbers at start of lines or after spaces
      // Only accept numbers that:
      // 1) appear at start of lines or after line breaks
      // 2) are NOT part of a new book name (avoid letters after number)
      // We'll match numbers like "2", "3", ... that might indicate following verses

      // Regex to find verse numbers at start of lines or after whitespace:
      // Matches lines starting with number optionally followed by punctuation and space
      const verseNumberRegex = /^(\d+)(?=[\s\.\,\:\-])/gm;

      // Find all matches to verseNumberRegex in textAfter
      const verseNumbers = [];
      let vnMatch;
      while ((vnMatch = verseNumberRegex.exec(textAfter)) !== null) {
        const candidateVerse = Number(vnMatch[1]);

        // If candidateVerse is exactly one greater than previous or startVerseNum,
        // or consecutive, include it; else break (stop at first gap)
        if (verseNumbers.length === 0) {
          if (candidateVerse === startVerseNum + 1) {
            verseNumbers.push(candidateVerse);
          } else {
            break; // no consecutive verses after startVerseNum
          }
        } else {
          if (candidateVerse === verseNumbers[verseNumbers.length - 1] + 1) {
            verseNumbers.push(candidateVerse);
          } else {
            break; // break on first non-consecutive
          }
        }
      }

      if (verseNumbers.length > 0) {
        rangeEnd = verseNumbers[verseNumbers.length - 1];
      }
    }

    const range = rangeEnd ? `${startVerseNum}-${rangeEnd}` : startVerseNum !== null ? `${startVerseNum}` : '';

    const formattedVerse = range ? `${bookName} ${chapter}:${range}` : `${bookName} ${chapter}`;

    matches.push(formattedVerse);
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
