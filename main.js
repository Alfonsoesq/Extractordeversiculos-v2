import { bookMap } from './abbreviations.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Build regex pattern from keys of bookMap, escape regex chars
  const validBooksPattern = Object.keys(bookMap)
    .map(book => book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  // Regex to match verses and verse ranges
  const verseRegex = new RegExp(
    `\\b(?:${validBooksPattern})\\s\\d{1,3}:\\d{1,3}(?:[-–]\\d{1,3}|[-–]\\d{1,3}:\\d{1,3})?\\b`,
    "g"
  );

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    const matches = input.match(verseRegex);

    verseList.innerHTML = "";

    if (matches && matches.length > 0) {
      matches.forEach((verse) => {
        // Extract book abbreviation from start of verse string
        const bookAbbrMatch = verse.match(/^[1-3]?\s?[A-ZÁÉÍÓÚÑ\.]+/i);
        let fullBook = "";

        if (bookAbbrMatch) {
          // Normalize key to uppercase and remove dots for lookup
          const abbrKey = bookAbbrMatch[0].toUpperCase().replace(/\./g, '');
          fullBook = bookMap[abbrKey] || bookAbbrMatch[0];
        }

        // Replace abbreviation with full book name
        const fullVerse = verse.replace(bookAbbrMatch[0], fullBook);

        const li = document.createElement("li");
        li.textContent = fullVerse;
        verseList.appendChild(li);
      });
      copyBtn.disabled = false;
    } else {
      const li = document.createElement("li");
      li.textContent = "No se encontraron versículos.";
      verseList.appendChild(li);
      copyBtn.disabled = true;
    }
  });

  copyBtn.addEventListener("click", () => {
    const verses = Array.from(verseList.querySelectorAll("li"))
      .map(li => li.textContent)
      .join("\n");

    navigator.clipboard.writeText(verses).then(() => {
      alert("Versículos copiados al portapapeles");
    });
  });
});
