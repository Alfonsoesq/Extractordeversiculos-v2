// main.js
import { books } from './books.js';

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Expand abbreviation to full book name
  function expandAbbreviation(verse) {
    // Match book abbreviation and chapter:verse
    const match = verse.match(/([1-3]?\s?[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+)\s*(\d+:\d+)/i);
    if (!match) return verse;

    // Normalize abbreviation: uppercase and remove dots
    let abbr = match[1].toUpperCase().replace(/\./g, '');
    const numbers = match[2];

    // Lookup in books dictionary
    if (books[abbr]) {
      return `${books[abbr]} ${numbers}`;
    }
    return verse;
  }

  // Extract verses from text
  function extractVerses(text) {
    // Regex to find all matches like: "Gen 1:1", "1 Sam 2:3", with optional dot in abbreviation
    const regex = /\b[1-3]?\s?[A-Za-zÁÉÍÓÚÑáéíóúñ\.]+\s\d+:\d+\b/gi;
    const matches = text.match(regex) || [];
    // Map and expand all abbreviations
    return matches.map(expandAbbreviation);
  }

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    const verses = extractVerses(input);

    verseList.innerHTML = "";

    if (verses.length > 0) {
      verses.forEach((verse) => {
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
