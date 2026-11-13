/**
 * Calls `load` on first use and hands every caller the same promise. A rejected promise is
 * dropped, so the next caller tries again instead of failing for the rest of the process.
 */
export function lazy<T>(load: () => Promise<T>): () => Promise<T> {
  let loading: Promise<T> | undefined;
  return () =>
    (loading ??= load().catch((error: unknown) => {
      loading = undefined;
      throw error;
    }));
}
