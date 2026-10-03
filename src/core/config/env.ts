function readEnv(name: string): string | undefined {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[name];
}

function readBool(name: string, fallback: boolean): boolean {
  const value = readEnv(name);
  if (value === undefined) {
    return fallback;
  }
  return value === 'true';
}

export const env = {
  /** In-memory mocks for tests; Docker sets this to false so the app talks to mock-api. */
  useMocks: readBool('EXPO_PUBLIC_USE_MOCKS', true),
  apiBaseUrl: readEnv('EXPO_PUBLIC_API_URL') ?? 'http://localhost:4000',
} as const;
