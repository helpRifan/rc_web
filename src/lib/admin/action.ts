// What every admin form action returns: a plain-words error, or a short confirmation.
export type ActionState = { error?: string; ok?: string };

/** Database errors in plain words; the details go to the server log only. */
export function dbError(error: { code?: string; message: string }, what: string): ActionState {
  console.error(`[admin] ${what} failed:`, error.message);
  if (error.code === '23505') return { error: 'Something else already uses that. Change it and save again.' };
  if (error.code === '23514') return { error: 'One of the fields doesn’t fit the rules. Check the lengths and links.' };
  return { error: `Couldn’t save. Try again in a minute.` };
}
