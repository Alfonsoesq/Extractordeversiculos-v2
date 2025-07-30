// Import the array of valid books
import { validBooks } from './abbreviations.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Create regex pattern from validBooks array
  const validBooksPattern = validBooks
    .map(book => book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape regex special chars
    .join("|");

  // Regex to match verses including ranges like 3:16-18 or 3:16–4:1
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
