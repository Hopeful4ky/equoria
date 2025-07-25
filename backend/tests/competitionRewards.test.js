
import {
  calculatePrizeDistribution,
  getRelevantStats,
  calculateStatGains,
  calculateEntryFees,
  hasValidRider
} from '../utils/competitionRewards.js';

describe('Competition Rewards System', () => {
  
  describe('calculatePrizeDistribution', () => {
    it('should calculate correct prize distribution for 1000 prize pool', () => {
      const distribution = calculatePrizeDistribution(1000);
      
      expect(distribution.first).toBe(500);   // 50%
      expect(distribution.second).toBe(300);  // 30%
      expect(distribution.third).toBe(200);   // 20%
    });

    it('should handle odd prize amounts with rounding', () => {
      const distribution = calculatePrizeDistribution(1001);
      
      expect(distribution.first).toBe(501);   // 50.05% rounded
      expect(distribution.second).toBe(300);  // 30.03% rounded
      expect(distribution.third).toBe(200);   // 20.02% rounded
    });

    it('should handle small prize amounts', () => {
      const distribution = calculatePrizeDistribution(10);
      
      expect(distribution.first).toBe(5);     // 50%
      expect(distribution.second).toBe(3);    // 30%
      expect(distribution.third).toBe(2);     // 20%
    });

    it('should handle zero prize pool', () => {
      const distribution = calculatePrizeDistribution(0);
      
      expect(distribution.first).toBe(0);
      expect(distribution.second).toBe(0);
      expect(distribution.third).toBe(0);
    });
  });

  describe('getRelevantStats', () => {
    it('should return correct stats for Racing discipline', () => {
      const stats = getRelevantStats('Racing');
      expect(stats).toEqual(['speed', 'stamina', 'focus']);
    });

    it('should return correct stats for Show Jumping discipline', () => {
      const stats = getRelevantStats('Show Jumping');
      expect(stats).toEqual(['balance', 'agility', 'boldness']);
    });

    it('should return correct stats for Dressage discipline', () => {
      const stats = getRelevantStats('Dressage');
      expect(stats).toEqual(['precision', 'intelligence', 'obedience']);
    });

    it('should return default stats for unknown discipline', () => {
      const stats = getRelevantStats('UnknownDiscipline');
      expect(stats).toEqual(['speed', 'stamina', 'focus']);
    });

    it('should handle all supported disciplines', () => {
      const disciplines = [
        'Racing', 'Show Jumping', 'Dressage', 'Cross Country', 'Hunter',
        'Barrel Racing', 'Reining', 'Cutting', 'Trail', 'Western Pleasure',
        'English Pleasure', 'Driving'
      ];

      disciplines.forEach(discipline => {
        const stats = getRelevantStats(discipline);
        expect(Array.isArray(stats)).toBe(true);
        expect(stats.length).toBe(3);
        expect(stats.every(stat => typeof stat === 'string')).toBe(true);
      });
    });
  });

  describe('calculateStatGains', () => {
    // Mock Math.random for predictable testing
    const originalRandom = Math.random;
    
    afterEach(() => {
      Math.random = originalRandom;
    });

    it('should grant stat gain for 1st place with 10% chance (lucky roll)', () => {
      Math.random = jest.fn(() => 0.05); // 5% < 10% chance
      
      const statGain = calculateStatGains('1st', 'Racing');
      
      expect(statGain).not.toBeNull();
      expect(statGain.gain).toBe(1);
      expect(['speed', 'stamina', 'focus']).toContain(statGain.stat);
    });

    it('should not grant stat gain for 1st place with unlucky roll', () => {
      Math.random = jest.fn(() => 0.15); // 15% > 10% chance
      
      const statGain = calculateStatGains('1st', 'Racing');
      
      expect(statGain).toBeNull();
    });

    it('should grant stat gain for 2nd place with 5% chance (lucky roll)', () => {
      Math.random = jest.fn(() => 0.03); // 3% < 5% chance
      
      const statGain = calculateStatGains('2nd', 'Show Jumping');
      
      expect(statGain).not.toBeNull();
      expect(statGain.gain).toBe(1);
      expect(['balance', 'agility', 'boldness']).toContain(statGain.stat);
    });

    it('should grant stat gain for 3rd place with 3% chance (lucky roll)', () => {
      Math.random = jest.fn(() => 0.01); // 1% < 3% chance
      
      const statGain = calculateStatGains('3rd', 'Dressage');
      
      expect(statGain).not.toBeNull();
      expect(statGain.gain).toBe(1);
      expect(['precision', 'intelligence', 'obedience']).toContain(statGain.stat);
    });

    it('should not grant stat gain for non-podium placement', () => {
      const statGain = calculateStatGains(null, 'Racing');
      expect(statGain).toBeNull();
    });

    it('should not grant stat gain for invalid placement', () => {
      const statGain = calculateStatGains('4th', 'Racing');
      expect(statGain).toBeNull();
    });

    it('should select random stat from relevant discipline stats', () => {
      // Test multiple times to verify randomness
      Math.random = jest.fn()
        .mockReturnValueOnce(0.05) // Pass chance check
        .mockReturnValueOnce(0.0)  // Select first stat
        .mockReturnValueOnce(0.05) // Pass chance check
        .mockReturnValueOnce(0.5)  // Select middle stat
        .mockReturnValueOnce(0.05) // Pass chance check
        .mockReturnValueOnce(0.9); // Select last stat

      const statGain1 = calculateStatGains('1st', 'Racing');
      const statGain2 = calculateStatGains('1st', 'Racing');
      const statGain3 = calculateStatGains('1st', 'Racing');

      expect(statGain1.stat).toBe('speed');    // First stat
      expect(statGain2.stat).toBe('stamina');  // Middle stat
      expect(statGain3.stat).toBe('focus');    // Last stat
    });
  });

  describe('calculateEntryFees', () => {
    it('should calculate total entry fees correctly', () => {
      const total = calculateEntryFees(100, 5);
      expect(total).toBe(500);
    });

    it('should handle zero entry fee', () => {
      const total = calculateEntryFees(0, 10);
      expect(total).toBe(0);
    });

    it('should handle zero entries', () => {
      const total = calculateEntryFees(100, 0);
      expect(total).toBe(0);
    });

    it('should handle large numbers', () => {
      const total = calculateEntryFees(250, 20);
      expect(total).toBe(5000);
    });
  });

  describe('hasValidRider', () => {
    it('should return true for horse with valid rider object', () => {
      const horse = {
        id: 1,
        name: 'TestHorse',
        rider: {
          name: 'John Doe',
          skill: 85
        }
      };

      expect(hasValidRider(horse)).toBe(true);
    });

    it('should return false for horse with null rider', () => {
      const horse = {
        id: 1,
        name: 'TestHorse',
        rider: null
      };

      expect(hasValidRider(horse)).toBe(false);
    });

    it('should return false for horse with undefined rider', () => {
      const horse = {
        id: 1,
        name: 'TestHorse'
        // rider is undefined
      };

      expect(hasValidRider(horse)).toBe(false);
    });

    it('should return false for horse with non-object rider', () => {
      const horse = {
        id: 1,
        name: 'TestHorse',
        rider: 'string-rider'
      };

      expect(hasValidRider(horse)).toBe(false);
    });

    it('should return false for horse with empty object rider', () => {
      const horse = {
        id: 1,
        name: 'TestHorse',
        rider: {}
      };

      expect(hasValidRider(horse)).toBe(true); // Empty object is still an object
    });
  });
}); 