export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  // Node-only (process.exit), so it's imported here rather than at the top (Next's instrumentation guide).
  const { checkServerEnvAtStartup } = await import('./lib/env-startup');
  checkServerEnvAtStartup(process.env); // refuse to start on a bad env (spec 5)
}
