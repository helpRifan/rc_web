/** A name as the certificate identity index compares it: NFKC, trimmed, single spaces, lower case. */
export function normalizeName(name: string): string {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-IN');
}

/** An email as stored and looked up: trimmed and lower case (the column is citext too). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
