import QRCode from 'qrcode';
export async function renderQR(canvas, command) {
  await QRCode.toCanvas(canvas, command, {
    errorCorrectionLevel: 'M', margin: 4, width: 1024,
    color: { dark: '#000000', light: '#ffffff' },
  });
  // Let responsive CSS size the canvas while retaining full raster resolution.
  canvas.style.removeProperty('width');
  canvas.style.removeProperty('height');
}
