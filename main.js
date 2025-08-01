// main.js (V2.2.2 – Updated: Proper Verse Range Detection with Book/Chapter Memory)

import books from './books.js';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const sermonText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');
const metaContainer = document.getElementById('metaContainer');
const toast = document.getElementById('toast');

copyBtn.disabled = true;

extractBtn.addEventListener('click', () => {
  const text = sermonText.value.trim();
  if (!text) {
    showToast('Por favor escribe el sermón primero.');
    return;
  }

  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  showMetadata(metadata);
  displayVerses(verses);
  copyBtn.disabled = verses.length === 0;

  if (verses.length === 0) {
    showToast('No se encontraron versículos.');
  }
});

copyBtn.addEventListener('click', () => {
  const metaText = metaContainer.textContent.trim();
  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  if (!versesText) {
    showToast('No hay versículos para copiar.');
    return;
  }

  const fullText = `${metaText}\n\nVersículos Extraídos:\n${versesText}`;
  navigator.clipboard.writeText(fullText)
    .then(() => showToast('Versículos y metadata copiados!'))
    .catch(() => showToast('Error al copiar, intenta manualmente.'));
});

function extractMetadata(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const title = lines[0] || 'Título no encontrado';
  let tema = 'Tema no encontrado';

  for (const line of lines.slice(1)) {
    if (line.toLowerCase().startsWith('tema')) {
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

function extractVerses(text) {
  const matches = [];
  let lastBook = null;
  let lastChapter = null;

  const referenceRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*(\d{1,3})(?::(\d{1,3}))?(?=\)|\b)/g;
  let match;

  while ((match = referenceRegex.exec(text)) !== null) {
    let [_, abbr, chapterStr, verseStr] = match;
    abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    const bookName = books[abbr];
    if (!bookName) continue;

    const chapter = parseInt(chapterStr);
    const verse = verseStr ? parseInt(verseStr) : null;

    lastBook = bookName;
    lastChapter = chapter;

    if (verse === null) {
      matches.push(`${bookName} ${chapter}`);
    } else {
      matches.push(`${bookName} ${chapter}:${verse}`);

      // Check for continuing verses right after this one
      const after = text.slice(referenceRegex.lastIndex, referenceRegex.lastIndex + 500);
      const extraVerses = [...after.matchAll(/\b(\d{1,3})(?=\D)/g)].map(m => parseInt(m[1])).filter(n => !isNaN(n));

      let rangeEnd = verse;
      for (const num of extraVerses) {
        if (num === rangeEnd + 1) {
          rangeEnd = num;
        } else if (num > rangeEnd + 1) {
          break;
        }
      }
      if (rangeEnd > verse) {
        matches.pop();
        matches.push(`${bookName} ${chapter}:${verse}-${rangeEnd}`);
      }
    }
  }

  // Orphan detection (like "53, 54")
  const orphanRegex = /(?:\s|^)(\d{1,3})(?=\D)/g;
  let orphan;
  while ((orphan = orphanRegex.exec(text)) !== null) {
    const num = parseInt(orphan[1]);
    if (lastBook && lastChapter && !matches.some(m => m.includes(`:${num}`))) {
      matches.push(`${lastBook} ${lastChapter}:${num}`);
    }
  }

  return mergeRanges(matches);
}

function mergeRanges(refs) {
  const byBook = {};

  for (const ref of refs) {
    const [bookChap, verses] = ref.split(':');
    if (!verses) {
      if (!byBook[bookChap]) byBook[bookChap] = new Set();
      continue;
    }
    const [start, end] = verses.split('-').map(Number);
    if (!byBook[bookChap]) byBook[bookChap] = new Set();

    if (!isNaN(end)) {
      for (let i = start; i <= end; i++) byBook[bookChap].add(i);
    } else {
      byBook[bookChap].add(start);
    }
  }

  const result = [];
  for (const bookChap in byBook) {
    const verses = [...byBook[bookChap]].sort((a, b) => a - b);
    let rangeStart = verses[0];
    let prev = verses[0];

    for (let i = 1; i <= verses.length; i++) {
      if (verses[i] !== prev + 1) {
        if (rangeStart === prev) {
          result.push(`${bookChap}:${rangeStart}`);
        } else {
          result.push(`${bookChap}:${rangeStart}-${prev}`);
        }
        rangeStart = verses[i];
      }
      prev = verses[i];
    }
  }

  return result;
}

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

function displayVerses(verses) {
  verseList.innerHTML = '';
  if (verses.length === 0) return;
  verses.forEach(v => {
    const li = document.createElement('li');
    li.textContent = v;
    verseList.appendChild(li);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
