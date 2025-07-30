import { bookMap } from './abbreviations.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Escape special regex chars in string
  function escapeForRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Build regex pattern allowing optional spaces/dots
  const bookKeys = Object.keys(bookMap).map(key =>
    escapeForRegex(key)
      .replace(/\s+/g, '\\s?')
      .replace(/\./g, '\\.?')
  );

  const validBooksPattern = bookKeys.join('|');

  // Match verses, allowing optional ranges like 1:1-2 or 1:1-2:3
  const verseRegex = new RegExp(
    `\\b(?:${validBooksPattern})\\s\\d{1,3}:\\d{1,3}(?:[-–]\\d{1,3}(?::\\d{1,3})?)?\\b`,
    'gi'  // global + case insensitive
  );

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    const matches = input.match(verseRegex);

    verseList.innerHTML = "";

    if (matches && matches.length > 0) {
      matches.forEach((verse) => {
        // Extract abbreviation at start of verse
        const bookAbbrMatch = verse.match(/^[1-3]?\s?[A-ZÁÉÍÓÚÑ\.]+/i);

        let fullBook = "";
        if (bookAbbrMatch) {
          // Normalize key: uppercase + remove spaces/dots for lookup
          const abbrKey = bookAbbrMatch[0].toUpperCase().replace(/[\s\.]/g, '');
          fullBook = bookMap[abbrKey] || bookAbbrMatch[0];
        }

        // Replace abbreviation in verse with full book name
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
