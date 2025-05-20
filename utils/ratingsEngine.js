/**
 * Generates a random rating score for a horse attribute based on breed profile.
 * @param {object} attributeProfile - The profile for the attribute, containing mean and std_dev.
 * @returns {number} - A random score between 1 and 100.
 */
const generateAttributeScore = (attributeProfile) => {
  if (
    !attributeProfile ||
    typeof attributeProfile.mean !== 'number' ||
    typeof attributeProfile.std_dev !== 'number'
  ) {
    console.warn(
      'Attribute profile is missing or invalid, defaulting to 50.',
      attributeProfile
    );
    return 50; // Default to a median score if profile is problematic
  }
  const { mean, std_dev } = attributeProfile;
  let score = Math.round(mean + (Math.random() * 2 - 1) * std_dev);
  score = Math.max(1, Math.min(100, score)); // Clamp between 1 and 100
  return score;
};

/**
 * Generates conformation and gait ratings for a store-bought horse based on its breed profile.
 * @param {object} breedRatingProfiles - The rating_profiles section of the breed\'s genetic profile.
 * @param {object} [_dependencies={}] - Optional internal dependencies for testing.
 * @param {function} [_dependencies.generateAttributeScore] - Optional override for generateAttributeScore.
 * @returns {{conformationRatings: object, gaitRatings: object}}
 */
const generateStoreHorseRatings = (breedRatingProfiles, _dependencies = {}) => {
  // Use the injected one if available, otherwise use the one from our own module's exports.
  // This allows spying on module.exports.generateAttributeScore in tests.
  const _generateAttributeScore =
    _dependencies.generateAttributeScore ||
    module.exports.generateAttributeScore;

  const conformationRatings = {};
  const gaitRatings = {};

  if (!breedRatingProfiles) {
    console.error(
      'CRITICAL: breedRatingProfiles is undefined in generateStoreHorseRatings. Cannot generate ratings.'
    );
    // Return default/empty ratings to prevent crashes, though this indicates a data setup issue.
    const defaultScore = 50;
    const confoAttrs = [
      'head',
      'neck',
      'shoulders',
      'back',
      'hindquarters',
      'legs',
      'hooves',
    ];
    const gaitAttrs = ['walk', 'trot', 'canter', 'gallop'];
    confoAttrs.forEach((attr) => (conformationRatings[attr] = defaultScore));
    gaitAttrs.forEach((attr) => (gaitRatings[attr] = defaultScore));
    gaitRatings.gaiting = null;
    return { conformationRatings, gaitRatings };
  }

  const conformationAttributes = [
    'head',
    'neck',
    'shoulders',
    'back',
    'hindquarters',
    'legs',
    'hooves',
  ];
  const gaitAttributes = ['walk', 'trot', 'canter', 'gallop', 'gaiting'];

  // Generate Conformation Ratings
  if (breedRatingProfiles.conformation) {
    for (const attr of conformationAttributes) {
      conformationRatings[attr] = _generateAttributeScore(
        breedRatingProfiles.conformation[attr]
      );
    }
  } else {
    console.warn(
      'Conformation profiles not found in breedRatingProfiles, defaulting all to 50.'
    );
    conformationAttributes.forEach((attr) => (conformationRatings[attr] = 50));
  }

  // Generate Gait Ratings
  if (breedRatingProfiles.gaits) {
    for (const attr of gaitAttributes) {
      if (attr === 'gaiting') {
        if (
          breedRatingProfiles.is_gaited_breed &&
          breedRatingProfiles.gaits[attr]
        ) {
          gaitRatings[attr] = _generateAttributeScore(
            breedRatingProfiles.gaits[attr]
          );
        } else {
          gaitRatings[attr] = null; // or 0 if preferred for non-gaited/missing profile
        }
      } else {
        gaitRatings[attr] = _generateAttributeScore(
          breedRatingProfiles.gaits[attr]
        );
      }
    }
  } else {
    console.warn(
      'Gait profiles not found in breedRatingProfiles, defaulting all to 50 (gaiting to null).'
    );
    gaitAttributes.forEach((attr) => {
      if (attr === 'gaiting') gaitRatings[attr] = null;
      else gaitRatings[attr] = 50;
    });
  }

  return { conformationRatings, gaitRatings };
};

