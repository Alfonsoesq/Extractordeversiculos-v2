// main.js (V2.2 – Handles verse ranges even if verse 1 number is missing, allows duplicates, Bible book filtering, UI enhancements)

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

// Extract verse references with filtering and duplicates allowed,
// plus smart range detection when verse 1 number is missing in text
function extractVerses(text) {
  // Regex to find verse references like "Gen 1:1" or "2Tim 3:4"
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;

  const matches = [];

  let match;
  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, abbr, chapter, verseStart, verseEnd] = match;

    // Normalize abbreviation, remove dots & spaces, uppercase for key lookup
    abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

    // Lookup full book name - skip if not found to avoid false positives
    const bookName = books[abbr];
    if (!bookName) continue;

    // If verseStart is missing, treat as whole chapter reference
    verseStart = verseStart || null;

    // Look ahead in text to find the verse numbers that appear after the reference
    // We'll check up to 400 characters after the match for verse numbers
    const searchStartIndex = match.index + fullMatch.length;
    const snippet = text.slice(searchStartIndex, searchStartIndex + 400);

    // Regex to find verse numbers in the snippet: match standalone numbers possibly with punctuation or spacing before them
    const verseNumbersInText = [...snippet.matchAll(/(?:^|\s|[^\d])([1-9][0-9]?)(?=\s|\.|,|$)/g)]
      .map(m => parseInt(m[1], 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    let rangeStart = verseStart ? parseInt(verseStart, 10) : null;
    let rangeEnd = verseEnd ? parseInt(verseEnd, 10) : null;

    if (rangeStart !== null) {
      // If there's no explicit verseEnd, try to infer range end from verse numbers in text
      if (!rangeEnd && verseNumbersInText.length > 0) {
        // If the first verse number found is > 1 and rangeStart == 1, then we assume range starts at 1
        // So rangeEnd is the last verse number found in the snippet
        if (rangeStart === 1 && verseNumbersInText[0] > 1) {
          rangeEnd = verseNumbersInText[verseNumbersInText.length - 1];
        } else {
          // Else, if first verse number is equal or less than rangeStart, set rangeEnd to max found verse number
          // This helps in cases like Gen 3:5 where verse numbers start at 5
          rangeEnd = verseNumbersInText[verseNumbersInText.length - 1];
          if (rangeEnd < rangeStart) {
            rangeEnd = null; // ignore if invalid range
          }
        }
      }
    }

    // Build formatted verse string
    let formattedVerse = '';
    if (rangeStart !== null) {
      if (rangeEnd && rangeEnd !== rangeStart) {
        formattedVerse = `${bookName} ${chapter}:${rangeStart}-${rangeEnd}`;
      } else {
        formattedVerse = `${bookName} ${chapter}:${rangeStart}`;
      }
    } else {
      // No verse start means whole chapter reference
      formattedVerse = `${bookName} ${chapter}`;
    }

    matches.push(formattedVerse); // allow duplicates
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
