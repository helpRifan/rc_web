/**
 * For optional sections: a failed query hides the section (fallback) instead of taking the page
 * down, and the error goes to the server log. Required data should throw to the route's error.tsx.
 */
export async function safe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[data] ${label} failed:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}
