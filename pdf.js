export function generatePDF(title, tema, fecha, versiculos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin = 15;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;

  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 10;

  // Tema
  doc.setFontSize(12);
  doc.text(`Tema: ${tema}`, margin, y);
  y += 10;

  // Fecha (just the date, no label)
  doc.text(fecha, margin, y);
  y += 15; // add extra space before Versículos label

  // Versículos label
  doc.setFont(undefined, 'bold');
  doc.text('Versículos:', margin, y);
  y += 10;

  doc.setFont(undefined, 'normal');

  // Split verses into array by newline
  const versesArray = versiculos.split('\n');

  // Print each verse with line spacing and page-break handling
  versesArray.forEach(verse => {
    const splitVerse = doc.splitTextToSize(verse, 180);
    const requiredHeight = splitVerse.length * lineHeight + 5;

    // Check if we need to add a new page
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(splitVerse, margin, y);
    y += requiredHeight;
  });

  doc.save(`${title.replace(/\s+/g, '_') || 'versiculos'}.pdf`);
}
