import { spawnSync } from 'node:child_process';

const TRANSIENT_TRACE_ERROR = /NO_NAVSTART|Something went wrong with recording the trace|Chrome[^\n]*(?:crash|closed)|ECONNRESET|ETIMEDOUT/i;

export function runLighthouse(args, label = 'Lighthouse') {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = spawnSync('npx', ['lighthouse', ...args], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      timeout: 120000,
      killSignal: 'SIGTERM'
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) return;

    const detail = [
      result.error?.message || '',
      result.stdout || '',
      result.stderr || ''
    ].join('\n');
    if (attempt < maxAttempts && TRANSIENT_TRACE_ERROR.test(detail)) {
      console.warn(`${label}: transient Lighthouse/Chrome trace failure on attempt ${attempt}/${maxAttempts}; retrying.`);
      continue;
    }
    throw new Error(`${label} failed after ${attempt} attempt(s): ${detail.slice(-5000)}`);
  }
}
