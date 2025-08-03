import { extractMetadata, extractVerses } from './parser.js';
import { showMetadata, displayVerses, showToast } from './ui.js';
import { copyToClipboard } from './copier.js';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const sermonText = document.getElementById('sermonText');

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

copyBtn.addEventListener('click', copyToClipboard);
