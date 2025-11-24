export type TreeItem = string | [string, ...TreeItem[]]
export const SANDBOX_TIMEOUT = 60_000 * 10 * 2; // 20 minutes