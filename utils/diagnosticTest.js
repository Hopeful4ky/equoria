// 🧪 DIAGNOSTIC TEST: PHENOTYPE OUTPUT COVERAGE
// This test will confirm if determinePhenotype is correctly resolving phenotypeKeyForShade
// and final_display_color for a variety of genotypes, including edge cases.

const { determinePhenotype } = require('./geneticsEngine');

// Mock breedGeneticProfile for testing (minimal but with standard shade_bias fallback)
const mockBreedProfile = {
  shade_bias: {
    Chestnut: { light: 0.3, medium: 0.4, dark: 0.3 },
    Bay: { light: 0.3, standard: 0.4, dark: 0.3 },
    Black: { standard: 0.5, faded: 0.5 },
    Palomino: { pale: 0.3, golden: 0.4, copper: 0.3 },
    Grulla: { standard: 1.0 },
    'Classic Champagne': { standard: 1.0 },
    'Amber Cream Dun Champagne': { rich: 1.0 },
    'Fewspot Leopard Appaloosa': { porcelain: 1.0 },
    Gray: { standard: 1.0 },
    'Dominant White': { white: 1.0 },
    Default: { standard: 1.0 },
  },
};

const testGenotypes = [
  // Dun
  { E_Extension: 'E/E', A_Agouti: 'A/A', D_Dun: 'D/D', Cr_Cream: 'n/n' }, // Bay Dun
  { E_Extension: 'e/e', D_Dun: 'D/nd1' }, // Red Dun
  { E_Extension: 'E/E', A_Agouti: 'a/a', D_Dun: 'D/nd2' }, // Grulla

  // Cream
  { E_Extension: 'e/e', Cr_Cream: 'n/Cr' }, // Palomino
  { E_Extension: 'E/E', A_Agouti: 'A/A', Cr_Cream: 'n/Cr' }, // Buckskin
  { E_Extension: 'E/E', A_Agouti: 'a/a', Cr_Cream: 'Cr/Cr' }, // Smoky Cream

  // Silver
  { E_Extension: 'E/E', A_Agouti: 'a/a', Z_Silver: 'Z/n' }, // Silver Black

  // Champagne
  { E_Extension: 'E/E', A_Agouti: 'a/a', CH_Champagne: 'Ch/n' }, // Classic Champagne

  // Pearl + Cream
  { E_Extension: 'e/e', Cr_Cream: 'n/Cr', Prl_Pearl: 'prl/n' }, // Palomino Pearl

  // Roan
  { E_Extension: 'e/e', Rn_Roan: 'Rn/rn' }, // Red Roan

  // Appaloosa (Homo LP, PATN1)
  {
    E_Extension: 'e/e',
    LP_LeopardComplex: 'LP/LP',
    PATN1_Pattern1: 'PATN1/PATN1',
  }, // Fewspot

  // Gray
  { E_Extension: 'E/E', A_Agouti: 'A/A', G_Gray: 'G/g' }, // Gray (age logic not included in test)

  // Dominant White
  { E_Extension: 'e/e', W_DominantWhite: 'W20/w' }, // Minimal White
];

(async () => {
  for (const [i, genotype] of testGenotypes.entries()) {
    const result = await determinePhenotype(genotype, mockBreedProfile, 5); // age=5 to hit mid-gray
    console.log(`Test #${i + 1}:`, result.final_display_color);
  }
})();
