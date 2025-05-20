/**
 * geneticsEngine.js
 *
 * This utility handles the generation of horse genotypes based on breed profiles,
 * determination of phenotype (final display color, markings) from genotype,
 * and inheritance logic for breeding.
 */

/**
 * Helper function to select an item based on weights.
 * @param {object} weightedItems - An object where keys are items and values are their weights (e.g., {"e/e": 0.3, "E/e": 0.4, "E/E": 0.3}).
 * @returns {string|null} The chosen item (allele pair string) or null if input is invalid.
 */
function selectWeightedRandom(weightedItems) {
  if (
    !weightedItems ||
    typeof weightedItems !== 'object' ||
    Object.keys(weightedItems).length === 0
  ) {
    console.error(
      '[GeneticsEngine] selectWeightedRandom: Invalid or empty weightedItems provided.',
      weightedItems
    );
    return null;
  }
    
  let sumOfWeights = 0;
  for (const item in weightedItems) {
    if (
      Object.prototype.hasOwnProperty.call(weightedItems, item) &&
      typeof weightedItems[item] === 'number' &&
      weightedItems[item] >= 0
    ) {
      sumOfWeights += weightedItems[item];
    }
  }

  if (sumOfWeights === 0) {
    const keys = Object.keys(weightedItems);
    return keys.length > 0 ? keys[0] : null;
  }

  let randomNum = Math.random() * sumOfWeights;

  for (const item in weightedItems) {
    if (
      Object.prototype.hasOwnProperty.call(weightedItems, item) &&
      typeof weightedItems[item] === 'number' &&
      weightedItems[item] >= 0
    ) {
      if (randomNum < weightedItems[item]) {
        return item;
      }
      randomNum -= weightedItems[item];
    }
  }

  const validItems = Object.keys(weightedItems).filter(
    (key) => typeof weightedItems[key] === 'number' && weightedItems[key] >= 0
  );
  return validItems.length > 0 ? validItems[validItems.length - 1] : null;
}

/**
 * Generates a complete genotype for a store-bought horse based on the breed's genetic profile.
 * The genotype includes both main gene alleles and boolean modifiers.
 * @param {object} breedGeneticProfile - The breed_genetic_profile JSONB object from the breeds table.
 * @returns {Promise<object>} An object representing the horse's full genotype.
 */
async function generateStoreHorseGenetics(breedGeneticProfile) {
  console.log(
    '[GeneticsEngine] Called generateStoreHorseGenetics with profile:',
    breedGeneticProfile
  );
  const generatedGenotype = {};

  if (!breedGeneticProfile) {
    console.error(
      '[GeneticsEngine] Breed genetic profile is undefined or null.'
    );
    return generatedGenotype;
  }

  // 1. Generate Allele Pairs for Genes
  if (
    breedGeneticProfile.allele_weights &&
    typeof breedGeneticProfile.allele_weights === 'object'
  ) {
    for (const geneName in breedGeneticProfile.allele_weights) {
      if (
        Object.prototype.hasOwnProperty.call(
          breedGeneticProfile.allele_weights,
          geneName
        )
      ) {
        const weightedAlleles = breedGeneticProfile.allele_weights[geneName];
        const chosenAllelePair = selectWeightedRandom(weightedAlleles);
        if (chosenAllelePair) {
          if (
            breedGeneticProfile.disallowed_combinations &&
            breedGeneticProfile.disallowed_combinations[geneName] &&
            breedGeneticProfile.disallowed_combinations[geneName].includes(
              chosenAllelePair
            )
          ) {
            console.warn(
              `[GeneticsEngine] Attempted to generate disallowed allele pair ${chosenAllelePair} for ${geneName}. Re-evaluating or skipping.`
            );
          } else {
            generatedGenotype[geneName] = chosenAllelePair;
          }
        } else {
          console.warn(
            `[GeneticsEngine] Could not determine allele for gene ${geneName}. It will be omitted.`
          );
        }
      }
    }
  } else {
    console.warn(
      '[GeneticsEngine] allele_weights not found or invalid in breed profile.'
    );
  }

  // 2. Determine Boolean Modifiers
  if (
    breedGeneticProfile.boolean_modifiers_prevalence &&
    typeof breedGeneticProfile.boolean_modifiers_prevalence === 'object'
  ) {
    for (const modifierName in breedGeneticProfile.boolean_modifiers_prevalence) {
      if (
        Object.prototype.hasOwnProperty.call(
          breedGeneticProfile.boolean_modifiers_prevalence,
          modifierName
        )
      ) {
        const prevalence =
          breedGeneticProfile.boolean_modifiers_prevalence[modifierName];
        if (
          typeof prevalence === 'number' &&
          prevalence >= 0 &&
          prevalence <= 1
        ) {
          generatedGenotype[modifierName] = Math.random() < prevalence;
        } else {
          console.warn(
            `[GeneticsEngine] Invalid prevalence for boolean modifier ${modifierName}: ${prevalence}. It will be omitted or defaulted to false.`
          );
          generatedGenotype[modifierName] = false;
        }
      }
    }
  } else {
    console.warn(
      '[GeneticsEngine] boolean_modifiers_prevalence not found or invalid in breed profile.'
    );
  }

  console.log('[GeneticsEngine] Generated full genotype:', generatedGenotype);
  return generatedGenotype;
}

/**
 * Applies Pearl dilution to the current display color and phenotype key.
 * @param {string} currentDisplayColor - The current display color.
 * @param {string} phenotypeKeyForShade - The phenotype key for shade determination.
 * @param {object} genotype - The horse's genotype.
 * @param {string} baseColor - The base coat color.
 * @returns {object} Updated currentDisplayColor and phenotypeKeyForShade.
 */
