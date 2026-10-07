// Rate limits for the certificate endpoints and pages (spec 8). Campus networks share addresses,
// so the read limits are generous; the email lookup is the tight one.
export const VERIFY_LIMIT = { windowSeconds: 3600, max: 120 } as const;
export const PDF_LIMIT = { windowSeconds: 3600, max: 30 } as const;
export const FIND_LIMITS = {
  perIp: { windowSeconds: 3600, max: 5 },
  perEmail: { windowSeconds: 3600, max: 5 },
} as const;
