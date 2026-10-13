import { getLocale, setLocale, t } from '../../src/core/i18n';

describe('i18n', () => {
  afterEach(() => {
    setLocale('ro');
  });

  it('defaults to Romanian', () => {
    expect(getLocale()).toBe('ro');
    expect(t('home.title')).toBe('Planifică. Mergi. Ajungi.');
    expect(t('home.from')).toBe('Alege un punct de pornire sau dă clic pe...');
  });

  it('switches to English', () => {
    setLocale('en');
    expect(t('home.from')).toBe('Choose starting point or click on...');
  });
});
