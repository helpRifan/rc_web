import { parseServerEnv } from './env-schema';

/**
 * Spec 5: the app refuses to start if a required server variable is missing or malformed.
 * Next keeps serving 500s after a failed register() ("Failed to prepare server"), so this exits
 * the process instead. The message names the variables, never their values.
 */
export function checkServerEnvAtStartup(env: Record<string, string | undefined>): void {
  try {
    parseServerEnv(env);
  } catch (error) {
    // Next doesn't run register() during `next build` today. If a later version does, leave the
    // build to fail through its own error handling rather than killing a build worker.
    if (env.NEXT_PHASE === 'phase-production-build') throw error;
    console.error(error instanceof Error ? error.message : 'Invalid server environment.');
    process.exit(1);
  }
}
