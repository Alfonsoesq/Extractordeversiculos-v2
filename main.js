// main.js (only showing relevant additions/modifications)

const copyBtn = document.getElementById('copyBtn');
const verseList = document.getElementById('verseList');
const toast = document.getElementById('toast');

copyBtn.addEventListener('click', () => {
  const versesText = Array.from(verseList.children)
    .map(li => li.textContent)
    .join('\n');

  if (!versesText) return;

  navigator.clipboard.writeText(versesText).then(() => {
    showToast('Versículos copiados!');
  }).catch(() => {
    showToast('Error al copiar, intenta manualmente.');
  });
});

// Function to show toast message
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Toast visible for 3 seconds
}
