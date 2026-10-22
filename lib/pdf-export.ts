/**
 * Institutional PDF Export & Print Utility
 * Manages clean browser-native PDF export and print layouts adhering to globals.css print specifications.
 */

export interface PdfExportOptions {
  documentTitle?: string;
  reportName?: string;
  collegeName?: string;
  simulatedDate?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Triggers native browser print dialog configured for clean PDF generation.
 * Temporarily sets document.title so the browser default PDF filename is properly formatted.
 */
export function exportCurrentDashboardToPdf(options?: PdfExportOptions): void {
  const originalTitle = typeof document !== 'undefined' ? document.title : '';
  const dateStr = options?.simulatedDate || new Date().toISOString().split('T')[0];
  const safeName = (options?.reportName || 'Dashboard_Report')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  const safeCollege = (options?.collegeName || 'EMS')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');

  const pdfFileName = `${safeCollege}_${safeName}_${dateStr}`;

  try {
    if (typeof document !== 'undefined') {
      document.title = pdfFileName;
    }

    if (options?.onBeforePrint) {
      options.onBeforePrint();
    }

    // Small delay to ensure any dynamic print adjustments settle
    setTimeout(() => {
      window.print();

      const restore = () => {
        if (typeof document !== 'undefined') {
          document.title = originalTitle;
        }
        if (options?.onAfterPrint) {
          options.onAfterPrint();
        }
        window.removeEventListener('afterprint', restore);
      };

      window.addEventListener('afterprint', restore);
      // Fallback restore in case afterprint does not fire
      setTimeout(restore, 2000);
    }, 120);
  } catch (err) {
    console.error('Error invoking PDF export:', err);
    if (typeof document !== 'undefined') {
      document.title = originalTitle;
    }
  }
}
