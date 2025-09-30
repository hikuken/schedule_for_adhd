export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(message ?? `Expected ${String(expected)} but received ${String(actual)}`);
  }
}
