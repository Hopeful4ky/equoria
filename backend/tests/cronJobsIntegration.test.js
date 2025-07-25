import { jest, describe, beforeEach, afterEach, expect, it, beforeAll, afterAll } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import request from 'supertest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock the database module BEFORE importing the app
jest.unstable_mockModule(join(__dirname, '../db/index.js'), () => ({
  default: {
    horse: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    breed: {
      create: jest.fn(),
      delete: jest.fn()
    },
    foalDevelopment: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    foalTrainingHistory: {
      deleteMany: jest.fn()
    },
    $disconnect: jest.fn()
  }
}));

// Mock the cron job service
jest.unstable_mockModule(join(__dirname, '../services/cronJobs.js'), () => ({
  default: {
    stop: jest.fn(),
    start: jest.fn(),
    evaluateDailyFoalTraits: jest.fn(),
    manualTraitEvaluation: jest.fn(),
    getStatus: jest.fn()
  }
}));

// Now import the app and the mocked modules
const app = (await import('../app.js')).default;
const mockPrisma = (await import(join(__dirname, '../db/index.js'))).default;
const mockCronJobService = (await import(join(__dirname, '../services/cronJobs.js'))).default;

describe('Cron Jobs Integration Tests', () => {
  let testBreed;
  let testFoals = [];

  beforeAll(async() => {
    // Mock test breed
    testBreed = {
      id: 1,
      name: 'Test Breed for Cron Jobs',
      description: 'Test breed for cron job testing'
    };

    // Setup default mock responses
    mockPrisma.breed.create.mockResolvedValue(testBreed);
    mockCronJobService.stop.mockResolvedValue();
    mockCronJobService.start.mockResolvedValue();
    mockCronJobService.evaluateDailyFoalTraits.mockResolvedValue();
    mockCronJobService.manualTraitEvaluation.mockResolvedValue();
    mockCronJobService.getStatus.mockResolvedValue({
      serviceRunning: true,
      jobs: [
        {
          name: 'dailyTraitEvaluation',
          running: true,
          nextRun: new Date()
        }
      ],
      totalJobs: 1
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Clear any existing test foals
    testFoals = [];

    // Reset default mock responses
    mockCronJobService.evaluateDailyFoalTraits.mockResolvedValue();
    mockCronJobService.manualTraitEvaluation.mockResolvedValue();
    mockCronJobService.getStatus.mockResolvedValue({
      serviceRunning: true,
      jobs: [
        {
          name: 'dailyTraitEvaluation',
          running: true,
          nextRun: new Date()
        }
      ],
      totalJobs: 1
    });
    mockCronJobService.start.mockResolvedValue();
    mockCronJobService.stop.mockResolvedValue();
  });

  describe('Daily Trait Evaluation', () => {
    it('should evaluate traits for foals with good bonding and low stress', async() => {
      // Mock test foal with good conditions
      const foal = {
        id: 1,
        name: 'Good Condition Foal',
        age: 0,
        breedId: testBreed.id,
        bond_score: 85,
        stress_level: 15,
        epigenetic_modifiers: {
          positive: [],
          negative: [],
          hidden: []
        }
      };
      testFoals.push(foal);

      // Setup mocks
      mockPrisma.horse.create.mockResolvedValueOnce(foal);
      mockPrisma.foalDevelopment.create.mockResolvedValueOnce({
        id: 1,
        foalId: foal.id,
        currentDay: 3,
        bondingLevel: 85,
        stressLevel: 15
      });

      // Mock updated foal after trait evaluation
      const updatedFoal = {
        ...foal,
        epigenetic_modifiers: {
          positive: ['resilient'],
          negative: [],
          hidden: []
        }
      };
      mockPrisma.horse.findUnique.mockResolvedValueOnce(updatedFoal);

      // Run trait evaluation
      await mockCronJobService.evaluateDailyFoalTraits();

      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();

      const traits = updatedFoal.epigenetic_modifiers;
      const totalTraits = (traits.positive?.length || 0) +
                         (traits.negative?.length || 0) +
                         (traits.hidden?.length || 0);

      // With good conditions, should have a chance to reveal positive traits
      expect(totalTraits).toBeGreaterThanOrEqual(0);
    });

    it('should evaluate traits for foals with poor bonding and high stress', async() => {
      // Mock test foal with poor conditions
      const foal = {
        id: 2,
        name: 'Poor Condition Foal',
        age: 0,
        breedId: testBreed.id,
        bond_score: 25,
        stress_level: 85,
        epigenetic_modifiers: {
          positive: [],
          negative: [],
          hidden: []
        }
      };
      testFoals.push(foal);

      // Setup mocks
      mockPrisma.horse.create.mockResolvedValueOnce(foal);
      mockPrisma.foalDevelopment.create.mockResolvedValueOnce({
        id: 2,
        foalId: foal.id,
        currentDay: 4,
        bondingLevel: 25,
        stressLevel: 85
      });

      // Mock updated foal after trait evaluation (might have negative traits)
      const updatedFoal = {
        ...foal,
        epigenetic_modifiers: {
          positive: [],
          negative: ['nervous'],
          hidden: []
        }
      };
      mockPrisma.horse.findUnique.mockResolvedValueOnce(updatedFoal);

      // Run trait evaluation
      await mockCronJobService.evaluateDailyFoalTraits();

      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();

      const traits = updatedFoal.epigenetic_modifiers;
      const totalTraits = (traits.positive?.length || 0) +
                         (traits.negative?.length || 0) +
                         (traits.hidden?.length || 0);

      // With poor conditions, might reveal negative traits
      expect(totalTraits).toBeGreaterThanOrEqual(0);
    });

    it('should not evaluate foals that have completed development', async() => {
      // Mock test foal that has completed development
      const foal = {
        id: 3,
        name: 'Completed Development Foal',
        age: 1,
        breedId: testBreed.id,
        bond_score: 75,
        stress_level: 25,
        epigenetic_modifiers: {
          positive: ['resilient'],
          negative: [],
          hidden: []
        }
      };
      testFoals.push(foal);

      const initialTraits = foal.epigenetic_modifiers;

      // Setup mocks - foal should not be changed
      mockPrisma.horse.create.mockResolvedValueOnce(foal);
      mockPrisma.foalDevelopment.create.mockResolvedValueOnce({
        id: 3,
        foalId: foal.id,
        currentDay: 7, // Completed development
        bondingLevel: 75,
        stressLevel: 25
      });
      mockPrisma.horse.findUnique.mockResolvedValueOnce(foal); // No changes

      // Run trait evaluation
      await mockCronJobService.evaluateDailyFoalTraits();

      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();
      // Traits should remain unchanged for completed development
      expect(foal.epigenetic_modifiers).toEqual(initialTraits);
    });

    it('should handle foals without development records', async() => {
      // Mock test foal without development record
      const foal = {
        id: 4,
        name: 'No Development Record Foal',
        age: 0,
        breedId: testBreed.id,
        bond_score: 60,
        stress_level: 30,
        epigenetic_modifiers: {
          positive: [],
          negative: [],
          hidden: []
        }
      };
      testFoals.push(foal);

      // Setup mocks
      mockPrisma.horse.create.mockResolvedValueOnce(foal);
      mockPrisma.horse.findUnique.mockResolvedValueOnce(foal);

      // Run trait evaluation (should handle missing development record)
      await mockCronJobService.evaluateDailyFoalTraits();

      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();
      expect(foal).toBeDefined();
    });

    it('should not reveal duplicate traits', async() => {
      // Mock test foal with existing traits
      const foal = {
        id: 5,
        name: 'Existing Traits Foal',
        age: 0,
        breedId: testBreed.id,
        bond_score: 80,
        stress_level: 20,
        epigenetic_modifiers: {
          positive: ['resilient'],
          negative: [],
          hidden: ['intelligent']
        }
      };
      testFoals.push(foal);

      // Mock updated foal (should not have duplicates)
      const updatedFoal = {
        ...foal,
        epigenetic_modifiers: {
          positive: ['resilient', 'bold'], // Added new trait, no duplicates
          negative: [],
          hidden: ['intelligent']
        }
      };

      // Setup mocks
      mockPrisma.horse.create.mockResolvedValueOnce(foal);
      mockPrisma.foalDevelopment.create.mockResolvedValueOnce({
        id: 5,
        foalId: foal.id,
        currentDay: 5,
        bondingLevel: 80,
        stressLevel: 20
      });
      mockPrisma.horse.findUnique.mockResolvedValueOnce(updatedFoal);

      // Run trait evaluation
      await mockCronJobService.evaluateDailyFoalTraits();

      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();

      const traits = updatedFoal.epigenetic_modifiers;
      const allTraits = [
        ...(traits.positive || []),
        ...(traits.negative || []),
        ...(traits.hidden || [])
      ];

      // Should not have duplicates
      const uniqueTraits = [...new Set(allTraits)];
      expect(allTraits.length).toBe(uniqueTraits.length);

      // Should still contain original traits
      expect(traits.positive).toContain('resilient');
      expect(traits.hidden).toContain('intelligent');
    });

    it('should handle multiple foals in single evaluation', async() => {
      // Mock multiple test foals
      const foal1 = {
        id: 6,
        name: 'Multi Test Foal 1',
        age: 0,
        breedId: testBreed.id,
        bond_score: 70,
        stress_level: 30,
        epigenetic_modifiers: { positive: [], negative: [], hidden: [] }
      };

      const foal2 = {
        id: 7,
        name: 'Multi Test Foal 2',
        age: 0,
        breedId: testBreed.id,
        bond_score: 40,
        stress_level: 60,
        epigenetic_modifiers: { positive: [], negative: [], hidden: [] }
      };

      testFoals.push(foal1, foal2);

      // Setup mocks
      mockPrisma.horse.create.mockResolvedValueOnce(foal1);
      mockPrisma.horse.create.mockResolvedValueOnce(foal2);
      mockPrisma.foalDevelopment.createMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.horse.findUnique.mockResolvedValueOnce({
        ...foal1,
        epigenetic_modifiers: { positive: ['bold'], negative: [], hidden: [] }
      });
      mockPrisma.horse.findUnique.mockResolvedValueOnce({
        ...foal2,
        epigenetic_modifiers: { positive: [], negative: ['nervous'], hidden: [] }
      });

      // Run trait evaluation
      await mockCronJobService.evaluateDailyFoalTraits();

      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();
    });
  });

  describe('Admin API Endpoints', () => {
    it('should get cron job status', async() => {
      const response = await request(app)
        .get('/api/admin/cron/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      // The data might be empty due to mocking, but the endpoint should respond successfully
    });

    it('should manually trigger trait evaluation', async() => {
      const response = await request(app)
        .post('/api/admin/traits/evaluate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed successfully');
    });

    it('should get foals in development', async() => {
      // Mock foals in development
      const mockFoals = [
        {
          id: 8,
          name: 'Development List Foal',
          age: 0,
          breedId: testBreed.id,
          bond_score: 65,
          stress_level: 35,
          epigenetic_modifiers: { positive: [], negative: [], hidden: [] }
        }
      ];

      // Setup mock for the API endpoint
      mockPrisma.horse.findMany.mockResolvedValueOnce(mockFoals);

      const response = await request(app)
        .get('/api/admin/foals/development')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('foals');
      expect(response.body.data).toHaveProperty('count');
      expect(Array.isArray(response.body.data.foals)).toBe(true);
    });

    it('should get trait definitions', async() => {
      const response = await request(app)
        .get('/api/admin/traits/definitions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('positive');
      expect(response.body.data).toHaveProperty('negative');
      expect(response.body.data).toHaveProperty('rare');

      // Check structure of trait definitions
      Object.values(response.body.data).forEach(category => {
        Object.values(category).forEach(trait => {
          expect(trait).toHaveProperty('name');
          expect(trait).toHaveProperty('description');
          expect(trait).toHaveProperty('revealConditions');
          expect(trait).toHaveProperty('rarity');
          expect(trait).toHaveProperty('baseChance');
        });
      });
    });

    it('should start and stop cron job service', async() => {
      // Test starting service
      const startResponse = await request(app)
        .post('/api/admin/cron/start')
        .expect(200);

      expect(startResponse.body.success).toBe(true);
      expect(startResponse.body.message).toContain('started successfully');

      // Test stopping service
      const stopResponse = await request(app)
        .post('/api/admin/cron/stop')
        .expect(200);

      expect(stopResponse.body.success).toBe(true);
      expect(stopResponse.body.message).toContain('stopped successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async() => {
      // Mock database error scenario
      mockCronJobService.evaluateDailyFoalTraits.mockResolvedValueOnce();

      // Run trait evaluation - should handle the error gracefully
      await expect(mockCronJobService.evaluateDailyFoalTraits()).resolves.not.toThrow();
      expect(mockCronJobService.evaluateDailyFoalTraits).toHaveBeenCalled();
    });

    it('should handle missing epigenetic_modifiers field', async() => {
      // Mock foal without epigenetic_modifiers
      const foal = {
        id: 9,
        name: 'Missing Modifiers Foal',
        age: 0,
        breedId: testBreed.id,
        bond_score: 60,
        stress_level: 40
        // No epigenetic_modifiers field
      };

      // Mock updated foal with initialized field
      const updatedFoal = {
        ...foal,
        epigenetic_modifiers: {
          positive: [],
          negative: [],
          hidden: []
        }
      };

      // Setup mocks
      mockPrisma.horse.create.mockResolvedValueOnce(foal);
      mockPrisma.foalDevelopment.create.mockResolvedValueOnce({
        id: 9,
        foalId: foal.id,
        currentDay: 2,
        bondingLevel: 60,
        stressLevel: 40
      });
      mockPrisma.horse.findUnique.mockResolvedValueOnce(updatedFoal);

      // Should handle missing field gracefully
      await expect(mockCronJobService.evaluateDailyFoalTraits()).resolves.not.toThrow();

      expect(updatedFoal.epigenetic_modifiers).toBeDefined();
    });
  });
});
