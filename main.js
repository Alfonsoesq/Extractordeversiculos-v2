import { extractMetadata, extractVerses } from './parser.js';
import { showMetadata, displayVerses, showToast } from './ui.js';
import { copyToClipboard } from './copier.js';
import { generatePDF } from './pdf.js';
// Make jsPDF globally available from the cdn
if (window.jspdf?.jsPDF) {
  window.jsPDF = window.jspdf.jsPDF;
}

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

document.getElementById("download-pdf").addEventListener("click", () => {
  console.log("Download PDF button clicked");

  const metaContainer = document.getElementById('metaContainer');
  const paragraphs = metaContainer.querySelectorAll('p');

  if (paragraphs.length < 3) {
    showToast('Por favor extrae los versículos primero.');
    return;
  }

  // Extract text content by splitting on ':'
  const title = paragraphs[0].textContent.split(':').slice(1).join(':').trim();
  const tema = paragraphs[1].textContent.split(':').slice(1).join(':').trim();
  const fecha = paragraphs[2].textContent.split(':').slice(1).join(':').trim();

  if (!title || !tema || !fecha) {
    showToast('Por favor extrae los versículos primero.');
    return;
  }

  const verses = Array.from(document.getElementById('verseList').children)
    .map(li => li.textContent.trim())
    .filter(text => text.length > 0)
    .join('\n');

  if (!verses) {
    showToast('No hay versículos para exportar.');
    return;
  }

  console.log({ title, tema, fecha, verses });
  generatePDF(title, tema, fecha, verses);
});
