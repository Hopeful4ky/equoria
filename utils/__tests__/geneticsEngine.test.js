const { determinePhenotype, selectWeightedRandom } = require('../geneticsEngine');

describe('determinePhenotype - Champagne Dilution Tests', () => {
  const mockBreedProfile = {
    shade_bias: {
      'Gold Champagne': { standard: 1 },
      'Amber Champagne': { standard: 1 },
      'Classic Champagne': { standard: 1 },
      'Gold Cream Champagne': { standard: 1 },
      'Amber Cream Champagne': { standard: 1 },
      'Classic Cream Champagne': { standard: 1 },
      'Gold Dun Champagne': { standard: 1 },
      'Amber Dun Champagne': { standard: 1 },
      'Classic Dun Champagne': { standard: 1 },
      'Gold Cream Dun Champagne': { standard: 1 },
      'Amber Cream Dun Champagne': { standard: 1 },
      'Classic Cream Dun Champagne': { standard: 1 },
    },
    marking_bias: {
      face: { none: 1.0 },
      legs_general_probability: 0,
      leg_specific_probabilities: { none: 1.0 },
    },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Basic Champagne Tests
  test('returns Gold Champagne for Chestnut with Champagne', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'n/n',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Gold Champagne');
  });

  test('returns Amber Champagne for Bay with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/e',
      A_Agouti: 'A/a',
      Cr_Cream: 'n/n',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/Ch',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Amber Champagne');
  });

  test('returns Classic Champagne for Black with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/E',
      A_Agouti: 'a/a',
      Cr_Cream: 'n/n',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Classic Champagne');
  });

  // 2. Champagne + Cream Tests
  test('returns Gold Cream Champagne for Palomino with Champagne', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/n',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Gold Cream Champagne');
  });

  test('returns Ivory Champagne (Cremello) for Cremello with Champagne', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/Cr',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Ivory Champagne (Cremello)');
  });

  test('returns Amber Cream Champagne for Buckskin with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/e',
      A_Agouti: 'A/a',
      Cr_Cream: 'Cr/n',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Amber Cream Champagne');
  });

  test('returns Ivory Champagne (Perlino) for Perlino with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/e',
      A_Agouti: 'A/a',
      Cr_Cream: 'Cr/Cr',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Ivory Champagne (Perlino)');
  });

  test('returns Classic Cream Champagne for Smoky Black with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/E',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/n',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Classic Cream Champagne');
  });

  test('returns Ivory Champagne (Smoky Cream) for Smoky Cream with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/E',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/Cr',
      D_Dun: 'n/n',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Ivory Champagne (Smoky Cream)');
  });

  // 3. Champagne + Dun Tests
  test('returns Gold Dun Champagne for Red Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'n/n',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Gold Dun Champagne');
  });

  test('returns Amber Dun Champagne for Bay Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/e',
      A_Agouti: 'A/a',
      Cr_Cream: 'n/n',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Amber Dun Champagne');
  });

  test('returns Classic Dun Champagne for Grulla with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/E',
      A_Agouti: 'a/a',
      Cr_Cream: 'n/n',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Classic Dun Champagne');
  });

  // 4. Champagne + Cream + Dun Tests
  test('returns Gold Cream Dun Champagne for Palomino Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/n',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Gold Cream Dun Champagne');
  });

  test('returns Amber Cream Dun Champagne for Buckskin Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/e',
      A_Agouti: 'A/a',
      Cr_Cream: 'Cr/n',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Amber Cream Dun Champagne');
  });

  test('returns Classic Cream Dun Champagne for Smoky Black Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/E',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/n',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Classic Cream Dun Champagne');
  });

  test('returns Ivory Dun Champagne (Cremello) for Cremello Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/Cr',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Ivory Dun Champagne (Cremello)');
  });

  test('returns Ivory Dun Champagne (Perlino) for Perlino Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/e',
      A_Agouti: 'A/a',
      Cr_Cream: 'Cr/Cr',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Ivory Dun Champagne (Perlino)');
  });

  test('returns Ivory Dun Champagne (Smoky Cream) for Smoky Cream Dun with Champagne', async () => {
    const genotype = {
      E_Extension: 'E/E',
      A_Agouti: 'a/a',
      Cr_Cream: 'Cr/Cr',
      D_Dun: 'D/nd1',
      CH_Champagne: 'Ch/n',
    };
    const result = await determinePhenotype(genotype, mockBreedProfile, 0);
    expect(result.final_display_color).toBe('Ivory Dun Champagne (Smoky Cream)');
  });
});

describe('determinePhenotype - Additional Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should correctly determine "Copper Palomino Pearl" for e/e, n/Cr, prl/n with copper shade', async () => {
    const genotype = {
      E_Extension: 'e/e',
      A_Agouti: 'a/a',
      Cr_Cream: 'n/Cr',
      PRL_Pearl: 'prl/n',
      CH_Champagne: 'n/n',
      D_Dun: 'n/n',
      G_Gray: 'n/n',
      Rn_Roan: 'n/n',
      Z_Silver: 'n/n',
      W_DominantWhite: 'w/w',
      SW_SplashWhite: 'n/n',
      EDXW: 'n/n',
      O_FrameOvero: 'n/n',
      TO_Tobiano: 'n/n',
      SB1_Sabino1: 'n/n',
      LP_LeopardComplex: 'lp/lp',
      PATN1_Pattern1: 'patn1/patn1',
      MFSD12_Mushroom: 'n/n',
      sooty: false,
      flaxen: false,
      pangare: false,
      rabicano: false,
    };

    const breedGeneticProfile = {
      shade_bias: {
        'Palomino Pearl': { copper: 1.0 },
      },
      marking_bias: {
        face: { none: 1.0 },
        legs_general_probability: 0,
        leg_specific_probabilities: { none: 1.0 },
      },
    };

    const result = await determinePhenotype(genotype, breedGeneticProfile, 0);
    expect(result.final_display_color).toBe('Copper Palomino Pearl');
  });

  test('returns Mushroom Pearl for Chestnut with Mushroom and Homozygous Pearl', async () => {
    const genotype = {
      E_Extension: 'e/e',
      MFSD12_Mushroom: 'Mu/n',
      PRL_Pearl: 'prl/prl',
      Cr_Cream: 'n/n',
      A_Agouti: 'a/a',
      CH_Champagne: 'n/n',
      D_Dun: 'n/n',
    };
    const breedGeneticProfile = {
      shade_bias: { 'Mushroom Pearl': { standard: 1.0 } },
      marking_bias: {
        face: { none: 1.0 },
        legs_general_probability: 0,
        leg_specific_probabilities: { none: 1.0 },
      },
    };
    const result = await determinePhenotype(genotype, breedGeneticProfile, 0);
    expect(result.final_display_color).toBe('Mushroom Pearl');
  });
});
