import { books } from './books.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Regex to match verses like "Gen 1:1-3", "Lc. 15:1-32", etc.
  // It captures:
  // 1. Book abbreviation (with optional number prefix and optional dot)
  // 2. Chapter number
  // 3. Verse or verse range (optional)
  const verseRegex = new RegExp(
    `\\b((?:[1-3]\\s)?[A-ZÁÉÍÓÚÑ]{1,5}\\.?)\\s(\\d+):(\\d+(-\\d+)?)\\b`,
    "gi"
  );

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    verseList.innerHTML = "";

    let matches = [];
    let match;
    while ((match = verseRegex.exec(input)) !== null) {
      let rawBook = match[1].toUpperCase().replace(/\./g, "").trim();
      const chapter = match[2];
      const verses = match[3];

      // Look up the full book name from the abbreviation map
      const fullBook = books[rawBook] || null;

      if (fullBook) {
        // Compose full verse string with full book name
        const verseString = `${fullBook} ${chapter}:${verses}`;
        matches.push(verseString);
      }
    }

    if (matches.length > 0) {
      // Remove duplicates
      const uniqueMatches = [...new Set(matches)];
      uniqueMatches.forEach((verse) => {
        const li = document.createElement("li");
        li.textContent = verse;
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
      .map((li) => li.textContent)
      .join("\n");

    navigator.clipboard.writeText(verses).then(() => {
      alert("Versículos copiados al portapapeles");
    });
  });
});
