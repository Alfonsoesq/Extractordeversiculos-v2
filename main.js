// main.js (V2.2.2 – Smart Verse Range Detection)

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
  const verseRegex = /(?:\(|\b)([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)[\s\.]*(\d{1,3})(?::(\d{1,3}))?(?=\)|\b)/g;
  const matches = [];
  let match;

  while ((match = verseRegex.exec(text)) !== null) {
    let [fullMatch, abbr, chapter, verseStartStr] = match;
    abbr = abbr.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
    const bookName = books[abbr];
    if (!bookName) continue;

    const chapterNum = parseInt(chapter, 10);
    const verseStart = verseStartStr ? parseInt(verseStartStr, 10) : null;

    if (!verseStart) {
      matches.push(`${bookName} ${chapterNum}`);
      continue;
    }

    let rangeEnd = verseStart;
    let searchPos = verseRegex.lastIndex;

    const verseArea = text.slice(searchPos, searchPos + 600);
    const numRegex = /(?:\b|\s)(\d{1,3})(?=\D)/g;

    let localMatch;
    while ((localMatch = numRegex.exec(verseArea)) !== null) {
      const num = parseInt(localMatch[1]);

      if (num === rangeEnd + 1) {
        rangeEnd = num;
      } else if (num <= rangeEnd) {
        continue;
      } else {
        break;
      }
    }

    if (rangeEnd > verseStart) {
      matches.push(`${bookName} ${chapterNum}:${verseStart}-${rangeEnd}`);
    } else {
      matches.push(`${bookName} ${chapterNum}:${verseStart}`);
    }
  }

  return matches;
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
