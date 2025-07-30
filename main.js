// main.js
import { bookAbbreviations } from './books.js';

document.addEventListener("DOMContentLoaded", () => {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  // Regex to match Bible verses with optional abbreviation and range like "Lc. 15:1-32" or "Joel 3:14"
  const verseRegex = new RegExp(
    '\\b(' +
      Object.keys(bookAbbreviations)
        .map(abbr => abbr.replace('.', '\\.?').replace(/\s/g, '\\s?')) // escape dot & optional space
        .join('|') +
    ')\\s+\\d+:\\d+(-\\d+)?(,\\s*\\d+)*\\b',
    'gi'
  );

  function normalizeBookName(abbreviation) {
    // Make uppercase and remove trailing dots/spaces to find key in abbreviation map
    const key = abbreviation.toUpperCase().replace(/\.+$/, '').replace(/\s+/g, ' ').trim();
    return bookAbbreviations[key] || null;
  }

  function extractVerses() {
    const input = sermonText.value;
    verseList.innerHTML = '';

    if (!input.trim()) {
      verseList.innerHTML = '<li>No hay texto para analizar.</li>';
      copyBtn.disabled = true;
      return;
    }

    // Find all matches
    const matches = [...input.matchAll(verseRegex)];

    if (matches.length === 0) {
      verseList.innerHTML = '<li>No se encontraron versículos.</li>';
      copyBtn.disabled = true;
      return;
    }

    // Process matches and normalize
    const uniqueVerses = new Set();

    for (const match of matches) {
      const rawBook = match[1];
      const fullBook = normalizeBookName(rawBook);
      if (!fullBook) continue; // Skip if no valid book found (extra safety)
      const verseRef = match[0].replace(rawBook, fullBook);
      uniqueVerses.add(verseRef);
    }

    if (uniqueVerses.size === 0) {
      verseList.innerHTML = '<li>No se encontraron versículos válidos.</li>';
      copyBtn.disabled = true;
      return;
    }

    // Show verses
    uniqueVerses.forEach(verse => {
      const li = document.createElement('li');
      li.textContent = verse;
      verseList.appendChild(li);
    });

    copyBtn.disabled = false;
  }

  function copyVerses() {
    const verses = Array.from(verseList.querySelectorAll('li'))
      .map(li => li.textContent)
      .join('\n');

    if (!verses.trim()) {
      alert('No hay versículos para copiar.');
      return;
    }

    navigator.clipboard.writeText(verses)
      .then(() => alert('Versículos copiados al portapapeles'))
      .catch(() => alert('Error al copiar al portapapeles'));
  }

  extractBtn.addEventListener('click', extractVerses);
  copyBtn.addEventListener('click', copyVerses);

  // Initially disable copy button
  copyBtn.disabled = true;
});
