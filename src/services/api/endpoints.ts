export const endpoints = {
  wallet: '/wallet',
  buses: '/buses',
  reports: '/reports',
  trips: '/trips',
  notifications: '/notifications',
} as const;

export type EndpointKey = keyof typeof endpoints;
