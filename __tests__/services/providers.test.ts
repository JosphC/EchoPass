import { getDataSource } from '../../src/services/providers';

describe('providers', () => {
  it('exposes a single mock/real switch', () => {
    expect(['mock', 'real']).toContain(getDataSource());
  });
});
