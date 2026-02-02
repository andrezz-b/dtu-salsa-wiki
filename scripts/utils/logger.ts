/**
 * Consistent logging utilities for build pipeline scripts.
 */

const ICONS = {
  info: "ℹ️ ",
  success: "✅",
  warn: "⚠️ ",
  error: "❌",
  step: "➤",
  skip: "⏭️ ",
  delete: "🗑️ ",
} as const;

export const log = {
  /** Log a pipeline step (e.g., "[1/3] Syncing Data") */
  step: (current: number, total: number, msg: string) =>
    console.log(`\n--- [${current}/${total}] ${msg} ---`),

  /** General info message */
  info: (msg: string) => console.log(`${ICONS.info} ${msg}`),

  /** Success message */
  success: (msg: string) => console.log(`${ICONS.success} ${msg}`),

  /** Warning message (non-fatal) */
  warn: (msg: string) => console.warn(`${ICONS.warn} ${msg}`),

  /** Error message */
  error: (msg: string) => console.error(`${ICONS.error} ${msg}`),

  /** Skipping operation message */
  skip: (msg: string) => console.log(`${ICONS.skip} ${msg}`),

  /** Deletion message */
  deleted: (msg: string) => console.log(`${ICONS.delete} ${msg}`),

  /** Command being executed (sanitizes tokens) */
  cmd: (cmd: string) => {
    const sanitized = cmd.replace(/https:\/\/[^@]+@/g, "https://***@");
    console.log(`$ ${sanitized}`);
  },
};

/**
 * Sleep for a given number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
