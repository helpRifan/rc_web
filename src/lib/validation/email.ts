/**
 * zod's own email pattern (zod/v4/core/regexes `email`), copied so the browser forms can check an
 * address without shipping zod (90 KB). email.test.ts keeps the two in step.
 */
export const EMAIL_PATTERN = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

export const isEmail = (value: string) => EMAIL_PATTERN.test(value);