// TODO: Implement calculateFoalRatings(sireRatings, damRatings)
const calculateFoalRatings = (
  sireCombinedRatings,
  damCombinedRatings,
  foalBreedRatingProfiles
) => {
  const conformationAttributes = [
    'head',
    'neck',
    'shoulders',
    'back',
    'hindquarters',
    'legs',
    'hooves',
  ];
  const gaitAttributes = ['walk', 'trot', 'canter', 'gallop', 'gaiting'];
  const newConformationRatings = {};
  const newGaitRatings = {};

  const RANDOM_TWEAK_RANGE = 5; // e.g., results in -5 to +5. Max random addition/subtraction.

  // Helper function to calculate a single attribute for a foal
  const calculateSingleFoalAttribute = (
    sireScore,
    damScore,
    attributeProfileForFoalBreed
  ) => {
    // Handle cases where parent scores might be missing or null
    const sScore =
      sireScore === undefined || sireScore === null ? 50 : sireScore;
    const dScore = damScore === undefined || damScore === null ? 50 : damScore;

    const parentAverage = (sScore + dScore) / 2;

    let breedStdDev = 0;
    if (
      attributeProfileForFoalBreed &&
      typeof attributeProfileForFoalBreed.std_dev === 'number'
    ) {
      breedStdDev = attributeProfileForFoalBreed.std_dev;
    } else {
      // console.warn(`Missing std_dev for attribute in foal's breed profile. Using minimal random influence.`);
      breedStdDev = 3; // Default if foal's breed has no std_dev for this specific attribute (should ideally not happen)
    }

    // Introduce variability based on the foal's breed standard deviation
    const breedInfluence = (Math.random() * 2 - 1) * breedStdDev;

    // Add a small random genetic tweak
    const randomTweak =
      Math.floor(Math.random() * (RANDOM_TWEAK_RANGE * 2 + 1)) -
      RANDOM_TWEAK_RANGE;

    let finalScore = Math.round(parentAverage + breedInfluence + randomTweak);
    finalScore = Math.max(1, Math.min(100, finalScore)); // Clamp between 1 and 100
    return finalScore;
  };

  // Calculate Conformation Ratings
  if (
    sireCombinedRatings &&
    sireCombinedRatings.conformation &&
    damCombinedRatings &&
    damCombinedRatings.conformation &&
    foalBreedRatingProfiles &&
    foalBreedRatingProfiles.conformation
  ) {
    for (const attr of conformationAttributes) {
      newConformationRatings[attr] = calculateSingleFoalAttribute(
        sireCombinedRatings.conformation[attr],
        damCombinedRatings.conformation[attr],
        foalBreedRatingProfiles.conformation[attr] // Pass the {mean, std_dev} object for this attribute from foal's breed
      );
    }
  } else {
    console.warn(
      '[RatingsEngine] Missing parent conformation ratings or foal breed profile for conformation. Defaulting foal conformation ratings to 50.'
    );
    conformationAttributes.forEach(
      (attr) => (newConformationRatings[attr] = 50)
    );
  }

  // Calculate Gait Ratings
  if (
    sireCombinedRatings &&
    sireCombinedRatings.gaits &&
    damCombinedRatings &&
    damCombinedRatings.gaits &&
    foalBreedRatingProfiles &&
    foalBreedRatingProfiles.gaits
  ) {
    for (const attr of gaitAttributes) {
      if (attr === 'gaiting') {
        if (foalBreedRatingProfiles.is_gaited_breed) {
          newGaitRatings[attr] = calculateSingleFoalAttribute(
            sireCombinedRatings.gaits[attr],
            damCombinedRatings.gaits[attr],
            foalBreedRatingProfiles.gaits[attr] // Pass the {mean, std_dev} object for this attribute
          );
        } else {
          newGaitRatings[attr] = null; // Non-gaited breeds have null for gaiting score
        }
      } else {
        newGaitRatings[attr] = calculateSingleFoalAttribute(
          sireCombinedRatings.gaits[attr],
          damCombinedRatings.gaits[attr],
          foalBreedRatingProfiles.gaits[attr] // Pass the {mean, std_dev} object
        );
      }
    }
  } else {
    console.warn(
      '[RatingsEngine] Missing parent gait ratings or foal breed profile for gaits. Defaulting foal gait ratings.'
    );
    gaitAttributes.forEach((attr) => {
      if (attr === 'gaiting') {
        newGaitRatings[attr] =
          foalBreedRatingProfiles && foalBreedRatingProfiles.is_gaited_breed
            ? 50
            : null;
      } else {
        newGaitRatings[attr] = 50;
      }
    });
  }

  return {
    conformationRatings: newConformationRatings,
    gaitRatings: newGaitRatings,
  };
};

module.exports = {
  generateAttributeScore,
  generateStoreHorseRatings,
  calculateFoalRatings,
};
