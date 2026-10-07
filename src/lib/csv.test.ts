import { describe, expect, it } from 'vitest';
import { csvCell, toCsv } from './csv';

describe('csvCell', () => {
  it('quotes every cell and doubles quotes', () => {
    expect(csvCell('plain')).toBe('"plain"');
    expect(csvCell('a, b')).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell(42)).toBe('"42"');
  });

  it.each(['=SUM(A1:A9)', '+1', '-2+3', '@cmd', '\tx'])('defuses the formula %j', value => {
    expect(csvCell(value)).toBe(`"'${value}"`);
  });
});

describe('toCsv', () => {
  it('writes the header row first, with CRLF line ends', () => {
    expect(toCsv(['name', 'email'], [['Test One', 'one@example.com']])).toBe('"name","email"\r\n"Test One","one@example.com"\r\n');
  });
});
