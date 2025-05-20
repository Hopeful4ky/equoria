const temperamentEngine = require('../temperamentEngine');
const {
  selectWeightedRandom,
  determineStoreHorseTemperament,
  determineFoalTemperament,
  DEFAULT_TEMPERAMENT,
} = temperamentEngine;

describe('temperamentEngine', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Restore Math.random for each test, to be spied on specifically if a test needs it.
    // jest.spyOn(Math, 'random').mockRestore(); // This might be problematic if not spied on first.
    // Better to ensure it's restored only if a spy was created in a test.
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    // jest.restoreAllMocks(); // This is broader, usually good. Clears spies and resets mocks.
    // For Math.random, explicit restoration if spied on is safer.
  });

  describe('selectWeightedRandom', () => {
    let mathRandomSpy;
    afterEach(() => {
      if (mathRandomSpy) mathRandomSpy.mockRestore();
    });

    it('should return DEFAULT_TEMPERAMENT if weightsObject is null, undefined, or (truly) empty object', () => {
      expect(selectWeightedRandom(null)).toBe(DEFAULT_TEMPERAMENT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid or empty weightsObject')
      );
      consoleWarnSpy.mockClear();
      expect(selectWeightedRandom(undefined)).toBe(DEFAULT_TEMPERAMENT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid or empty weightsObject')
      );
      consoleWarnSpy.mockClear();
      expect(selectWeightedRandom({})).toBe(DEFAULT_TEMPERAMENT); // Truly empty
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid or empty weightsObject')
      );
    });

    it('should pick a random key if total positive weight is 0 but keys exist', () => {
      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0); // first key
      expect(selectWeightedRandom({ a: 0, b: -10, c: 'invalid' })).toBe('a');
      // expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Total weight is 0')); // Warning removed/changed in SUT
      mathRandomSpy.mockRestore();

      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99); // last key for {x:0, y:0, z:0}
      expect(selectWeightedRandom({ x: 0, y: 0, z: 0 })).toBe('z');
    });

    it('should correctly select items based on weights with mocked Math.random', () => {
      const weights = { Calm: 20, Spirited: 30, Anxious: 50 }; // Total 100
      mathRandomSpy = jest.spyOn(Math, 'random');

      mathRandomSpy.mockReturnValue(0.0);
      expect(selectWeightedRandom(weights)).toBe('Calm');
      mathRandomSpy.mockReturnValue(0.19);
      expect(selectWeightedRandom(weights)).toBe('Calm');
      mathRandomSpy.mockReturnValue(0.2);
      expect(selectWeightedRandom(weights)).toBe('Spirited');
      mathRandomSpy.mockReturnValue(0.49);
      expect(selectWeightedRandom(weights)).toBe('Spirited');
      mathRandomSpy.mockReturnValue(0.5);
      expect(selectWeightedRandom(weights)).toBe('Anxious');
      mathRandomSpy.mockReturnValue(0.99);
      expect(selectWeightedRandom(weights)).toBe('Anxious');
    });

    it('should ignore invalid (non-positive or non-numeric) weights during selection', () => {
      const weights = { Calm: 20, Spirited: -5, Anxious: 30, Lazy: 'text' }; // Effective: Calm 20, Anxious 30 (Total 50)
      mathRandomSpy = jest.spyOn(Math, 'random');

      mathRandomSpy.mockReturnValue(0.1);
      expect(selectWeightedRandom(weights)).toBe('Calm');
      mathRandomSpy.mockReturnValue(0.39);
      expect(selectWeightedRandom(weights)).toBe('Calm');
      mathRandomSpy.mockReturnValue(0.4);
      expect(selectWeightedRandom(weights)).toBe('Anxious');
      mathRandomSpy.mockReturnValue(0.99);
      expect(selectWeightedRandom(weights)).toBe('Anxious');
    });

    it('should return the first valid temperament or DEFAULT_TEMPERAMENT as a final fallback', () => {
      const weights = { a: 1 };
      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(1.1);
      expect(selectWeightedRandom(weights)).toBe('a');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('selectWeightedRandom did not select an item')
      );
    });
  });

  describe('determineStoreHorseTemperament', () => {
    let mockSelectWeightedRandomFunc;

    beforeEach(() => {
      mockSelectWeightedRandomFunc = jest.fn();
    });

    it('should call injected selectWeightedRandom with breedTemperamentWeights', () => {
      const breedWeights = { Calm: 70, Spirited: 30 };
      mockSelectWeightedRandomFunc.mockReturnValue('TestValue');

      const result = determineStoreHorseTemperament(breedWeights, {
        selectWeightedRandom: mockSelectWeightedRandomFunc,
      });

      expect(mockSelectWeightedRandomFunc).toHaveBeenCalledWith(breedWeights);
      expect(result).toBe('TestValue');
    });

    it('should return DEFAULT_TEMPERAMENT if breedTemperamentWeights is null, undefined, or empty', () => {
      expect(
        determineStoreHorseTemperament(null, {
          selectWeightedRandom: mockSelectWeightedRandomFunc,
        })
      ).toBe(DEFAULT_TEMPERAMENT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid or empty breedTemperamentWeights')
      );
      expect(mockSelectWeightedRandomFunc).not.toHaveBeenCalled(); // Should return before calling
      consoleWarnSpy.mockClear();

      expect(
        determineStoreHorseTemperament(undefined, {
          selectWeightedRandom: mockSelectWeightedRandomFunc,
        })
      ).toBe(DEFAULT_TEMPERAMENT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid or empty breedTemperamentWeights')
      );
      expect(mockSelectWeightedRandomFunc).not.toHaveBeenCalled();
      consoleWarnSpy.mockClear();

      expect(
        determineStoreHorseTemperament(
          {},
          { selectWeightedRandom: mockSelectWeightedRandomFunc }
        )
      ).toBe(DEFAULT_TEMPERAMENT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid or empty breedTemperamentWeights')
      );
      expect(mockSelectWeightedRandomFunc).not.toHaveBeenCalled();
    });

    it('should use actual selectWeightedRandom if no dependency injected', () => {
      const breedWeights = { UniqueValue: 100 };
      const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
      expect(determineStoreHorseTemperament(breedWeights)).toBe('UniqueValue');
      mathRandomSpy.mockRestore();
    });
  });

  describe('determineFoalTemperament', () => {
    const PARENTAL_INFLUENCE_BONUS = 15;
    let mockSelectWeightedRandomFunc;

    beforeEach(() => {
      mockSelectWeightedRandomFunc = jest.fn();
    });

    it('should return DEFAULT_TEMPERAMENT if breedTemperamentWeights is null, undefined, or empty', () => {
      expect(
        determineFoalTemperament('Calm', 'Spirited', null, {
          selectWeightedRandom: mockSelectWeightedRandomFunc,
        })
      ).toBe(DEFAULT_TEMPERAMENT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Invalid or empty breedTemperamentWeights for foal'
        )
      );
      expect(mockSelectWeightedRandomFunc).not.toHaveBeenCalled();
    });

    it('should call injected selectWeightedRandom with weights adjusted by parental influence', () => {
      const breedWeights = { Calm: 20, Spirited: 10, Anxious: 5 };
      const sireT = 'Calm';
      const damT = 'Spirited';
      mockSelectWeightedRandomFunc.mockReturnValue('SelectedTemperament');

      const result = determineFoalTemperament(sireT, damT, breedWeights, {
        selectWeightedRandom: mockSelectWeightedRandomFunc,
      });

      const expectedAdjustedWeights = {
        Calm: 20 + PARENTAL_INFLUENCE_BONUS,
        Spirited: 10 + PARENTAL_INFLUENCE_BONUS,
        Anxious: 5,
      };
      expect(mockSelectWeightedRandomFunc).toHaveBeenCalledWith(
        expectedAdjustedWeights
      );
      expect(result).toBe('SelectedTemperament');
    });

    it('should handle sire and dam having the same temperament (double bonus)', () => {
      const breedWeights = { Calm: 20, Spirited: 10 };
      const sireT = 'Calm';
      const damT = 'Calm';
      determineFoalTemperament(sireT, damT, breedWeights, {
        selectWeightedRandom: mockSelectWeightedRandomFunc,
      });
      const expectedAdjustedWeights = {
        Calm: 20 + PARENTAL_INFLUENCE_BONUS + PARENTAL_INFLUENCE_BONUS,
        Spirited: 10,
      };
      expect(mockSelectWeightedRandomFunc).toHaveBeenCalledWith(
        expectedAdjustedWeights
      );
    });

    it('should log warnings if parental temperaments are not in breed weights and call with original weights (adjusted for present parents)', () => {
      const breedWeights = { Calm: 20 };
      const sireT = 'UnknownSireTemperament';
      const damT = 'Calm'; // One known

      determineFoalTemperament(sireT, damT, breedWeights, {
        selectWeightedRandom: mockSelectWeightedRandomFunc,
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Sire temperament '${sireT}' not in breed's base weights`
        )
      );
      const expectedAdjustedWeights = {
        Calm: 20 + PARENTAL_INFLUENCE_BONUS, // Dam's bonus applied
      };
      expect(mockSelectWeightedRandomFunc).toHaveBeenCalledWith(
        expectedAdjustedWeights
      );
    });

    it('should use actual selectWeightedRandom logic with adjusted weights if no dependency injected', () => {
      const breedWeights = { Calm: 1, Spirited: 1 };
      const sireT = 'Calm';
      const damT = 'Calm';
      const mathRandomSpy = jest.spyOn(Math, 'random');

      mathRandomSpy.mockReturnValue(0.01);
      expect(determineFoalTemperament(sireT, damT, breedWeights)).toBe('Calm');

      mathRandomSpy.mockReturnValue(0.99);
      expect(determineFoalTemperament(sireT, damT, breedWeights)).toBe(
        'Spirited'
      );
      mathRandomSpy.mockRestore();
    });
  });
});
