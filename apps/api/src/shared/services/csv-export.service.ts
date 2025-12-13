import { Injectable } from '@nestjs/common';

/**
 * Service for exporting data to CSV format
 */
@Injectable()
export class CsvExportService {
  /**
   * Convert array of objects to CSV string
   */
  exportToCsv<T extends Record<string, any>>(
    data: T[],
    columns: { key: keyof T; label: string }[],
  ): string {
    if (!data || data.length === 0) {
      return '';
    }

    // Create header row
    const headers = columns.map((col) => this.escapeCsvValue(col.label));
    const headerRow = headers.join(',');

    // Create data rows
    const dataRows = data.map((item) => {
      const values = columns.map((col) => {
        const value = item[col.key];
        return this.formatCsvValue(value);
      });
      return values.join(',');
    });

    // Combine header and data rows
    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Format value for CSV
   */
  private formatCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Handle dates
    if (value instanceof Date) {
      return this.escapeCsvValue(value.toISOString());
    }

    // Handle numbers
    if (typeof value === 'number') {
      return value.toString();
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет';
    }

    // Handle objects (convert to JSON string)
    if (typeof value === 'object') {
      return this.escapeCsvValue(JSON.stringify(value));
    }

    // Handle strings
    return this.escapeCsvValue(String(value));
  }

  /**
   * Escape CSV value (handle quotes and commas)
   */
  private escapeCsvValue(value: string): string {
    // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Create CSV download response headers
   */
  getCsvHeaders(filename: string): Record<string, string> {
    return {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    };
  }
}
