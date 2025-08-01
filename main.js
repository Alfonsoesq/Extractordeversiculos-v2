// main.js

import { books } from './books.js';

document.getElementById('processBtn').addEventListener('click', () => {
  const rawText = document.getElementById('inputText').value;
  const resultBox = document.getElementById('resultBox');
  const dateBox = document.getElementById('dateBox');
  const titleBox = document.getElementById('titleBox');
  const themeBox = document.getElementById('themeBox');

  const lines = rawText.trim().split('\n').filter(line => line.trim() !== '');
  const title = lines[0] || '';
  const theme = lines[1] || '';

  // Attempt to detect the sermon date
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) to 6 (Sat)
  const isSunday = day === 0;
  const isWednesday = day === 3;

  // Try using today's date or yesterday's if it's Monday or Thursday
  let sermonDate = new Date();
  if (day === 1 || day === 4) {
    sermonDate.setDate(now.getDate() - 1);
  }

  const formattedDate = sermonDate.toISOString().split('T')[0];

  titleBox.innerText = `Título: ${title}`;
  themeBox.innerText = `Tema: ${theme}`;
  dateBox.innerText = `Fecha: ${formattedDate}`;

  const verses = extractVerses(rawText);
  const formatted = verses.map(v => `${v.book} ${v.reference}`).join('\n');
  resultBox.innerText = formatted || 'No se encontraron versículos válidos.';
});

function extractVerses(text) {
  const verses = [];

  // Normalize quotes and trim
  const cleanedText = text.replace(/[“”‘’]/g, '"').trim();

  books.forEach(book => {
    book.abbreviations.forEach(abbr => {
      // Match examples like: Juan 3:16 or Jn 3:16
      const regex = new RegExp(`\\b${abbr}\\s+\\d+:\\d+\\b`, 'gi');
      const matches = cleanedText.match(regex);

      if (matches) {
        matches.forEach(match => {
          // Remove abbreviation from match to isolate chapter:verse
          const reference = match.replace(new RegExp(`^${abbr}\\s+`, 'i'), '');
          verses.push({
            original: match,
            book: book.name,
            reference: reference
          });
        });
      }
    });
  });

  return verses;
}
