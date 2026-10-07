// CSV for spreadsheets (the admin's waitlist export, the certificate review file). Every cell is
// quoted, quotes are doubled, and a cell a spreadsheet would run as a formula (=, +, -, @, tab,
// carriage return) gets a leading apostrophe, so opening the file can't execute anything.

export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Rows to CSV text with CRLF line ends (what spreadsheets expect), headers first. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
