// Get references to elements
const input = document.getElementById('input-text');
const extractButton = document.getElementById('extract-button');
const resultArea = document.getElementById('result');
const copyButton = document.getElementById('copy-button');

// Handle extract button click
extractButton.addEventListener('click', () => {
  const text = input.value;

  if (!text.trim()) {
    resultArea.textContent = 'Por favor, ingresa un texto.';
    return;
  }

  // Simulate "extraction" by finding lines that contain a colon (e.g., "Juan 3:16")
  const lines = text.split('\n');
  const verses = lines.filter(line => line.match(/\d+:\d+/));

  if (verses.length === 0) {
    resultArea.textContent = 'No se encontraron versículos.';
  } else {
    resultArea.textContent = verses.join('\n');
  }

  // Enable copy button if there are results
  copyButton.disabled = verses.length === 0;
});

// Handle copy button click
copyButton.addEventListener('click', () => {
  const textToCopy = resultArea.textContent;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      alert('Versículos copiados al portapapeles.');
    })
    .catch(err => {
      console.error('Error al copiar:', err);
    });
});