function applyPearlDilution(
  currentDisplayColor,
  phenotypeKeyForShade,
  genotype,
  baseColor
) {
  let newDisplayColor = currentDisplayColor.trim();
  let newPhenotypeKeyForShade = phenotypeKeyForShade.trim();
  let pearlDescriptor = '';

  const isHomozygousPearl = genotype.PRL_Pearl === 'prl/prl';
  const isHeterozygousPearl =
    genotype.PRL_Pearl === 'prl/n' || genotype.PRL_Pearl === 'n/prl';
  const hasSingleCream =
    genotype.Cr_Cream === 'Cr/n' || genotype.Cr_Cream === 'n/Cr';
  const hasDoubleCream = genotype.Cr_Cream === 'Cr/Cr';

  console.log(
    '[applyPearlDilution] Entry: CDC=',
    newDisplayColor,
    'PKS=',
    newPhenotypeKeyForShade,
    'baseColor=',
    baseColor,
    'isHomoPrl=',
    isHomozygousPearl,
    'isHetPrl=',
    isHeterozygousPearl,
    'hasSingleCr=',
    hasSingleCream,
    'hasDoubleCr=',
    hasDoubleCream
  );

  if (isHomozygousPearl || (isHeterozygousPearl && hasSingleCream)) {
    const originalColorForPearl = newDisplayColor;
    console.log(
      '[applyPearlDilution] originalColorForPearl=',
      originalColorForPearl
    );

    if (isHomozygousPearl && !hasSingleCream && !hasDoubleCream) {
      pearlDescriptor = 'Pearl';
      if (
        baseColor === 'Chestnut' &&
        !originalColorForPearl.toLowerCase().includes('champagne')
      ) {
        newDisplayColor = 'Apricot';
        newPhenotypeKeyForShade = 'Apricot';
      } else {
        newDisplayColor = `${originalColorForPearl} Pearl`;
        newPhenotypeKeyForShade = `${newPhenotypeKeyForShade} Pearl`;
      }
    } else if (hasSingleCream && isHeterozygousPearl) {
      pearlDescriptor = 'Pearl Cream';
      if (
        originalColorForPearl === 'Palomino' &&
        !originalColorForPearl.toLowerCase().includes('champagne')
      ) {
        newDisplayColor = 'Palomino Pearl';
        newPhenotypeKeyForShade = 'Palomino Pearl';
        console.log(
          '[applyPearlDilution] Set Palomino Pearl: CDC=',
          newDisplayColor,
          'PKS=',
          newPhenotypeKeyForShade
        );
      } else if (
        originalColorForPearl === 'Buckskin' &&
        !originalColorForPearl.toLowerCase().includes('champagne')
      ) {
        newDisplayColor = 'Buckskin Pearl';
        newPhenotypeKeyForShade = 'Buckskin Pearl';
      } else if (
        originalColorForPearl === 'Smoky Black' &&
        !originalColorForPearl.toLowerCase().includes('champagne')
      ) {
        newDisplayColor = 'Smoky Black Pearl';
        newPhenotypeKeyForShade = 'Smoky Black Pearl';
      } else {
        newDisplayColor = `${originalColorForPearl} ${pearlDescriptor}`.replace(
          '  ',
          ' '
        );
        newPhenotypeKeyForShade =
          `${newPhenotypeKeyForShade} ${pearlDescriptor}`.replace('  ', ' ');
      }
    } else if (hasSingleCream && isHomozygousPearl) {
      pearlDescriptor = 'Homozygous Pearl Cream';
      if (
        originalColorForPearl === 'Palomino' ||
        originalColorForPearl === 'Buckskin' ||
        originalColorForPearl === 'Smoky Black'
      ) {
        newDisplayColor = `${originalColorForPearl} ${pearlDescriptor}`;
        newPhenotypeKeyForShade = newDisplayColor;
      } else {
        newDisplayColor = `${originalColorForPearl} ${pearlDescriptor}`.replace(
          '  ',
          ' '
        );
        newPhenotypeKeyForShade =
          `${newPhenotypeKeyForShade} ${pearlDescriptor}`.replace('  ', ' ');
      }
    }

    if (isHomozygousPearl && hasDoubleCream) {
      if (!newDisplayColor.toLowerCase().includes('pearl')) {
        newDisplayColor = `${originalColorForPearl} (Pearl)`;
        newPhenotypeKeyForShade = `${newPhenotypeKeyForShade} (Pearl)`;
      }
    }

    newDisplayColor = newDisplayColor.replace(/\s+/g, ' ').trim();
    newPhenotypeKeyForShade = newPhenotypeKeyForShade
      .replace(/\s+/g, ' ')
      .trim();

    if (newPhenotypeKeyForShade.toLowerCase().includes('pearl pearl')) {
      newPhenotypeKeyForShade = newPhenotypeKeyForShade.replace(
        /Pearl Pearl/gi,
        'Pearl'
      );
    }
    if (newPhenotypeKeyForShade.toLowerCase().includes('pearl cream pearl')) {
      newPhenotypeKeyForShade = newPhenotypeKeyForShade.replace(
        /Pearl Cream Pearl/gi,
        'Pearl Cream'
      );
    }
    if (newDisplayColor.toLowerCase().includes('pearl pearl')) {
      newDisplayColor = newDisplayColor.replace(/Pearl Pearl/gi, 'Pearl');
    }
    if (newDisplayColor.toLowerCase().includes('pearl cream pearl')) {
      newDisplayColor = newDisplayColor.replace(
        /Pearl Cream Pearl/gi,
        'Pearl Cream'
      );
    }
  }

  console.log(
    '[applyPearlDilution] Exit: CDC=',
    newDisplayColor,
    'PKS=',
    newPhenotypeKeyForShade
  );
  return {
    currentDisplayColor: newDisplayColor,
    phenotypeKeyForShade: newPhenotypeKeyForShade,
  };
}

/**
 * Determines the final display color and phenotypic markings of a horse based on its full genotype.
 * @param {object} fullGenotype - The horse's complete genotype (including main genes and boolean modifiers).
 * @param {object} breedGeneticProfile - The breed_genetic_profile from the breeds table (for marking bias etc.).
 * @param {number} ageInYears - The current age of the horse in years.
 * @returns {Promise<object>} An object containing `final_display_color` (string) and `phenotypic_markings` (JSONB).
 */
