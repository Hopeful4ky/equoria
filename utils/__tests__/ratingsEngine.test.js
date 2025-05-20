const MOCKED_SCORE = 77; // A distinct number for easy verification
const DEFAULT_SCORE_FROM_SUT = 50; // Fallback score used internally by SUT

// ratingsEngine will be required in specific describe blocks or tests as needed

describe('ratingsEngine', () => {
  let consoleWarnSpy;
  let consoleErrorSpy;
  let ratingsEngine; // To be required in relevant test suites

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // jest.resetModules(); // No longer needed with DI and careful require()
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // jest.clearAllMocks(); // Spies are restored, other mocks are self-contained or not module-wide
  });

  describe('generateStoreHorseRatings', () => {
    let mockedGenerateAttributeScoreFunc;

    beforeEach(() => {
      ratingsEngine = require('../ratingsEngine'); // Require fresh for this suite
      mockedGenerateAttributeScoreFunc = jest.fn(() => MOCKED_SCORE);
    });

    const conformationAttributes = [
      'head',
      'neck',
      'shoulders',
      'back',
      'hindquarters',
      'legs',
      'hooves',
    ];
    const gaitAttrsNoGaiting = ['walk', 'trot', 'canter', 'gallop'];
    const fullGaitAttrs = [...gaitAttrsNoGaiting, 'gaiting'];

    const createProfile = (
      isGaited,
      includeConformation = true,
      includeGaits = true,
      includeGaitingProfile = true
    ) => {
      const profile = { is_gaited_breed: isGaited };
      if (includeConformation) {
        profile.conformation = {};
        conformationAttributes.forEach(
          (attr) => (profile.conformation[attr] = { mean: 50, std_dev: 10 })
        );
      }
      if (includeGaits) {
        profile.gaits = {};
        gaitAttrsNoGaiting.forEach(
          (attr) => (profile.gaits[attr] = { mean: 50, std_dev: 10 })
        );
        if (isGaited && includeGaitingProfile) {
          profile.gaits.gaiting = { mean: 50, std_dev: 10 };
        } else if (isGaited && !includeGaitingProfile) {
          profile.gaits.gaiting = undefined;
        }
      }
      return profile;
    };

    it('should use injected mock function for ratings (non-gaited)', () => {
      const profile = createProfile(false, true, true, true);
      const { conformationRatings, gaitRatings } =
        ratingsEngine.generateStoreHorseRatings(profile, {
          generateAttributeScore: mockedGenerateAttributeScoreFunc,
        });
      conformationAttributes.forEach((attr) =>
        expect(conformationRatings[attr]).toBe(MOCKED_SCORE)
      );
      gaitAttrsNoGaiting.forEach((attr) =>
        expect(gaitRatings[attr]).toBe(MOCKED_SCORE)
      );
      expect(gaitRatings.gaiting).toBeNull();
      expect(mockedGenerateAttributeScoreFunc).toHaveBeenCalledTimes(
        conformationAttributes.length + gaitAttrsNoGaiting.length
      );
    });

    it('should use injected mock function for ratings (gaited)', () => {
      const profile = createProfile(true, true, true, true);
      const { conformationRatings, gaitRatings } =
        ratingsEngine.generateStoreHorseRatings(profile, {
          generateAttributeScore: mockedGenerateAttributeScoreFunc,
        });
      conformationAttributes.forEach((attr) =>
        expect(conformationRatings[attr]).toBe(MOCKED_SCORE)
      );
      fullGaitAttrs.forEach((attr) =>
        expect(gaitRatings[attr]).toBe(MOCKED_SCORE)
      );
      expect(mockedGenerateAttributeScoreFunc).toHaveBeenCalledTimes(
        conformationAttributes.length + fullGaitAttrs.length
      );
    });

    it('should return SUT defaults and log error if breedRatingProfiles is undefined (mock not called)', () => {
      const { conformationRatings, gaitRatings } =
        ratingsEngine.generateStoreHorseRatings(undefined, {
          generateAttributeScore: mockedGenerateAttributeScoreFunc,
        });
      conformationAttributes.forEach((attr) =>
        expect(conformationRatings[attr]).toBe(DEFAULT_SCORE_FROM_SUT)
      );
      gaitAttrsNoGaiting.forEach((attr) =>
        expect(gaitRatings[attr]).toBe(DEFAULT_SCORE_FROM_SUT)
      );
      expect(gaitRatings.gaiting).toBeNull();
      expect(mockedGenerateAttributeScoreFunc).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('breedRatingProfiles is undefined')
      );
    });

    it('should use SUT defaults for conformation (logs warn), injected mock for gaits', () => {
      const profile = createProfile(false, false, true, true);
      const { conformationRatings, gaitRatings } =
        ratingsEngine.generateStoreHorseRatings(profile, {
          generateAttributeScore: mockedGenerateAttributeScoreFunc,
        });
      conformationAttributes.forEach((attr) =>
        expect(conformationRatings[attr]).toBe(DEFAULT_SCORE_FROM_SUT)
      );
      gaitAttrsNoGaiting.forEach((attr) =>
        expect(gaitRatings[attr]).toBe(MOCKED_SCORE)
      );
      expect(gaitRatings.gaiting).toBeNull();
      expect(mockedGenerateAttributeScoreFunc).toHaveBeenCalledTimes(
        gaitAttrsNoGaiting.length
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Conformation profiles not found')
      );
    });

    // Test that the original generateAttributeScore is called if no dependency is injected
    it('should use original generateAttributeScore if no dependency injected', () => {
      ratingsEngine = require('../ratingsEngine'); // Ensure we have a fresh module if needed, or trust the suite's beforeEach
      const realGenerateAttributeScoreSpy = jest.spyOn(
        ratingsEngine,
        'generateAttributeScore'
      );
      const profile = createProfile(false, true, true, true);

      ratingsEngine.generateStoreHorseRatings(profile); // No dependency injected

      expect(realGenerateAttributeScoreSpy).toHaveBeenCalled();
      expect(realGenerateAttributeScoreSpy.mock.calls.length).toBe(
        conformationAttributes.length + gaitAttrsNoGaiting.length
      );
      realGenerateAttributeScoreSpy.mockRestore();
    });
  });

  describe('generateAttributeScore (original implementation)', () => {
    let mathRandomSpy;

    beforeEach(() => {
      ratingsEngine = require('../ratingsEngine'); // Require fresh for this suite
    });

    afterEach(() => {
      if (mathRandomSpy) {
        mathRandomSpy.mockRestore();
        mathRandomSpy = null;
      }
    });

    it('should return a score between 1 and 100 with valid profile', () => {
      const profile = { mean: 50, std_dev: 10 };
      for (let i = 0; i < 10; i++) {
        const score = ratingsEngine.generateAttributeScore(profile);
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(100);
      }
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return DEFAULT_SCORE_FROM_SUT (50) and log warn if profile is undefined', () => {
      const score = ratingsEngine.generateAttributeScore(undefined);
      expect(score).toBe(DEFAULT_SCORE_FROM_SUT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attribute profile is missing or invalid'),
        undefined
      );
    });

    it('should return DEFAULT_SCORE_FROM_SUT (50) and log warn if profile is missing mean', () => {
      const profile = { std_dev: 10 };
      const score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(DEFAULT_SCORE_FROM_SUT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attribute profile is missing or invalid'),
        profile
      );
    });

    it('should return DEFAULT_SCORE_FROM_SUT (50) and log warn if profile is missing std_dev', () => {
      const profile = { mean: 50 };
      const score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(DEFAULT_SCORE_FROM_SUT);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attribute profile is missing or invalid'),
        profile
      );
    });

    it('should clamp score to 1 if calculated value is too low (Math.random = 0)', () => {
      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
      const profile = { mean: 5, std_dev: 10 };
      const score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(1);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should clamp score to 100 if calculated value is too high (Math.random = 1)', () => {
      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(1);
      const profile = { mean: 95, std_dev: 10 };
      const score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(100);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should calculate score based on mean, std_dev and Math.random (mocked values)', () => {
      const profile = { mean: 50, std_dev: 10 };

      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.75);
      let score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(55);
      mathRandomSpy.mockRestore();
      mathRandomSpy = null;

      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.25);
      score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(45);

      mathRandomSpy.mockRestore();
      mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
      score = ratingsEngine.generateAttributeScore(profile);
      expect(score).toBe(50);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('calculateFoalRatings', () => {
    beforeEach(() => {
      ratingsEngine = require('../ratingsEngine');
    });

    const createParentData = (
      conformationOverrides = {},
      gaitOverrides = {},
      isGaited = true
    ) => ({
      conformation: {
        head: 50,
        neck: 50,
        shoulders: 50,
        back: 50,
        hindquarters: 50,
        legs: 50,
        hooves: 50,
        ...conformationOverrides,
      },
      gaits: {
        walk: 50,
        trot: 50,
        canter: 50,
        gallop: 50,
        gaiting: isGaited ? 50 : null,
        ...gaitOverrides,
      },
    });

    const createFoalBreedProfile = (
      isGaited = true,
      conformationProfiles = {},
      gaitProfiles = {}
    ) => ({
      is_gaited_breed: isGaited,
      conformation: {
        head: { mean: 50, std_dev: 5 },
        neck: { mean: 50, std_dev: 5 } /* ...defaults... */,
        ...conformationProfiles,
      },
      gaits: {
        walk: { mean: 50, std_dev: 5 },
        trot: { mean: 50, std_dev: 5 } /* ...defaults... */,
        gaiting: isGaited ? { mean: 50, std_dev: 5 } : undefined,
        ...gaitProfiles,
      },
    });

    it('should produce ratings within valid range for all attributes', () => {
      const sire = createParentData();
      const dam = createParentData();
      const foalProfile = createFoalBreedProfile();
      const { conformationRatings, gaitRatings } =
        ratingsEngine.calculateFoalRatings(sire, dam, foalProfile);

      Object.values(conformationRatings).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(100);
      });
      Object.entries(gaitRatings).forEach(([key, score]) => {
        if (key === 'gaiting' && !foalProfile.is_gaited_breed) {
          expect(score).toBeNull();
        } else {
          expect(score).toBeGreaterThanOrEqual(1);
          expect(score).toBeLessThanOrEqual(100);
        }
      });
    });

    // Add more specific tests for calculateFoalRatings, potentially mocking Math.random
    // if its internal randomness needs to be controlled for predictable outcomes.
  });
});
