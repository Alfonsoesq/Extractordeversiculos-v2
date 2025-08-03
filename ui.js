export function showMetadata({ title, tema, date }) {
  const metaContainer = document.getElementById('metaContainer');
  metaContainer.style.opacity = 0;
  metaContainer.style.display = 'block';
  metaContainer.innerHTML = `
    <p><strong>Título:</strong> ${title}</p>
    <p><strong>Tema:</strong> ${tema}</p>
    <p><strong>Fecha:</strong> ${date}</p>
  `;
  setTimeout(() => {
    metaContainer.style.transition = 'opacity 0.4s ease';
    metaContainer.style.opacity = 1;
  }, 20);
}

export function displayVerses(verses) {
  const verseList = document.getElementById('verseList');
  verseList.innerHTML = '';
  verses.forEach(v => {
  const li = document.createElement('li');
  li.textContent = v;
  li.contentEditable = 'true';        // <-- make editable
  li.spellcheck = false;              // optional: disable spellcheck for verse text
  li.style.cursor = 'text';           // optional: show text cursor on hover
  verseList.appendChild(li);
});
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
