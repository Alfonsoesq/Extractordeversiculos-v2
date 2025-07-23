document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const sermonText = document.getElementById("sermonText");
  const verseList = document.getElementById("verseList");

  extractBtn.addEventListener("click", () => {
    const input = sermonText.value;
    const matches = input.match(/\b(?:[1-3]?\s?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s\d+:\d+\b/g);

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
