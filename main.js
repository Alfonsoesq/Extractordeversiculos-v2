import { books } from './books.js';

const sermonText = document.getElementById('sermonText');
const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const verseList = document.getElementById('verseList');
const toast = document.getElementById('toast');
const titleDisplay = document.getElementById('titleDisplay');
const temaDisplay = document.getElementById('temaDisplay');
const dateDisplay = document.getElementById('dateDisplay');

extractBtn.addEventListener('click', () => {
  const text = sermonText.value.trim();
  if (!text) return;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0] || 'Sin título';
  const tema = lines[1] || 'Sin tema';

  const today = new Date();
  const day = today.getDay();
  const isSunday = day === 0;
  const isWednesday = day === 3;
  const dateStr = today.toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Display title, tema, and date
  titleDisplay.textContent = title;
  temaDisplay.textContent = tema;
  dateDisplay.textContent = dateStr;

  // Extract verses
  const verses = extractVerses(text);
  displayVerses(verses);

  copyBtn.disabled = verses.length === 0;
});

copyBtn.addEventListener('click', () => {
  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  const fullText = `${titleDisplay.textContent}\n${temaDisplay.textContent}\n${dateDisplay.textContent}\n\n${versesText}`;

  if (!versesText) return;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Versículos copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

function extractVerses(text) {
  const abbreviations = Object.keys(books);
  const bookRegex = new RegExp(
    `\\b(${abbreviations.join('|')})\\.?\\s*\\d+[:.,]?\\s*\\d*`,
    'gi'
  );

  const matches = text.match(bookRegex) || [];

  const cleaned = matches.map(ref => {
    const [abbr, rest] = ref.split(/(?<=\D)(?=\d)/); // Split between letters and digits
    const fullBook = books[abbr.replace('.', '').trim()] || abbr;
    return `${fullBook} ${rest.trim()}`;
  });

  return Array.from(new Set(cleaned)); // Remove duplicates
}

function displayVerses(verses) {
  verseList.innerHTML = '';
  verses.forEach(v => {
    const li = document.createElement('li');
    li.textContent = v;
    verseList.appendChild(li);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