async function determinePhenotype(
  fullGenotype,
  breedGeneticProfile,
  ageInYears = 0
) {
  let currentDisplayColor = '';
  console.log(
    '[GeneticsEngine] Called determinePhenotype with fullGenotype:',
    fullGenotype,
    'breedProfile:',
    breedGeneticProfile,
    'ageInYears:',
    ageInYears
  );
  let baseColor = '';
  let phenotypeKeyForShade = '';
  let determined_shade = null;

  let phenotypic_markings = {
    face: 'none',
    legs: { LF: 'none', RF: 'none', LH: 'none', RH: 'none' },
  };

  // Helper to check for presence of specific alleles (e.g., at least one 'E')
  const hasAllele = (gene, allele) =>
    fullGenotype[gene] && fullGenotype[gene].includes(allele);
  const getAlleles = (gene) =>
    fullGenotype[gene] ? fullGenotype[gene].split('/') : [];
  const isHomozygous = (gene, allele) => {
    const alleles = getAlleles(gene);
    return (
      alleles.length === 2 && alleles[0] === allele && alleles[1] === allele
    );
  };
  const isHeterozygous = (gene, allele1, allele2) => {
    const alleles = getAlleles(gene);
    return (
      alleles.length === 2 &&
      ((alleles[0] === allele1 && alleles[1] === allele2) ||
        (alleles[0] === allele2 && alleles[1] === allele1))
    );
  };
  const getDominantWhiteAlleles = () => {
    if (!fullGenotype.W_DominantWhite || fullGenotype.W_DominantWhite === 'w/w')
      return [];
    return getAlleles('W_DominantWhite').filter(
      (a) => a.startsWith('W') && a !== 'w'
    );
  };
  const getSplashWhiteAlleles = () => {
    if (!fullGenotype.SW_SplashWhite || fullGenotype.SW_SplashWhite === 'n/n')
      return [];
    return getAlleles('SW_SplashWhite').filter((a) => a.startsWith('SW'));
  };
  const getEdenWhiteAlleles = () => {
    if (!fullGenotype.EDXW || fullGenotype.EDXW === 'n/n') return [];
    return getAlleles('EDXW').filter((a) => a.startsWith('EDXW'));
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // --- 1. Determine Base Coat Color ---
  let isChestnutBase = false;

  if (isHomozygous('E_Extension', 'e')) {
    baseColor = 'Chestnut';
    phenotypeKeyForShade = 'Chestnut';
    isChestnutBase = true;
  } else {
    if (hasAllele('A_Agouti', 'A')) {
      baseColor = 'Bay';
      phenotypeKeyForShade = 'Bay';
    } else {
      baseColor = 'Black';
      phenotypeKeyForShade = 'Black';
    }
  }

  console.log(
    '[Debug] Base color set: baseColor=',
    baseColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // --- 2. Apply Dilutions ---

  // Mushroom (MFSD12_Mushroom) - only on Chestnut (e/e)
  if (isChestnutBase && hasAllele('MFSD12_Mushroom', 'Mu')) {
    currentDisplayColor = 'Mushroom Chestnut';
    phenotypeKeyForShade = 'Mushroom';
  }

  let mushroomPlusHomozygousPearlNoCreamHandled = false;
  if (
    currentDisplayColor === 'Mushroom Chestnut' &&
    fullGenotype.PRL_Pearl === 'prl/prl' &&
    (fullGenotype.Cr_Cream === 'n/n' || !hasAllele('Cr_Cream', 'Cr'))
  ) {
    currentDisplayColor = 'Mushroom Pearl';
    phenotypeKeyForShade = 'Mushroom Pearl';
    mushroomPlusHomozygousPearlNoCreamHandled = true;
  }

  console.log(
    '[Debug] After Mushroom: currentDisplayColor=',
    currentDisplayColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Cream Dilution (Cr_Cream)
  if (fullGenotype.Cr_Cream) {
    if (isHeterozygous('Cr_Cream', 'Cr', 'n')) {
      if (baseColor === 'Chestnut') {
        currentDisplayColor = currentDisplayColor.includes('Mushroom Chestnut') ? 'Palomino' : 'Palomino';
        phenotypeKeyForShade = 'Palomino';
      } else if (baseColor === 'Bay') {
        currentDisplayColor = 'Buckskin';
        phenotypeKeyForShade = 'Buckskin';
      } else if (baseColor === 'Black') {
        currentDisplayColor = 'Smoky Black';
        phenotypeKeyForShade = 'Smoky Black';
      }
    } else if (isHomozygous('Cr_Cream', 'Cr')) {
      if (baseColor === 'Chestnut') {
        currentDisplayColor = 'Cremello';
        phenotypeKeyForShade = 'Cremello';
      } else if (baseColor === 'Bay') {
        currentDisplayColor = 'Perlino';
        phenotypeKeyForShade = 'Perlino';
      } else if (baseColor === 'Black') {
        currentDisplayColor = 'Smoky Cream';
        phenotypeKeyForShade = 'Smoky Cream';
      }
    }
  }

  console.log(
    '[Debug] After Cream: currentDisplayColor=',
    currentDisplayColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Dun Dilution (D_Dun)
  let dunEffectDescriptor = '';
  if (hasAllele('D_Dun', 'D')) {
    const originalColorForDun = currentDisplayColor || baseColor;
    if (baseColor === 'Black' || originalColorForDun.includes('Smoky Black')) {
      currentDisplayColor = 'Grulla';
    } else if (baseColor === 'Bay' || originalColorForDun.includes('Buckskin')) {
      currentDisplayColor = originalColorForDun.includes('Buckskin') ? 'Buckskin Dun' : 'Bay Dun';
    } else if (
      baseColor === 'Chestnut' ||
      originalColorForDun.includes('Palomino') ||
      originalColorForDun.includes('Mushroom Chestnut')
    ) {
      if (originalColorForDun.includes('Palomino')) {
        currentDisplayColor = 'Palomino Dun';
      } else if (originalColorForDun.includes('Mushroom Chestnut')) {
        currentDisplayColor = 'Mushroom Dun';
      } else {
        currentDisplayColor = 'Red Dun';
      }
    } else if (
      ['Cremello', 'Perlino', 'Smoky Cream'].includes(originalColorForDun)
    ) {
      currentDisplayColor = `${originalColorForDun} Dun`;
    } else {
      currentDisplayColor = `${originalColorForDun} Dun`;
    }
    phenotypeKeyForShade = currentDisplayColor;
    dunEffectDescriptor = '';
  } else if (isHomozygous('D_Dun', 'nd1')) {
    dunEffectDescriptor = ' (Non-Dun 1 - Primitive Markings)';
  } else if (isHeterozygous('D_Dun', 'nd1', 'nd2')) {
    dunEffectDescriptor = ' (Non-Dun 2 - Faint Primitive Markings)';
  }

  console.log(
    '[Debug] After Dun: currentDisplayColor=',
    currentDisplayColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Champagne Dilution (CH_Champagne)
  if (hasAllele('CH_Champagne', 'Ch')) {
    const isSingleCream = isHeterozygous('Cr_Cream', 'Cr', 'n');
    const isDoubleCream = isHomozygous('Cr_Cream', 'Cr');
    const isDunActive = hasAllele('D_Dun', 'D');
    let determinedChampagneColor;

    if (!isSingleCream && !isDoubleCream && !isDunActive) {
      if (isChestnutBase) {
        determinedChampagneColor = 'Gold Champagne';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Amber Champagne';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Classic Champagne';
      }
    } else if (isSingleCream && !isDoubleCream && !isDunActive) {
      if (isChestnutBase) {
        determinedChampagneColor = 'Gold Cream Champagne';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Amber Cream Champagne';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Classic Cream Champagne';
      }
    } else if (isDoubleCream && !isDunActive) {
      if (isChestnutBase) {
        determinedChampagneColor = 'Ivory Champagne (Cremello)';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Ivory Champagne (Perlino)';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Ivory Champagne (Smoky Cream)';
      }
    } else if (isDunActive && !isSingleCream && !isDoubleCream) {
      if (isChestnutBase) {
        determinedChampagneColor = 'Gold Dun Champagne';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Amber Dun Champagne';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Classic Dun Champagne';
      }
    } else if (isSingleCream && !isDoubleCream && isDunActive) {
      if (isChestnutBase) {
        determinedChampagneColor = 'Gold Cream Dun Champagne';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Amber Cream Dun Champagne';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Classic Cream Dun Champagne';
      }
    } else if (isDoubleCream && isDunActive) {
      if (isChestnutBase) {
        determinedChampagneColor = 'Ivory Dun Champagne (Cremello)';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Ivory Dun Champagne (Perlino)';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Ivory Dun Champagne (Smoky Cream)';
      }
    } else {
      console.warn(
        `[GeneticsEngine] Unhandled Champagne interaction. Base: ${baseColor}, Cream: ${fullGenotype.Cr_Cream}, Dun: ${fullGenotype.D_Dun}, CurrentColor: ${currentDisplayColor}. Defaulting to base Champagne color.`
      );
      if (isChestnutBase) {
        determinedChampagneColor = 'Gold Champagne';
      } else if (baseColor === 'Bay') {
        determinedChampagneColor = 'Amber Champagne';
      } else if (baseColor === 'Black') {
        determinedChampagneColor = 'Classic Champagne';
      }
    }

    if (determinedChampagneColor) {
      currentDisplayColor = determinedChampagneColor;
      phenotypeKeyForShade = currentDisplayColor;
    }
  }

  console.log(
    '[Debug] After Champagne: currentDisplayColor=',
    currentDisplayColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Silver Dilution (Z_Silver)
  if (hasAllele('Z_Silver', 'Z') && !isChestnutBase) {
    const originalColorForSilver = currentDisplayColor || baseColor;
    let silverActsOnBlackPigment = false;
    if (baseColor === 'Black' || baseColor === 'Bay') {
      silverActsOnBlackPigment = true;
    }
    const cdcLower = originalColorForSilver.toLowerCase();
    if (
      cdcLower.includes('classic') ||
      cdcLower.includes('sable') ||
      (cdcLower.includes('amber') && baseColor === 'Bay')
    ) {
      silverActsOnBlackPigment = true;
    }
    if (silverActsOnBlackPigment && !cdcLower.includes('silver')) {
      currentDisplayColor = `Silver ${originalColorForSilver}`;
      phenotypeKeyForShade = `Silver ${phenotypeKeyForShade
        .replace(/Classic/i, 'Black')
        .replace(/Amber/i, 'Bay')
        .replace(/Gold/i, 'Chestnut')
        .replace(/Sable/i, 'Black')}`;
    }
    if (phenotypeKeyForShade.toLowerCase().startsWith('silver silver')) {
      phenotypeKeyForShade = phenotypeKeyForShade.substring(7);
    }
    phenotypeKeyForShade = phenotypeKeyForShade
      .replace(/Silver Classic/i, 'Silver Black')
      .replace(/Silver Amber/i, 'Silver Bay')
      .replace(/Silver Sable/i, 'Silver Black');
  }

  console.log(
    '[Debug] After Silver: currentDisplayColor=',
    currentDisplayColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Pearl Dilution (PRL_Pearl)
  if (!mushroomPlusHomozygousPearlNoCreamHandled && currentDisplayColor !== 'Mushroom Pearl') {
    console.log(
      '[Debug] Before Pearl: currentDisplayColor=',
      currentDisplayColor,
      'phenotypeKeyForShade=',
      phenotypeKeyForShade,
      'genotype.PRL_Pearl=',
      fullGenotype.PRL_Pearl,
      'genotype.Cr_Cream=',
      fullGenotype.Cr_Cream
    );
    const pearlResult = applyPearlDilution(
      currentDisplayColor || baseColor,
      phenotypeKeyForShade || baseColor,
      fullGenotype,
      baseColor
    );
    currentDisplayColor = pearlResult.currentDisplayColor;
    phenotypeKeyForShade = pearlResult.phenotypeKeyForShade;
    console.log(
      '[Debug] After Pearl: currentDisplayColor=',
      currentDisplayColor,
      'phenotypeKeyForShade=',
      phenotypeKeyForShade
    );
  } else {
    console.log(
      '[Debug] Skipped Pearl Dilution: mushroomPlusHomozygousPearlNoCreamHandled=',
      mushroomPlusHomozygousPearlNoCreamHandled
    );
  }

  // --- Determine Shade ---
  if (breedGeneticProfile && breedGeneticProfile.shade_bias) {
    if (breedGeneticProfile.shade_bias[phenotypeKeyForShade]) {
      determined_shade = selectWeightedRandom(
        breedGeneticProfile.shade_bias[phenotypeKeyForShade]
      );
    } else if (
      breedGeneticProfile.shade_bias[baseColor] &&
      phenotypeKeyForShade !== baseColor
    ) {
      determined_shade = selectWeightedRandom(
        breedGeneticProfile.shade_bias[baseColor]
      );
    } else {
      const firstWordOfPhenoKey = phenotypeKeyForShade.split(' ')[0];
      if (breedGeneticProfile.shade_bias[firstWordOfPhenoKey]) {
        determined_shade = selectWeightedRandom(
          breedGeneticProfile.shade_bias[firstWordOfPhenoKey]
        );
      } else if (breedGeneticProfile.shade_bias['Default']) {
        determined_shade = selectWeightedRandom(
          breedGeneticProfile.shade_bias['Default']
        );
      }
    }
  }
  if (!determined_shade) determined_shade = 'standard';
  console.log(
    '[Debug] Shade determined: determined_shade=',
    determined_shade,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Apply shade to currentDisplayColor
  const shadeLower = determined_shade ? determined_shade.toLowerCase() : '';
  if (
    shadeLower !== 'standard' &&
    shadeLower !== 'medium' &&
    !currentDisplayColor.toLowerCase().includes(shadeLower) &&
    !currentDisplayColor.toLowerCase().includes('gray')
  ) {
    currentDisplayColor = `${capitalizeFirstLetter(determined_shade)} ${currentDisplayColor}`;
    phenotypeKeyForShade = `${capitalizeFirstLetter(determined_shade)} ${phenotypeKeyForShade}`;
  }

  console.log(
    '[Debug] After shade application: currentDisplayColor=',
    currentDisplayColor,
    'phenotypeKeyForShade=',
    phenotypeKeyForShade
  );

  // Apply sooty
  if (
    fullGenotype.sooty === true &&
    !currentDisplayColor.toLowerCase().startsWith('sooty')
  ) {
    currentDisplayColor = `Sooty ${currentDisplayColor}`;
    phenotypeKeyForShade = `Sooty ${phenotypeKeyForShade}`;
  }

  // Initialize displayColorParts
  let displayColorParts = [currentDisplayColor];

  console.log(
    '[Debug] Initial displayColorParts=',
    displayColorParts
  );

  // --- Add Modifiers ---
  if (isChestnutBase && fullGenotype.flaxen === true) {
    if (
      !currentDisplayColor.toLowerCase().includes('palomino') &&
      !currentDisplayColor.toLowerCase().includes('cremello') &&
      !currentDisplayColor.toLowerCase().includes('flaxen')
    ) {
      if (!displayColorParts.join(' ').toLowerCase().includes('flaxen')) {
        displayColorParts.push('Flaxen');
      }
    }
  }

  if (fullGenotype.pangare === true) {
    if (!displayColorParts.join(' ').toLowerCase().includes('pangare')) {
      displayColorParts.push('Pangare');
    }
  }

  // Roan (Rn_Roan)
  if (
    fullGenotype.Rn_Roan &&
    hasAllele('Rn_Roan', 'Rn') &&
    !displayColorParts.some((p) => p.toLowerCase().includes('gray'))
  ) {
    let roanColorName = '';
    const cdcForRoanDetermination = displayColorParts.join(' ').toLowerCase();
    if (
      baseColor === 'Chestnut' ||
      cdcForRoanDetermination.includes('chestnut') ||
      cdcForRoanDetermination.includes('palomino') ||
      cdcForRoanDetermination.includes('cremello') ||
      cdcForRoanDetermination.includes('gold') ||
      cdcForRoanDetermination.includes('apricot') ||
      cdcForRoanDetermination.includes('mushroom') ||
      cdcForRoanDetermination.includes('ivory')
    ) {
      roanColorName = 'Red Roan';
    } else if (
      baseColor === 'Bay' ||
      cdcForRoanDetermination.includes('bay') ||
      cdcForRoanDetermination.includes('buckskin') ||
      cdcForRoanDetermination.includes('perlino') ||
      cdcForRoanDetermination.includes('amber')
    ) {
      roanColorName = 'Bay Roan';
    } else if (
      baseColor === 'Black' ||
      cdcForRoanDetermination.includes('black') ||
      cdcForRoanDetermination.includes('smoky') ||
      cdcForRoanDetermination.includes('grulla') ||
      cdcForRoanDetermination.includes('classic') ||
      cdcForRoanDetermination.includes('sable')
    ) {
      roanColorName = 'Blue Roan';
    }

    if (roanColorName) {
      let prefix = '';
      const firstPart = displayColorParts[0].split(' ')[0].toLowerCase();
      if (
        firstPart === 'sooty' ||
        (determined_shade && firstPart === determined_shade.toLowerCase())
      ) {
        prefix = displayColorParts[0].split(' ')[0] + ' ';
        if (
          firstPart === 'sooty' &&
          determined_shade &&
          displayColorParts[0].split(' ').length > 1 &&
          displayColorParts[0].split(' ')[1].toLowerCase() ===
            determined_shade.toLowerCase()
        ) {
          prefix =
            displayColorParts[0].split(' ')[0] +
            ' ' +
            displayColorParts[0].split(' ')[1] +
            ' ';
        }
      }
      const existingDescriptors = [];
      displayColorParts
        .join(' ')
        .split(' ')
        .forEach((word) => {
          const wLower = word.toLowerCase();
          if (
            (wLower.includes('dun') ||
              wLower.includes('champagne') ||
              wLower.includes('pearl')) &&
            !roanColorName.toLowerCase().includes(wLower) &&
            !prefix.toLowerCase().includes(wLower) &&
            !word.includes('(') &&
            !word.includes(')')
          ) {
            if (
              !existingDescriptors.map((d) => d.toLowerCase()).includes(wLower)
            ) {
              existingDescriptors.push(capitalizeFirstLetter(wLower));
            }
          }
        });
      displayColorParts = [`${prefix}${roanColorName}`];
      if (existingDescriptors.length > 0)
        displayColorParts.push(...existingDescriptors);
      phenotypeKeyForShade = roanColorName;
    } else {
      if (!displayColorParts.some((p) => p.toLowerCase().includes('roan'))) {
        displayColorParts.push('Roan');
      }
    }
  }

  // --- White Patterns & Markings ---
  let isAllWhiteFromDominant = false;
  const wAlleles = getDominantWhiteAlleles();
  if (wAlleles.length > 0) {
    if (
      wAlleles.some((w) =>
        ['W2', 'W4', 'W5', 'W10', 'W13', 'W19', 'W22'].includes(w)
      )
    ) {
      displayColorParts = ['White'];
      phenotypeKeyForShade = 'Dominant White';
      isAllWhiteFromDominant = true;
    } else if (wAlleles.includes('W20')) {
      if (
        !isAllWhiteFromDominant &&
        !displayColorParts.join(' ').toLowerCase().includes('minimal white')
      ) {
        displayColorParts.push('Minimal White (W20)');
      }
    } else {
      if (
        !isAllWhiteFromDominant &&
        !displayColorParts.join(' ').toLowerCase().includes('dominant white') &&
        !displayColorParts.join(' ').toLowerCase().includes('white')
      ) {
        displayColorParts.push('Dominant White');
      }
    }
  }

  if (!isAllWhiteFromDominant) {
    if (hasAllele('O_FrameOvero', 'O') && fullGenotype.O_FrameOvero !== 'O/O') {
      if (!displayColorParts.join(' ').toLowerCase().includes('frame overo'))
        displayColorParts.push('Frame Overo');
    }
    if (hasAllele('TO_Tobiano', 'TO')) {
      const tobianoName = 'Tobiano';
      if (!displayColorParts.join(' ').toLowerCase().includes('tobiano')) {
        displayColorParts.push(tobianoName);
      }
    }
    if (hasAllele('SB1_Sabino1', 'SB1')) {
      if (!displayColorParts.join(' ').toLowerCase().includes('sabino'))
        displayColorParts.push('Sabino');
    }
    const splashAlleles = getSplashWhiteAlleles();
    if (splashAlleles.length > 0) {
      const splashTerms = splashAlleles.map(
        (sa) => `Splash White ${sa.replace('SW', '')}`
      );
      splashTerms.forEach((st) => {
        if (
          !displayColorParts.join(' ').toLowerCase().includes(st.toLowerCase())
        ) {
          displayColorParts.push(st);
        }
      });
    }
    const edenAlleles = getEdenWhiteAlleles();
    if (edenAlleles.length > 0) {
      const edenTerms = edenAlleles.map(
        (ea) => `Eden White ${ea.replace('EDXW', '')}`
      );
      edenTerms.forEach((et) => {
        if (
          !displayColorParts.join(' ').toLowerCase().includes(et.toLowerCase())
        ) {
          displayColorParts.push(et);
        }
      });
    }
  }

  // --- Leopard Complex (LP_LeopardComplex) and Pattern-1 (PATN1_Pattern1) ---
  const hasLP =
    fullGenotype.LP_LeopardComplex &&
    fullGenotype.LP_LeopardComplex.includes('LP');
  const hasPATN1 =
    fullGenotype.PATN1_Pattern1 &&
    fullGenotype.PATN1_Pattern1.includes('PATN1') &&
    fullGenotype.PATN1_Pattern1 !== 'patn1/patn1';
  if (hasLP && !isAllWhiteFromDominant) {
    phenotypic_markings.mottling = true;
    phenotypic_markings.striping = true;
    let lpPatternName = '';
    if (fullGenotype.LP_LeopardComplex === 'LP/LP') {
      lpPatternName = hasPATN1 ? 'Fewspot Leopard' : 'Snowcap';
    } else if (fullGenotype.LP_LeopardComplex === 'LP/lp') {
      if (hasPATN1) {
        lpPatternName = 'Leopard Appaloosa';
      } else {
        let agePrefix =
          ageInYears <= 4 ? 'Light' : ageInYears <= 8 ? 'Moderate' : 'Heavy';
        let sfModifier;
        const snowProb =
          (breedGeneticProfile?.advanced_markings_bias?.snowflake_probability_multiplier ?? 1.0) * 0.5;
        const frostProb =
          (breedGeneticProfile?.advanced_markings_bias
            ?.frost_probability_multiplier ?? 1.0) * 0.5;
        sfModifier =
          selectWeightedRandom({ Snowflake: snowProb, Frost: frostProb }) ||
          (Math.random() < 0.5 ? 'Snowflake' : 'Frost');
        const underlyingPattern =
          Math.random() < 0.5 ? 'Blanket' : 'Varnish Roan';
        lpPatternName = `${agePrefix} ${sfModifier} ${underlyingPattern}`;
      }
    }
    if (lpPatternName) {
      if (
        !displayColorParts
          .join(' ')
          .toLowerCase()
          .includes(lpPatternName.toLowerCase())
      ) {
        displayColorParts.push(lpPatternName);
        if (!displayColorParts.some((p) => p.toLowerCase().includes('gray'))) {
          phenotypeKeyForShade = lpPatternName;
        }
      }
    }
  }

  // --- Gray (G_Gray) ---
  if (hasAllele('G_Gray', 'G') && !isAllWhiteFromDominant) {
    let grayPhenotype;
    let grayBaseTone =
      baseColor === 'Black' || baseColor === 'Bay'
        ? 'Steel'
        : baseColor === 'Chestnut' || baseColor === 'Mushroom Chestnut'
        ? 'Rose'
        : '';
    if (ageInYears <= 3) grayPhenotype = `${grayBaseTone} Gray`.trim();
    else if (ageInYears <= 6)
      grayPhenotype = `${grayBaseTone} Dark Dapple Gray`.trim();
    else if (ageInYears <= 9)
      grayPhenotype = `${grayBaseTone} Light Dapple Gray`.trim();
    else if (ageInYears <= 12) grayPhenotype = 'White Gray';
    else grayPhenotype = 'Fleabitten Gray';

    if (!grayBaseTone && ageInYears <= 9) {
      grayPhenotype = `${grayBaseTone} Gray`.trim();
    }

    displayColorParts = [grayPhenotype];
    phenotypeKeyForShade = grayPhenotype;

    let bloodyShoulderChance =
      0.001 *
      (breedGeneticProfile?.advanced_markings_bias
        ?.bloody_shoulder_probability_multiplier ?? 1.0);
    if (Math.random() < bloodyShoulderChance) {
      if (!phenotypic_markings.body_markings)
        phenotypic_markings.body_markings = {};
      phenotypic_markings.body_markings.bloody_shoulder = true;
    }
  }

  // --- Rabicano ---
  if (
    fullGenotype.rabicano === true &&
    !isAllWhiteFromDominant &&
    !displayColorParts.some((p) => p.toLowerCase().includes('gray'))
  ) {
    if (!displayColorParts.join(' ').toLowerCase().includes('rabicano')) {
      displayColorParts.push('Rabicano');
    }
  }

  // --- Dun Primitive Markings ---
  if (
    dunEffectDescriptor &&
    !displayColorParts.some(
      (p) => p.toLowerCase().includes('dun') && !p.includes('(')
    ) &&
    !displayColorParts.join(' ').includes(dunEffectDescriptor) &&
    !isAllWhiteFromDominant &&
    !displayColorParts.some((p) => p.toLowerCase().includes('gray'))
  ) {
    displayColorParts.push(dunEffectDescriptor);
  }

  // --- Final Assembly ---
  // Improved deduplication
  let uniqueParts = [];
  const seenTerms = new Set();
  for (const part of displayColorParts) {
    if (part && part.trim() !== '') {
      const partWords = part.split(' ').map((w) => w.toLowerCase());
      const primaryTerm = partWords[partWords.length - 1];
      if (!seenTerms.has(primaryTerm)) {
        uniqueParts.push(part.trim());
        seenTerms.add(primaryTerm);
      } else {
        const existingIndex = uniqueParts.findIndex((p) =>
          p.toLowerCase().endsWith(primaryTerm)
        );
        if (existingIndex !== -1) {
          if (part.split(' ').length > uniqueParts[existingIndex].split(' ').length) {
            uniqueParts[existingIndex] = part.trim();
          }
        }
      }
    }
  }
  displayColorParts = uniqueParts;

  // Reordering
  if (
    displayColorParts.length > 1 &&
    !isAllWhiteFromDominant &&
    !displayColorParts[0].toLowerCase().includes('gray')
  ) {
    const mainColorPart =
      displayColorParts.find(
        (p) =>
          !p.toLowerCase().startsWith('sooty') &&
          !(
            determined_shade &&
            p.toLowerCase().startsWith(determined_shade.toLowerCase()) &&
            p !== determined_shade
          ) &&
          !['pangare', 'flaxen', 'rabicano'].includes(p.toLowerCase()) &&
          !p.toLowerCase().includes('dun (') &&
          !p.toLowerCase().includes('white') &&
          !p.toLowerCase().includes('overo') &&
          !p.toLowerCase().includes('tobiano') &&
          !p.toLowerCase().includes('sabino') &&
          !p.toLowerCase().includes('appaloosa')
      ) || displayColorParts[0];
    const sootyPrefix = displayColorParts.find(
      (p) => p.toLowerCase() === 'sooty'
    );
    const shadePrefix =
      determined_shade &&
      determined_shade.toLowerCase() !== 'standard' &&
      determined_shade.toLowerCase() !== 'medium'
        ? displayColorParts.find(
            (p) =>
              p.toLowerCase().startsWith(determined_shade.toLowerCase()) &&
              p
                .toLowerCase()
                .includes(
                  mainColorPart
                    .split(' ')[mainColorPart.split(' ').length - 1].toLowerCase()
                )
          )
        : null;
    const otherDescriptors = displayColorParts.filter(
      (p) => p !== mainColorPart && p !== sootyPrefix && p !== shadePrefix
    );
    const orderedParts = [];
    if (
      sootyPrefix &&
      sootyPrefix !== mainColorPart &&
      sootyPrefix !== shadePrefix
    ) {
      orderedParts.push(sootyPrefix);
    }
    orderedParts.push(mainColorPart);
    orderedParts.push(...otherDescriptors);
    displayColorParts = orderedParts.filter(
      (v, i, a) => v && a.indexOf(v) === i
    );
  }

  let final_display_color = displayColorParts
    .join(' ')
    .replace(/  +/g, ' ')
    .trim();
  if (!final_display_color.trim()) {
    final_display_color = baseColor || 'Undefined Phenotype';
  }

  // --- Phenotypic Markings ---
  if (breedGeneticProfile && breedGeneticProfile.marking_bias) {
    const mb = breedGeneticProfile.marking_bias;
    if (mb.face && typeof mb.face === 'object') {
      phenotypic_markings.face = selectWeightedRandom(mb.face) || 'none';
    }

    const legMarkingTypes = mb.leg_specific_probabilities
      ? Object.keys(mb.leg_specific_probabilities)
      : [];
    if (
      legMarkingTypes.length > 0 &&
      typeof mb.legs_general_probability === 'number'
    ) {
      let legsMarkedCount = 0;
      const maxLegs = mb.max_legs_marked !== undefined ? mb.max_legs_marked : 4;
      ['LF', 'RF', 'LH', 'RH'].forEach((leg) => {
        if (
          legsMarkedCount < maxLegs &&
          Math.random() < mb.legs_general_probability
        ) {
          phenotypic_markings.legs[leg] =
            selectWeightedRandom(mb.leg_specific_probabilities) || 'none';
          if (phenotypic_markings.legs[leg] !== 'none') {
            legsMarkedCount++;
          }
        } else {
          phenotypic_markings.legs[leg] = 'none';
        }
      });
    }
  }

  console.log(
    '[Debug] Final: final_display_color=',
    final_display_color,
    'phenotypic_markings=',
    phenotypic_markings,
    'determined_shade=',
    determined_shade
  );
  return { final_display_color, phenotypic_markings, determined_shade };
}

/**
 * Calculates the genotype of a foal based on sire and dam genotypes.
 * @param {object} sireGenotype - The sire's full genotype object.
 * @param {object} damGenotype - The dam's full genotype object.
 * @param {object} foalBreedGeneticProfile - The genetic profile of the foal's breed (for disallowed_combinations and boolean modifier prevalence).
 * @returns {Promise<object>} An object representing the foal's full genotype.
 */
async function calculateFoalGenetics(
  sireGenotype,
  damGenotype,
  foalBreedGeneticProfile
) {
  console.log(
    '[GeneticsEngine] Calculating foal genetics. Sire:',
    sireGenotype,
    'Dam:',
    damGenotype,
    'Foal Profile:',
    foalBreedGeneticProfile
  );
  const foalGenotype = {};

  if (!sireGenotype || !damGenotype || !foalBreedGeneticProfile) {
    console.error(
      '[GeneticsEngine] Missing sire, dam, or foal breed profile for foal genetics calculation.'
    );
    return foalGenotype;
  }

  const getParentAllele = (allelePairString) => {
    if (
      !allelePairString ||
      typeof allelePairString !== 'string' ||
      !allelePairString.includes('/')
    ) {
      return null;
    }
    const alleles = allelePairString.split('/');
    return alleles[Math.floor(Math.random() * alleles.length)];
  };

  const combineAlleles = (allele1, allele2) => {
    if (allele1 === null || allele2 === null) return null;
    const orderPreservingGenes = ['W', 'SW', 'EDXW'];
    const recessiveLikes = [
      'n',
      'w',
      'patn1',
      'nd1',
      'nd2',
      'lp',
      'g',
      'rn',
      'to',
      'o',
      'sb1',
      'mu',
      'e',
      'a',
      'ch',
      'cr',
      'z',
      'prl',
      'd',
    ];
    if (
      !recessiveLikes.includes(allele1.toLowerCase()) &&
      recessiveLikes.includes(allele2.toLowerCase())
    ) {
      return `${allele1}/${allele2}`;
    }
    if (
      recessiveLikes.includes(allele1.toLowerCase()) &&
      !recessiveLikes.includes(allele2.toLowerCase())
    ) {
      return `${allele2}/${allele1}`;
    }
    for (const prefix of orderPreservingGenes) {
      if (allele1.startsWith(prefix) && allele1 !== allele2 && allele2 === 'w')
        return `${allele1}/${allele2}`;
      if (allele2.startsWith(prefix) && allele2 !== allele1 && allele1 === 'w')
        return `${allele2}/${allele1}`;
    }
    const dominantLike = [
      'Ch',
      'Cr',
      'Z',
      'Prl',
      'D',
      'Mu',
      'Lp',
      'Rn',
      'To',
      'O',
      'Sb1',
    ];
    if (
      dominantLike.includes(allele1) &&
      (allele2 === 'n' || allele2 === allele1.toLowerCase())
    ) {
      return `${allele1}/${allele2}`;
    }
    if (
      dominantLike.includes(allele2) &&
      (allele1 === 'n' || allele1 === allele2.toLowerCase())
    ) {
      return `${allele2}/${allele1}`;
    }
    return [allele1, allele2].sort().join('/');
  };

  // Determine genes to inherit, prioritizing allowed_alleles
  const genesToInherit = foalBreedGeneticProfile.allowed_alleles
    ? Object.keys(foalBreedGeneticProfile.allowed_alleles)
    : [...new Set([...Object.keys(sireGenotype), ...Object.keys(damGenotype)])].filter(
        (g) => !['sooty', 'flaxen', 'pangare', 'rabicano'].includes(g)
      );

  for (const gene of genesToInherit) {
    const sireAllelePair = sireGenotype[gene];
    const damAllelePair = damGenotype[gene];

    let foalAllelePair = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    // If both parents have the gene
    if (sireAllelePair && damAllelePair) {
      while (attempts < MAX_ATTEMPTS) {
        const sirePassedAllele = getParentAllele(sireAllelePair);
        const damPassedAllele = getParentAllele(damAllelePair);

        if (sirePassedAllele === null || damPassedAllele === null) {
          break;
        }

        foalAllelePair = combineAlleles(sirePassedAllele, damPassedAllele);
        if (!foalAllelePair) break;

        const allowedForFoal = foalBreedGeneticProfile.allowed_alleles
          ? foalBreedGeneticProfile.allowed_alleles[gene] || []
          : null;
        const disallowedForFoal = foalBreedGeneticProfile.disallowed_combinations
          ? foalBreedGeneticProfile.disallowed_combinations[gene] || []
          : [];

        if (allowedForFoal && !allowedForFoal.includes(foalAllelePair)) {
          attempts++;
          foalAllelePair = null;
          continue;
        }

        if (disallowedForFoal.includes(foalAllelePair)) {
          attempts++;
          foalAllelePair = null;
          continue;
        }

        break;
      }
    }

    // If foalAllelePair is valid, assign it
    if (foalAllelePair) {
      foalGenotype[gene] = foalAllelePair;
    } else {
      // Fallback to allele_weights or default recessive pair
      const allowedForFoal = foalBreedGeneticProfile.allowed_alleles
        ? foalBreedGeneticProfile.allowed_alleles[gene] || []
        : [];
      const disallowedForFoal = foalBreedGeneticProfile.disallowed_combinations
        ? foalBreedGeneticProfile.disallowed_combinations[gene] || []
        : [];

      if (
        foalBreedGeneticProfile.allele_weights &&
        foalBreedGeneticProfile.allele_weights[gene]
      ) {
        let fallbackPair = selectWeightedRandom(
          foalBreedGeneticProfile.allele_weights[gene]
        );
        if (fallbackPair && !disallowedForFoal.includes(fallbackPair)) {
          foalGenotype[gene] = fallbackPair;
          continue;
        }
      }

      // Default to recessive pair if allowed
      const recessivePairs = [
        'n/n',
        'w/w',
        'e/e',
        'a/a',
        'g/g',
        'rn/rn',
        'lp/lp',
        'to/to',
        'o/o',
        'sb1/sb1',
        'd/d',
        'nd2/nd2',
        'patn1/patn1',
        'ch/ch',
        'cr/cr',
        'z/z',
        'prl/prl',
        'mu/mu',
      ];
      let fallbackPair = recessivePairs.find((p) => allowedForFoal.includes(p));
      if (!fallbackPair && allowedForFoal.length > 0) {
        fallbackPair = allowedForFoal[0];
      }

      if (fallbackPair && !disallowedForFoal.includes(fallbackPair)) {
        foalGenotype[gene] = fallbackPair;
      } else {
        console.warn(
          `[GeneticsEngine] No valid allele pair for ${gene}. Omitting from foal genotype.`
        );
      }
    }
  }

  // Handle boolean modifiers
  const booleanModifiers = ['sooty', 'flaxen', 'pangare', 'rabicano'];
  if (foalBreedGeneticProfile.boolean_modifiers_prevalence) {
    const definedModifiers = Object.keys(
      foalBreedGeneticProfile.boolean_modifiers_prevalence
    );
    definedModifiers.forEach((modifier) => {
      if (!booleanModifiers.includes(modifier)) return;
      const sireHasModifier = sireGenotype[modifier];
      const damHasModifier = damGenotype[modifier];
      const prevalence =
        foalBreedGeneticProfile.boolean_modifiers_prevalence[modifier];

      if (sireHasModifier === true && damHasModifier === true) {
        foalGenotype[modifier] = true;
      } else if (sireHasModifier === false && damHasModifier === false) {
        foalGenotype[modifier] = false;
      } else if (
        sireHasModifier !== undefined &&
        damHasModifier !== undefined
      ) {
        foalGenotype[modifier] = Math.random() < 0.5;
      } else if (sireHasModifier !== undefined) {
        foalGenotype[modifier] =
          Math.random() < 0.5
            ? sireHasModifier
            : Math.random() < (prevalence || 0);
      } else if (damHasModifier !== undefined) {
        foalGenotype[modifier] =
          Math.random() < 0.5
            ? damHasModifier
            : Math.random() < (prevalence || 0);
      } else {
        foalGenotype[modifier] = typeof prevalence === 'number' ? Math.random() < prevalence : false;
      }
    });
  }

  console.log('[GeneticsEngine] Calculated foal genotype:', foalGenotype);
  return foalGenotype;
}

module.exports = {
  generateStoreHorseGenetics,
  determinePhenotype,
  calculateFoalGenetics,
  selectWeightedRandom,
  applyPearlDilution,
};