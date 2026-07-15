import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export class ExportService {
  /**
   * Generates a CSV string from JSON data
   */
  static generateCSV(data: any[]): string {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]);
    const csvRows = data.map(row => 
      headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
    );
    return [headers.join(','), ...csvRows].join('\n');
  }

  /**
   * Generates an Excel buffer from JSON data
   */
  static generateExcel(data: any[]): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    // Generate buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generates a simple PDF buffer from JSON data
   */
  static async generatePDF(data: any[], title: string = 'Report'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Title
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        if (!data || !data.length) {
          doc.fontSize(12).text('No data available.');
        } else {
          // Simple tabular rendering (MVP)
          const headers = Object.keys(data[0]);
          let y = doc.y;
          
          doc.fontSize(10);
          headers.forEach((h, i) => {
            doc.text(h, 30 + (i * 100), y, { width: 90, underline: true });
          });
          
          doc.moveDown();
          
          data.forEach((row, rowIndex) => {
            y = doc.y;
            if (y > 750) {
              doc.addPage();
              y = 50;
            }
            headers.forEach((h, i) => {
              doc.text(String(row[h] || ''), 30 + (i * 100), y, { width: 90 });
            });
            doc.moveDown();
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
