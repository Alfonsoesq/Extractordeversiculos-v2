// Function to extract verses from the input text
function extractVerses(text) {
  // Simple regex pattern for common Bible verse format e.g. Juan 3:16 or Génesis 1:1
  const verseRegex = /\b(?:[1-3]?\s?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+\d{1,3}:\d{1,3}(?:-\d{1,3})?\b/g;
  return text.match(verseRegex) || [];
}

// Event listener for the "Extraer Versículos" button
document.getElementById('extractBtn').addEventListener('click', () => {
  const input = document.getElementById('sermonText').value;
  const verses = extractVerses(input);
  const verseList = document.getElementById('verseList');
  verseList.innerHTML = ''; // Clear previous results

  if (verses.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No se encontraron versículos.';
    verseList.appendChild(li);
  } else {
    verses.forEach(verse => {
      const li = document.createElement('li');
      li.textContent = verse;
      verseList.appendChild(li);
    });
  }

  // Enable the copy button if there are results
  document.getElementById('copyBtn').disabled = verses.length === 0;
});

// Event listener for the "Copiar Versículos" button
document.getElementById('copyBtn').addEventListener('click', () => {
  const listItems = document.querySelectorAll('#verseList li');
  const verses = Array.from(listItems)
    .map(li => li.textContent)
    .filter(text => text !== 'No se encontraron versículos.');

  const textToCopy = verses.join('\n');
  navigator.clipboard.writeText(textToCopy)
    .then(() => alert('¡Versículos copiados al portapapeles!'))
    .catch(err => alert('Error al copiar: ' + err));
});
