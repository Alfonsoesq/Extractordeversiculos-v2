import { books } from './books.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;

    // Regex to capture book (with optional number prefix), chapter and verse(s), including optional verse ranges
    const verseRegex = /(?:\(|\s|^)\s*([1-3]?\s?[A-ZÁÉÍÓÚÑ]{1,5}\.?)\s+(\d+):(\d+(?:-\d+)?)/gi;

    let matches;
    const results = [];

    // Use regex exec in a loop to capture all matches
    while ((matches = verseRegex.exec(input)) !== null) {
      let bookAbbrev = matches[1].toUpperCase().replace(/\./g, ''); // Remove dot for lookup
      let chapter = matches[2];
      let verse = matches[3];

      // Normalize spaces inside abbreviation, e.g. "2 CO" => "2CO"
      bookAbbrev = bookAbbrev.replace(/\s+/g, '');

      // Lookup full book name from abbreviations
      const bookFull = books[bookAbbrev] || bookAbbrev;

      // Format result as "Book Chapter:Verse" (with verse range if applicable)
      results.push(`${bookFull} ${chapter}:${verse}`);
    }

    verseList.innerHTML = "";

    if (results.length > 0) {
      results.forEach((verse) => {
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
