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

  // 1. Get metadata (Tema will be null if not found)
  const metadata = extractMetadata(text);
  
  // 2. Extract and Collapse Verses
  const verses = extractVerses(text, metadata.title);

  // 3. Update UI
  showMetadata(metadata);
  
  // Logic to hide the Tema line in the UI if it's null
  const metaContainer = document.getElementById('metaContainer');
  const paragraphs = metaContainer.querySelectorAll('p');
  if (paragraphs[1]) {
    paragraphs[1].style.display = metadata.tema ? 'block' : 'none';
  }

  displayVerses(verses);
  copyBtn.disabled = verses.length === 0;

  if (verses.length === 0) {
    showToast('No se encontraron versículos.');
  }
});

copyBtn.addEventListener('click', copyToClipboard);

document.getElementById("download-pdf").addEventListener("click", () => {
  const metaContainer = document.getElementById('metaContainer');
  const paragraphs = metaContainer.querySelectorAll('p');

  if (paragraphs.length < 2) {
    showToast('Por favor extrae los versículos primero.');
    return;
  }

  // Extract text content carefully
  const title = paragraphs[0].textContent.split(':').slice(1).join(':').trim();
  
  // Only grab the Tema if the element is visible
  const temaRaw = paragraphs[1].textContent.split(':').slice(1).join(':').trim();
  const tema = (paragraphs[1].style.display === 'none') ? "" : temaRaw;
  
  const fecha = paragraphs[2].textContent.split(':').slice(1).join(':').trim();

  const verses = Array.from(document.getElementById('verseList').children)
    .map(li => li.textContent.trim())
    .filter(text => text.length > 0)
    .join('\n');

  if (!verses) {
    showToast('No hay versículos para exportar.');
    return;
  }

  // Call PDF generator with cleaned up data
  generatePDF(title, tema, fecha, verses);
});