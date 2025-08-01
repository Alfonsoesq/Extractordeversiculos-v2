// main.js (V2.2.1 – Smarter verse range detection, allows single-verse extension)

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

// Extract verse references with smarter range detection
function extractVerses(text) {
  const lines = text.split(/\r?\n/);
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*([0-9]{1,3})(?::([0-9]{1,3})(?:-([0-9]{1,3}))?)?(?=\)|\b)/g;

  const results = [];

  // Normalize books keys for quick lookup
  const bookKeys = Object.keys(books);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    while ((match = verseRegex.exec(line)) !== null) {
      let [fullMatch, abbr, chapter, verseStart, verseEnd] = match;

      abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

      // Lookup full book name
      const bookName = books[abbr];
      if (!bookName) continue;

      // If there is already a verseEnd from regex (e.g., 1:1-3), just use that
      if (verseEnd) {
        results.push(`${bookName} ${chapter}:${verseStart}-${verseEnd}`);
        continue;
      }

      // If no verseStart, treat as chapter only
      if (!verseStart) {
        results.push(`${bookName} ${chapter}`);
        continue;
      }

      // Now: check next lines for explicit verse numbers continuing chapter
      let lastVerse = parseInt(verseStart, 10);

      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (!nextLine) continue;

        // Check if next line starts with a number (verse number)
        const verseNumMatch = nextLine.match(/^(\d{1,3})\b/);
        if (!verseNumMatch) break; // no verse number starting next line → stop looking

        const nextVerseNum = parseInt(verseNumMatch[1], 10);

        // Only consider if nextVerseNum is exactly 1 greater than lastVerse AND
        // same chapter (since no book or chapter mentioned here, we assume continuation)
        if (nextVerseNum === lastVerse + 1) {
          lastVerse = nextVerseNum;
        } else {
          break;
        }
      }

      // Compose verse or verse range accordingly
      if (lastVerse > parseInt(verseStart, 10)) {
        results.push(`${bookName} ${chapter}:${verseStart}-${lastVerse}`);
      } else {
        results.push(`${bookName} ${chapter}:${verseStart}`);
      }
    }
  }

  return results;
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
