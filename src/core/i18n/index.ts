import en from './en.json';
import ro from './ro.json';

export type AppLocale = 'ro' | 'en';

const dictionaries = { ro, en } as const;

let currentLocale: AppLocale = 'ro';

export function setLocale(locale: AppLocale): void {
  currentLocale = locale;
}

export function getLocale(): AppLocale {
  return currentLocale;
}

type NestedKey<T> = T extends object
  ? { [K in keyof T]: K extends string ? K | `${K}.${NestedKey<T[K]>}` : never }[keyof T]
  : never;

export type I18nKey = NestedKey<typeof en>;

function lookup(obj: unknown, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc === 'object' && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
}

export function t(key: I18nKey): string {
  const dict = dictionaries[currentLocale];
  return lookup(dict, key) ?? lookup(en, key) ?? key;
}
