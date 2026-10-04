import { getLocale, setLocale, t } from '../../src/core/i18n';

describe('i18n', () => {
  afterEach(() => {
    setLocale('ro');
  });

  it('defaults to Romanian', () => {
    expect(getLocale()).toBe('ro');
    expect(t('home.title')).toBe('Plan. Ride. Arrive.');
    expect(t('home.from')).toBe('Locația ta');
  });

  it('switches to English', () => {
    setLocale('en');
    expect(t('home.from')).toBe('Your location');
  });
});
