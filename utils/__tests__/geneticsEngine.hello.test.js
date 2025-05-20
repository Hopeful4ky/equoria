const { calculateFoalGenetics } = require('../geneticsEngine');

describe('Genetics Engine', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return expected traits for given parents', async () => {
    const parent1 = { E_Extension: 'E/e', A_Agouti: 'A/a' };
    const parent2 = { E_Extension: 'e/e', A_Agouti: 'a/a' };
    const foalBreedProfile = {
      allowed_alleles: {
        E_Extension: ['E/E', 'E/e', 'e/e'],
        A_Agouti: ['A/A', 'A/a', 'a/a'],
      },
      allele_weights: {
        E_Extension: { 'E/E': 0.3, 'E/e': 0.4, 'e/e': 0.3 },
        A_Agouti: { 'A/A': 0.3, 'A/a': 0.4, 'a/a': 0.3 },
      },
      disallowed_combinations: {},
    };
    const result = await calculateFoalGenetics(parent1, parent2, foalBreedProfile);
    expect(['E/E', 'E/e', 'e/e']).toContain(result.E_Extension);
    expect(['A/A', 'A/a', 'a/a']).toContain(result.A_Agouti);
  });

  it('should handle edge cases with no traits', async () => {
    const parent1 = {};
    const parent2 = {};
    const foalBreedProfile = {
      allowed_alleles: {},
      allele_weights: {},
      disallowed_combinations: {},
    };
    const result = await calculateFoalGenetics(parent1, parent2, foalBreedProfile);
    expect(result).toEqual({});
  });

  it('should return traits when one parent has no traits', async () => {
    const parent1 = { E_Extension: 'E/e' };
    const parent2 = {};
    const foalBreedProfile = {
      allowed_alleles: { E_Extension: ['E/E', 'E/e', 'e/e'] },
      allele_weights: { E_Extension: { 'E/E': 0.3, 'E/e': 0.4, 'e/e': 0.3 } },
      disallowed_combinations: {},
    };
    const result = await calculateFoalGenetics(parent1, parent2, foalBreedProfile);
    expect(['E/E', 'E/e', 'e/e']).toContain(result.E_Extension);
  });

  it('should return traits when both parents have the same traits', async () => {
    const parent1 = { E_Extension: 'e/e' };
    const parent2 = { E_Extension: 'e/e' };
    const foalBreedProfile = {
      allowed_alleles: { E_Extension: ['e/e'] },
      allele_weights: { E_Extension: { 'e/e': 1.0 } },
      disallowed_combinations: {},
    };
    const result = await calculateFoalGenetics(parent1, parent2, foalBreedProfile);
    expect(result.E_Extension).toBe('e/e');
  });
});