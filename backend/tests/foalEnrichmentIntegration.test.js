import { jest, describe, beforeEach, expect, it, beforeAll } from '@jest/globals';
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
      update: jest.fn(),
      delete: jest.fn()
    },
    breed: {
      create: jest.fn(),
      delete: jest.fn()
    },
    foalTrainingHistory: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn()
    },
    $disconnect: jest.fn()
  }
}));

// Now import the app and the mocked prisma
const app = (await import('../app.js')).default;
const mockPrisma = (await import(join(__dirname, '../db/index.js'))).default;

describe('Foal Enrichment API Integration Tests', () => {
  let testFoal;
  let testBreed;

  beforeAll(async() => {
    // Mock test breed
    testBreed = {
      id: 1,
      name: 'Test Breed for Enrichment',
      description: 'Test breed for foal enrichment testing'
    };

    // Mock test foal
    testFoal = {
      id: 1,
      name: 'Test Enrichment Foal',
      age: 0,
      breedId: testBreed.id,
      bond_score: 50,
      stress_level: 20
    };

    // Setup default mock responses
    mockPrisma.breed.create.mockResolvedValue(testBreed);
    mockPrisma.horse.create.mockResolvedValue(testFoal);
    mockPrisma.horse.findUnique.mockResolvedValue(testFoal);
    mockPrisma.foalTrainingHistory.create.mockResolvedValue({
      id: 'test-training-id',
      horse_id: testFoal.id,
      day: 3,
      activity: 'Trailer Exposure',
      outcome: 'success',
      bond_change: 5,
      stress_change: 2,
      timestamp: new Date()
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Reset default mock responses
    mockPrisma.horse.findUnique.mockResolvedValue(testFoal);
    mockPrisma.horse.update.mockResolvedValue({
      ...testFoal,
      bond_score: 55,
      stress_level: 22
    });

    // Ensure foalTrainingHistory.create always returns a valid object
    mockPrisma.foalTrainingHistory.create.mockResolvedValue({
      id: 'test-training-id',
      horse_id: testFoal.id,
      day: 3,
      activity: 'Test Activity',
      outcome: 'success',
      bond_change: 5,
      stress_change: 2,
      timestamp: new Date()
    });
  });

  describe('POST /api/foals/:foalId/enrichment', () => {
    it('should complete enrichment activity successfully', async() => {
      const response = await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: 'Trailer Exposure'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Trailer Exposure');
      expect(response.body.data).toHaveProperty('foal');
      expect(response.body.data).toHaveProperty('activity');
      expect(response.body.data).toHaveProperty('updated_levels');
      expect(response.body.data).toHaveProperty('changes');
      expect(response.body.data).toHaveProperty('training_record_id');

      // Verify foal data
      expect(response.body.data.foal.id).toBe(testFoal.id);
      expect(response.body.data.foal.name).toBe(testFoal.name);

      // Verify activity data
      expect(response.body.data.activity.name).toBe('Trailer Exposure');
      expect(response.body.data.activity.day).toBe(3);
      expect(response.body.data.activity.outcome).toMatch(/success|excellent|challenging/);

      // Verify levels are within bounds
      expect(response.body.data.updated_levels.bond_score).toBeGreaterThanOrEqual(0);
      expect(response.body.data.updated_levels.bond_score).toBeLessThanOrEqual(100);
      expect(response.body.data.updated_levels.stress_level).toBeGreaterThanOrEqual(0);
      expect(response.body.data.updated_levels.stress_level).toBeLessThanOrEqual(100);

      // Verify changes are reported
      expect(response.body.data.changes).toHaveProperty('bond_change');
      expect(response.body.data.changes).toHaveProperty('stress_change');

      // Verify training record was created
      expect(mockPrisma.foalTrainingHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          horse_id: testFoal.id,
          day: 3,
          activity: 'Trailer Exposure'
        })
      });
    });

    it('should update horse bond_score and stress_level in database', async() => {
      // Setup mock for initial horse state
      mockPrisma.horse.findUnique.mockResolvedValueOnce({
        ...testFoal,
        bond_score: 50,
        stress_level: 20
      });

      // Setup mock for updated horse state
      mockPrisma.horse.update.mockResolvedValueOnce({
        ...testFoal,
        bond_score: 55,
        stress_level: 22
      });

      const response = await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: 'Halter Introduction'
        })
        .expect(200);

      // Verify horse was updated in database
      expect(mockPrisma.horse.update).toHaveBeenCalledWith({
        where: { id: testFoal.id },
        data: expect.objectContaining({
          bond_score: expect.any(Number),
          stress_level: expect.any(Number)
        })
      });

      // Verify response contains updated levels
      expect(response.body.data.updated_levels).toHaveProperty('bond_score');
      expect(response.body.data.updated_levels).toHaveProperty('stress_level');
    });

    it('should validate request parameters', async() => {
      // Missing day
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          activity: 'Trailer Exposure'
        })
        .expect(400);

      // Missing activity
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3
        })
        .expect(400);

      // Invalid day (too high)
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 7,
          activity: 'Trailer Exposure'
        })
        .expect(400);

      // Invalid day (negative)
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: -1,
          activity: 'Trailer Exposure'
        })
        .expect(400);

      // Empty activity
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: ''
        })
        .expect(400);
    });

    it('should return 404 for non-existent foal', async() => {
      // Setup mock to return null for non-existent foal
      mockPrisma.horse.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/foals/99999/enrichment')
        .send({
          day: 3,
          activity: 'Trailer Exposure'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for inappropriate activity for day', async() => {
      const response = await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 0,
          activity: 'Trailer Exposure' // This is a day 3 activity
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not appropriate for day 0');
    });

    it('should accept different activity name formats', async() => {
      // Test exact type
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: 'leading_practice'
        })
        .expect(200);

      // Test exact name
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: 'Leading Practice'
        })
        .expect(200);

      // Test case insensitive
      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: 'HANDLING EXERCISES'
        })
        .expect(200);
    });

    it('should handle all day 3 activities', async() => {
      const day3Activities = [
        'Halter Introduction',
        'Leading Practice',
        'Handling Exercises',
        'Trailer Exposure'
      ];

      for (const activity of day3Activities) {
        const response = await request(app)
          .post(`/api/foals/${testFoal.id}/enrichment`)
          .send({
            day: 3,
            activity
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.activity.name).toBe(activity);
        expect(response.body.data.activity.day).toBe(3);
      }
    });

    it('should create training history records for each activity', async() => {
      // Setup mock for initial count
      mockPrisma.foalTrainingHistory.count.mockResolvedValueOnce(5);

      // Setup mock for training record creation
      mockPrisma.foalTrainingHistory.create.mockResolvedValueOnce({
        id: 'test-training-record',
        horse_id: testFoal.id,
        day: 1,
        activity: 'Feeding Assistance',
        outcome: 'success',
        bond_change: 6,
        stress_change: 1,
        timestamp: new Date()
      });

      await request(app)
        .post(`/api/foals/${testFoal.id}/enrichment`)
        .send({
          day: 1,
          activity: 'Feeding Assistance'
        })
        .expect(200);

      // Verify training record was created
      expect(mockPrisma.foalTrainingHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          horse_id: testFoal.id,
          day: 1,
          activity: 'Feeding Assistance',
          outcome: expect.stringMatching(/success|excellent|challenging/),
          bond_change: expect.any(Number),
          stress_change: expect.any(Number)
        })
      });
    });

    it('should handle edge cases with bond and stress levels', async() => {
      // Mock a foal with extreme values
      const extremeFoal = {
        id: 999,
        name: 'Extreme Test Foal',
        age: 0,
        breedId: testBreed.id,
        bond_score: 95,
        stress_level: 5
      };

      // Setup mock to return extreme foal
      mockPrisma.horse.findUnique.mockResolvedValueOnce(extremeFoal);

      // Setup mock for updated extreme foal (values should be capped)
      mockPrisma.horse.update.mockResolvedValueOnce({
        ...extremeFoal,
        bond_score: 100, // Capped at maximum
        stress_level: 0   // Capped at minimum
      });

      const response = await request(app)
        .post(`/api/foals/${extremeFoal.id}/enrichment`)
        .send({
          day: 3,
          activity: 'Trailer Exposure'
        })
        .expect(200);

      // Values should be capped at bounds
      expect(response.body.data.updated_levels.bond_score).toBeLessThanOrEqual(100);
      expect(response.body.data.updated_levels.stress_level).toBeGreaterThanOrEqual(0);
    });
  });
});
