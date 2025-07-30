import books from './books.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Regex to match book abbreviation + chapter + verses, including ranges and multiple verses
  const verseRegex = /\b([1-3]?\s?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\.?)\s(\d+):(\d+(-\d+)?(,\s*\d+(-\d+)?)*)/g;

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    verseList.innerHTML = "";

    let matches = [];
    let match;
    while ((match = verseRegex.exec(input)) !== null) {
      matches.push(match);
    }

    if (matches.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No se encontraron versículos.";
      verseList.appendChild(li);
      copyBtn.disabled = true;
      return;
    }

    matches.forEach((match) => {
      let bookAbbrev = match[1].trim().replace(/\.$/, ''); // remove trailing dot if any
      const chapter = match[2];
      const verses = match[3];

      // Normalize abbreviation to uppercase without dots and spaces for lookup
      const normalizedAbbrev = bookAbbrev.toUpperCase().replace(/\./g, '').replace(/\s/g, '');

      // Find full book name, fallback to original if not found
      const fullBookName = books[normalizedAbbrev] || bookAbbrev;

      const fullVerse = `${fullBookName} ${chapter}:${verses}`;
      const li = document.createElement("li");
      li.textContent = fullVerse;
      verseList.appendChild(li);
    });

    copyBtn.disabled = false;
  });

  copyBtn.addEventListener("click", () => {
    const verses = Array.from(verseList.querySelectorAll("li"))
      .map((li) => li.textContent)
      .join("\n");

    navigator.clipboard.writeText(verses).then(() => {
      alert("Versículos copiados al portapapeles");
    });
  });
});
