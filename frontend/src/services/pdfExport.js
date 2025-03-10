import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

class PDFExportService {
  /**
   * Generuje plik PDF z zawartości canvas
   * @param {string} title - Tytuł dokumentu
   * @param {HTMLCanvasElement} canvas - Element canvas do eksportu
   * @param {Object} options - Opcje eksportu
   * @returns {Promise<jsPDF>} - Obiekt jsPDF
   */
  async generatePDF(title, canvas, options = {}) {
    try {
      // Domyślne opcje
      const defaultOptions = {
        orientation: 'landscape',
        format: 'a4',
        unit: 'mm',
        quality: 1,
        padding: 10,
        includeDate: true,
        includeMeta: true,
      };

      const mergedOptions = { ...defaultOptions, ...options };

      // Utwórz dokument PDF
      const doc = new jsPDF({
        orientation: mergedOptions.orientation,
        unit: mergedOptions.unit,
        format: mergedOptions.format
      });

      // Dodaj metadane
      if (mergedOptions.includeMeta) {
        doc.setProperties({
          title: title,
          subject: 'Eksport tablicy interaktywnej',
          author: 'Tablica Interaktywna',
          keywords: 'tablica, edukacja, eksport',
          creator: 'Tablica Interaktywna'
        });
      }

      // Dodaj tytuł
      doc.setFontSize(18);
      doc.text(title, mergedOptions.padding, mergedOptions.padding + 10);

      // Dodaj datę
      if (mergedOptions.includeDate) {
        const now = new Date();
        const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        doc.setFontSize(10);
        doc.text(dateStr, mergedOptions.padding, mergedOptions.padding + 18);
      }

      // Pobierz dane z canvas
      let imgData;

      if (canvas instanceof HTMLCanvasElement) {
        // Używamy bezpośrednio canvas
        imgData = canvas.toDataURL('image/jpeg', mergedOptions.quality);
      } else {
        // Konwertujemy element DOM do canvas
        const tempCanvas = await html2canvas(canvas, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        imgData = tempCanvas.toDataURL('image/jpeg', mergedOptions.quality);
      }

      // Obliczenie wymiarów i pozycji
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const contentStartY = mergedOptions.padding + 25;
      const contentHeight = pageHeight - contentStartY - mergedOptions.padding;
      const contentWidth = pageWidth - (2 * mergedOptions.padding);

      // Dodaj obraz
      doc.addImage(
        imgData, 
        'JPEG', 
        mergedOptions.padding, 
        contentStartY, 
        contentWidth, 
        contentHeight
      );

      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    }
  }

  /**
   * Pobiera plik PDF
   * @param {jsPDF} doc - Obiekt jsPDF
   * @param {string} filename - Nazwa pliku
   */
  downloadPDF(doc, filename) {
    try {
      doc.save(filename);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF: ' + error.message);
    }
  }

  /**
   * Podgląd PDF w nowym oknie
   * @param {jsPDF} doc - Obiekt jsPDF
   */
  previewPDF(doc) {
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing PDF:', error);
      throw new Error('Failed to preview PDF: ' + error.message);
    }
  }

  /**
   * Eksportuje canvas do PDF i zapisuje
   * @param {string} title - Tytuł dokumentu
   * @param {HTMLCanvasElement} canvas - Element canvas do eksportu
   * @param {string} filename - Nazwa pliku
   * @param {Object} options - Opcje eksportu
   */
  async exportToPDF(title, canvas, filename, options = {}) {
    try {
      const doc = await this.generatePDF(title, canvas, options);
      this.downloadPDF(doc, filename);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export to PDF: ' + error.message);
    }
  }
}

export default new PDFExportService();
