import books from './books.js';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const sermonText = document.getElementById('sermonText');
const verseList = document.getElementById('verseList');
const toast = document.getElementById('toast');

// Create metadata display elements
const titleDisplay = document.createElement('p');
const temaDisplay = document.createElement('p');
const dateDisplay = document.createElement('p');
titleDisplay.style.display = 'none';
temaDisplay.style.display = 'none';
dateDisplay.style.display = 'none';

// Insert metadata before verseList
verseList.parentNode.insertBefore(titleDisplay, verseList);
verseList.parentNode.insertBefore(temaDisplay, verseList);
verseList.parentNode.insertBefore(dateDisplay, verseList);

extractBtn.addEventListener('click', () => {
  const text = sermonText.value.trim();
  if (!text) return;

  const metadata = extractMetadata(text);
  const verses = extractVerses(text);

  // Clear previous list
  verseList.innerHTML = '';

  // Display metadata
  const cleanedTema = metadata.tema.replace(/^tema[:\s]*/i, ''); // Remove duplicate "Tema:"
  titleDisplay.textContent = metadata.title;
  temaDisplay.textContent = cleanedTema;
  dateDisplay.textContent = metadata.date;
  titleDisplay.style.display = 'block';
  temaDisplay.style.display = 'block';
  dateDisplay.style.display = 'block';

  // Populate verse list
  verses.forEach(verse => {
    const li = document.createElement('li');
    li.textContent = verse;
    verseList.appendChild(li);
  });

  // Enable copy button if verses exist
  copyBtn.disabled = verses.length === 0;
});

copyBtn.addEventListener('click', () => {
  const title = titleDisplay.textContent;
  const tema = temaDisplay.textContent;
  const date = dateDisplay.textContent;

  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  const fullText = `${title}\n${tema}\n${date}\n\n${versesText}`;

  if (!versesText) return;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Versículos copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

// Toast display function
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Extract metadata: title, tema, date
function extractMetadata(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const title = lines[0] || 'Título no encontrado';
  const temaCandidate = lines[1] || '';
  const tema = temaCandidate.toLowerCase().includes('tema') ? temaCandidate : `Tema: ${temaCandidate}`;

  const now = new Date();
  const weekday = now.getDay(); // 0 = Sun, 3 = Wed
  const isSunday = weekday === 0;
  const isWednesday = weekday === 3;

  let sermonDate = new Date(now);
  if (!isSunday && !isWednesday) {
    sermonDate.setDate(now.getDate() - 1); // fallback: use yesterday
  }

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = sermonDate.toLocaleDateString('es-MX', options);

  return {
    title,
    tema,
    date: `Fecha: ${formattedDate}`
  };
}

// Extract verses using book list
function extractVerses(text) {
  const versePattern = new RegExp(
    `\\b(${books.join('|')})\\s+(\\d+):(\\d+(?:[-,]\\d+)*)`,
    'gi'
  );

  const found = [];
  let match;
  while ((match = versePattern.exec(text)) !== null) {
    found.push(match[0]);
  }
  return found;
}
