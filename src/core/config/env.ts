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
  /** Live STPT bus positions instead of the bus mock. Wallet/trips stay on mocks. */
  useRealBus: readBool('EXPO_PUBLIC_USE_REAL_BUS', false),
  apiBaseUrl: readEnv('EXPO_PUBLIC_API_URL') ?? 'http://localhost:4000',
  /**
   * BLE beacon contract of the on-board transmitter (to be confirmed with the
   * hardware/backend team): optional service UUID filter and the local-name
   * prefix followed by the vehicle id, e.g. "EP-3114".
   */
  bleServiceUuid: readEnv('EXPO_PUBLIC_BLE_SERVICE_UUID') ?? null,
  bleNamePrefix: readEnv('EXPO_PUBLIC_BLE_NAME_PREFIX') ?? 'EP-',
} as const;
