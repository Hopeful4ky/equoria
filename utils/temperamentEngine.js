/**
 * temperamentEngine.js
 * Utility functions for determining horse temperaments.
 */

const DEFAULT_TEMPERAMENT = 'Calm'; // Fallback temperament
const PARENTAL_INFLUENCE_BONUS = 15; // Points to add to parental temperament weights for foals

/**
 * Selects a random item from a weighted list.
 * @param {object} weightsObject - An object where keys are item names and values are their weights.
 *                                 e.g., {"Calm": 20, "Spirited": 15}
 * @returns {string|null} The selected item name, or null if input is invalid.
 */
const selectWeightedRandom = (weightsObject) => {
  if (
    !weightsObject ||
    typeof weightsObject !== 'object' ||
    Object.keys(weightsObject).length === 0
  ) {
    console.warn(
      '[TemperamentEngine] Invalid or empty weightsObject provided to selectWeightedRandom. Returning default.'
    );
    return DEFAULT_TEMPERAMENT;
  }

  let totalWeight = 0;
  for (const temperament in weightsObject) {
    if (
      typeof weightsObject[temperament] === 'number' &&
      weightsObject[temperament] > 0
    ) {
      totalWeight += weightsObject[temperament];
    }
  }

  if (totalWeight === 0) {
    // console.warn('[TemperamentEngine] Total weight is 0 in selectWeightedRandom. Attempting to pick random key or returning default.');
    const keys = Object.keys(weightsObject);
    return keys.length > 0
      ? keys[Math.floor(Math.random() * keys.length)]
      : DEFAULT_TEMPERAMENT;
  }

  let randomNumber = Math.random() * totalWeight;

  for (const temperament in weightsObject) {
    if (
      typeof weightsObject[temperament] === 'number' &&
      weightsObject[temperament] > 0
    ) {
      if (randomNumber < weightsObject[temperament]) {
        return temperament;
      }
      randomNumber -= weightsObject[temperament];
    }
  }
  console.warn(
    '[TemperamentEngine] selectWeightedRandom did not select an item as expected. Returning default.'
  );
  const keys = Object.keys(weightsObject).filter(
    (k) => typeof weightsObject[k] === 'number' && weightsObject[k] > 0
  );
  return keys.length > 0 ? keys[0] : DEFAULT_TEMPERAMENT;
};

/**
 * Determines the temperament for a store-bought horse based on breed profile.
 * @param {object} breedTemperamentWeights - The temperament_weights object from the breed's profile.
 * @param {object} [_dependencies={}] - Optional internal dependencies for testing.
 * @returns {string} The determined temperament.
 */
const determineStoreHorseTemperament = (
  breedTemperamentWeights,
  _dependencies = {}
) => {
  const _selectWeightedRandom =
    _dependencies.selectWeightedRandom || module.exports.selectWeightedRandom;
  if (
    !breedTemperamentWeights ||
    typeof breedTemperamentWeights !== 'object' ||
    Object.keys(breedTemperamentWeights).length === 0
  ) {
    console.warn(
      '[TemperamentEngine] Invalid or empty breedTemperamentWeights for store horse. Returning default temperament.'
    );
    return DEFAULT_TEMPERAMENT;
  }
  return _selectWeightedRandom(breedTemperamentWeights);
};

/**
 * Determines the temperament for a foal based on parental temperaments and breed profile.
 * @param {string} sireTemperament - The temperament of the sire.
 * @param {string} damTemperament - The temperament of the dam.
 * @param {object} breedTemperamentWeights - The temperament_weights object from the foal's breed profile.
 * @param {object} [_dependencies={}] - Optional internal dependencies for testing.
 * @returns {string} The determined temperament for the foal.
 */
const determineFoalTemperament = (
  sireTemperament,
  damTemperament,
  breedTemperamentWeights,
  _dependencies = {}
) => {
  const _selectWeightedRandom =
    _dependencies.selectWeightedRandom || module.exports.selectWeightedRandom;

  if (
    !breedTemperamentWeights ||
    typeof breedTemperamentWeights !== 'object' ||
    Object.keys(breedTemperamentWeights).length === 0
  ) {
    console.warn(
      '[TemperamentEngine] Invalid or empty breedTemperamentWeights for foal. Returning default temperament.'
    );
    return DEFAULT_TEMPERAMENT;
  }

  const adjustedWeights = { ...breedTemperamentWeights };

  if (
  sireTemperament &&
  Object.prototype.hasOwnProperty.call(adjustedWeights, sireTemperament)
) {
    adjustedWeights[sireTemperament] =
      (adjustedWeights[sireTemperament] || 0) + PARENTAL_INFLUENCE_BONUS;
  } else if (sireTemperament) {
    console.warn(
      `[TemperamentEngine] Sire temperament '${sireTemperament}' not in breed's base weights. Not applying bonus.`
    );
  }

  if (
  damTemperament &&
  Object.prototype.hasOwnProperty.call(adjustedWeights, damTemperament)
) {
    adjustedWeights[damTemperament] =
      (adjustedWeights[damTemperament] || 0) + PARENTAL_INFLUENCE_BONUS;
  } else if (damTemperament) {
    console.warn(
      `[TemperamentEngine] Dam temperament '${damTemperament}' not in breed's base weights. Not applying bonus.`
    );
  }

  for (const temp in adjustedWeights) {
    if (adjustedWeights[temp] < 0) adjustedWeights[temp] = 0;
  }

  return _selectWeightedRandom(adjustedWeights);
};

module.exports = {
  selectWeightedRandom,
  determineStoreHorseTemperament,
  determineFoalTemperament,
  DEFAULT_TEMPERAMENT,
};
