import { showToast } from './ui.js';

export function copyToClipboard() {
  const metaText = document.getElementById('metaContainer').textContent.trim();
  const versesText = Array.from(document.getElementById('verseList').children)
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
}
