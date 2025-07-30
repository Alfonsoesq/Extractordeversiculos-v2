import { books } from "./books.js";

document.addEventListener("DOMContentLoaded", () => {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Regex explained above:
  // Matches (optional) parenthesis or space/start, then book abbrev, chapter:verse or verse-range
  const verseRegex = /(?:\(|\s|^)((?:[1-3]\s)?[A-ZÁÉÍÓÚÑ]{1,5}\.?)\s(\d+):(\d+(-\d+)?)/gi;

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    verseList.innerHTML = "";
    copyBtn.disabled = true;

    // Find all matches
    const matches = [...input.matchAll(verseRegex)];

    if (matches.length > 0) {
      matches.forEach(match => {
        // match[1] = book abbreviation (like 'Lc.' or '2 Co')
        // match[2] = chapter
        // match[3] = verse or verse range (like 1 or 1-32)

        // Normalize book abbreviation: remove trailing '.' and uppercase trim
        let rawBook = match[1].replace(/\./g, '').toUpperCase().trim();

        // Because some books have space in number + book (like "2 CO"), fix spacing
        // Example: '2 CO' or '1 RE' => '2 CO'
        // Already handled by trimming and uppercase

        // Lookup full book name or fallback to raw abbreviation if not found
        let fullBook = books[rawBook] || match[1].trim();

        const chapter = match[2];
        const verse = match[3];

        // Build final string: e.g. "Lucas 15:1-32"
        const fullVerse = `${fullBook} ${chapter}:${verse}`;

        const li = document.createElement("li");
        li.textContent = fullVerse;
        verseList.appendChild(li);
      });
      copyBtn.disabled = false;
    } else {
      const li = document.createElement("li");
      li.textContent = "No se encontraron versículos.";
      verseList.appendChild(li);
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
