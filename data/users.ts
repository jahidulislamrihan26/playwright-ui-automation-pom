// Test accounts published by the Sauce Demo site itself. A real project would read these from CI secrets.
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export interface User { username: string; password: string }
const u = (username: string): User => ({ username, password });

export const users = {
  standard: u('standard_user'),
  lockedOut: u('locked_out_user'),
  problem: u('problem_user'),
  error: u('error_user'),
  visual: u('visual_user'),
  performanceGlitch: u('performance_glitch_user'),
} as const;
