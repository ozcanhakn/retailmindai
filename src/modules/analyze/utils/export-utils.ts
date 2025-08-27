'use client'

// Utility functions to export DOM elements as PNG/PDF

export async function exportElementToPng(element: HTMLElement, filename: string) {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  const link = document.createElement('a');
  link.download = ensureExtension(filename, 'png');
  link.href = dataUrl;
  link.click();
}

export async function exportElementToPdf(element: HTMLElement, filename: string) {
  const { toPng } = await import('html-to-image');
  const { jsPDF } = await import('jspdf');
  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Create an Image to get intrinsic size
  const img = new Image();
  img.src = dataUrl;
  await img.decode().catch(() => {});
  const imgWidth = img.naturalWidth || 1200;
  const imgHeight = img.naturalHeight || 600;

  const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.95;
  const renderWidth = imgWidth * scale;
  const renderHeight = imgHeight * scale;
  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight);
  pdf.save(ensureExtension(filename, 'pdf'));
}

function ensureExtension(name: string, ext: string) {
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}


