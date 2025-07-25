import { jest, describe, beforeEach, afterEach, expect, it } from '@jest/globals';
/**
 * Leaderboard Controller Unit Tests
 * Tests all leaderboard functionality including rankings and statistics
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock the database module BEFORE importing the controller
jest.unstable_mockModule(join(__dirname, '../db/index.js'), () => ({
  default: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn()
    },
    horse: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn()
    },
    competitionResult: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn()
    },
    xpEvent: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn()
    },
    breed: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    show: {
      count: jest.fn()
    },
    $disconnect: jest.fn()
  }
}));

// Mock logger
jest.unstable_mockModule(join(__dirname, '../utils/logger.js'), () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Now import the controller and mocked modules
const {
  getTopUsersByLevel, // Renamed from getTopPlayersByLevel
  getTopUsersByXP, // Renamed from getTopPlayersByXP
  getTopHorsesByEarnings,
  getTopHorsesByPerformance,
  getTopUsersByHorseEarnings, // Renamed from getTopPlayersByHorseEarnings
  getRecentWinners,
  getLeaderboardStats
} = await import('../controllers/leaderboardController.js');

const mockPrisma = (await import(join(__dirname, '../db/index.js'))).default;

describe('Leaderboard Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request and response objects
    mockReq = {
      query: {},
      user: { id: 'test-user-1' } // Changed from 'test-player-1' for consistency
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getTopPlayersByLevel', () => { // Test description can remain for now, or be updated
    const mockUsers = [ // Renamed from mockPlayers
      {
        id: 'user-1', // Changed from 'player-1'
        name: 'TopUser1', // Changed from 'TopPlayer1'
        level: 10,
        xp: 50,
        money: 5000
      },
      {
        id: 'user-2', // Changed from 'player-2'
        name: 'TopUser2', // Changed from 'TopPlayer2'
        level: 9,
        xp: 80,
        money: 4500
      },
      {
        id: 'user-3', // Changed from 'player-3'
        name: 'TopUser3', // Changed from 'TopPlayer3'
        level: 9,
        xp: 60,
        money: 4000
      }
    ];

    it('should return top players ranked by level and XP', async() => {
      mockPrisma.user.findMany.mockResolvedValue(mockUsers); // Changed from mockPlayers

      await getTopUsersByLevel(mockReq, mockRes); // Use the new function name

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          level: true,
          xp: true,
          money: true
        },
        orderBy: [
          { level: 'desc' },
          { xp: 'desc' }
        ],
        take: 10,
        skip: 0
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Top users by level retrieved successfully', // Message in controller is 'Top users by level retrieved successfully'
        data: {
          users: [ // Controller uses 'users' key in response data
            {
              rank: 1,
              userId: 'user-1', // Changed from playerId
              name: 'TopUser1', // Changed from TopPlayer1
              level: 10,
              xp: 50,
              xpToNext: 50,
              money: 5000,
              totalXp: 950
            },
            {
              rank: 2,
              userId: 'user-2', // Changed from playerId
              name: 'TopUser2', // Changed from TopPlayer2
              level: 9,
              xp: 80,
              xpToNext: 20,
              money: 4500,
              totalXp: 880
            },
            {
              rank: 3,
              userId: 'user-3', // Changed from playerId
              name: 'TopUser3', // Changed from TopPlayer3
              level: 9,
              xp: 60,
              xpToNext: 40,
              money: 4000,
              totalXp: 860
            }
          ],
          pagination: {
            limit: 10,
            offset: 0,
            total: 3,
            hasMore: false
          }
        }
      });
    });

    it('should handle pagination parameters', async() => {
      mockReq.query = { limit: '5', offset: '10' };
      mockPrisma.user.findMany.mockResolvedValue([]);

      await getTopUsersByLevel(mockReq, mockRes); // Use the new function name

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10
        })
      );
    });

    it('should handle database errors', async() => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await getTopUsersByLevel(mockReq, mockRes); // Use the new function name

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve user level leaderboard' // Message in controller
      });
    });
  });

  describe('getTopPlayersByXP', () => { // Test description can remain for now
    const mockXpData = [
      {
        userId: 'user-1', // Changed from playerId
        user: { name: 'XPUser1' }, // Changed from player and XPPlayer1
        _sum: { amount: 500 }
      },
      {
        userId: 'user-2', // Changed from playerId
        user: { name: 'XPUser2' }, // Changed from player and XPPlayer2
        _sum: { amount: 400 }
      }
    ];

    it('should return top players by XP for all time', async() => {
      mockReq.query = { period: 'all' };
      mockPrisma.xpEvent.groupBy.mockResolvedValue(mockXpData);

      await getTopUsersByXP(mockReq, mockRes); // Use the new function name

      expect(mockPrisma.xpEvent.groupBy).toHaveBeenCalledWith({
        by: ['userId'], // Changed from playerId
        _sum: { amount: true },
        include: {
          user: { // Changed from player
            select: { name: true }
          }
        },
        orderBy: {
          _sum: { amount: 'desc' }
        },
        take: 10,
        skip: 0
      });
    });

    it('should filter by time period', async() => {
      mockReq.query = { period: 'week' };
      mockPrisma.xpEvent.groupBy.mockResolvedValue(mockXpData);

      await getTopUsersByXP(mockReq, mockRes); // Use the new function name

      expect(mockPrisma.xpEvent.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: {
              gte: expect.any(Date)
            }
          }
        })
      );
    });
  });

  describe('getTopHorsesByEarnings', () => {
    const mockHorses = [
      {
        id: 1,
        name: 'EarningHorse1',
        total_earnings: 10000,
        userId: 'user-1', // Changed from playerId
        user: { name: 'Owner1' }, // Changed from player
        breed: { name: 'Thoroughbred' }
      },
      {
        id: 2,
        name: 'EarningHorse2',
        total_earnings: 8000,
        userId: 'user-2', // Changed from playerId
        user: { name: 'Owner2' }, // Changed from player
        breed: { name: 'Arabian' }
      }
    ];

    it('should return top horses by earnings', async() => {
      mockPrisma.horse.findMany.mockResolvedValue(mockHorses);

      await getTopHorsesByEarnings(mockReq, mockRes);

      expect(mockPrisma.horse.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          total_earnings: true,
          userId: true, // Changed from playerId
          user: { // Changed from player
            select: { name: true }
          },
          breed: {
            select: { name: true }
          }
        },
        where: {
          total_earnings: { gt: 0 }
        },
        orderBy: { total_earnings: 'desc' },
        take: 10,
        skip: 0
      });
    });

    it('should filter by breed', async() => {
      mockReq.query = { breed: 'Thoroughbred' };
      mockPrisma.horse.findMany.mockResolvedValue(mockHorses);

      await getTopHorsesByEarnings(mockReq, mockRes);

      expect(mockPrisma.horse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            total_earnings: { gt: 0 },
            breed: { name: 'Thoroughbred' }
          }
        })
      );
    });
  });

  describe('getTopHorsesByPerformance', () => {
    const mockPerformanceData = [
      {
        horseId: 1,
        horse: {
          name: 'PerformHorse1',
          user: { name: 'Owner1' }, // Changed from player
          breed: { name: 'Thoroughbred' }
        },
        _count: { id: 5 }
      }
    ];

    it('should return top horses by wins', async() => {
      mockReq.query = { metric: 'wins' };
      mockPrisma.competitionResult.groupBy.mockResolvedValue(mockPerformanceData);

      await getTopHorsesByPerformance(mockReq, mockRes);

      expect(mockPrisma.competitionResult.groupBy).toHaveBeenCalledWith({
        by: ['horseId'],
        _count: { id: true },
        where: { placement: '1st' },
        include: {
          horse: {
            select: {
              name: true,
              user: { select: { name: true } }, // Changed from player
              breed: { select: { name: true } }
            }
          }
        },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
        skip: 0
      });
    });

    it('should filter by discipline', async() => {
      mockReq.query = { discipline: 'Dressage' };
      mockPrisma.competitionResult.groupBy.mockResolvedValue(mockPerformanceData);

      await getTopHorsesByPerformance(mockReq, mockRes);

      expect(mockPrisma.competitionResult.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            placement: '1st',
            discipline: 'Dressage'
          }
        })
      );
    });
  });

  describe('getTopPlayersByHorseEarnings', () => { // Test description can remain
    const mockPlayerEarnings = [
      {
        userId: 'user-1', // Changed from playerId
        user: { name: 'EarningUser1' }, // Changed from player and EarningPlayer1
        _sum: { total_earnings: 25000 },
        _count: { id: 3 }
      }
    ];

    it('should return top players by combined horse earnings', async() => {
      mockPrisma.horse.groupBy.mockResolvedValue(mockPlayerEarnings);

      await getTopUsersByHorseEarnings(mockReq, mockRes); // Use the new function name

      expect(mockPrisma.horse.groupBy).toHaveBeenCalledWith({
        by: ['userId'], // Changed from playerId
        _sum: { total_earnings: true },
        _count: { id: true },
        include: {
          user: { // Changed from player
            select: { name: true }
          }
        },
        where: {
          total_earnings: { gt: 0 }
        },
        orderBy: {
          _sum: { total_earnings: 'desc' }
        },
        take: 10,
        skip: 0
      });
    });
  });

  describe('getRecentWinners', () => {
    const mockRecentWinners = [
      {
        id: 1,
        horse: {
          name: 'WinnerHorse1',
          user: { name: 'WinnerOwner1' } // Changed from player
        },
        showName: 'Test Show 1',
        discipline: 'Dressage',
        placement: '1st',
        prizeWon: 1000,
        competedAt: new Date()
      }
    ];

    it('should return recent winners', async() => {
      mockPrisma.competitionResult.findMany.mockResolvedValue(mockRecentWinners);

      await getRecentWinners(mockReq, mockRes);

      expect(mockPrisma.competitionResult.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          horse: {
            select: {
              name: true,
              user: { // Changed from player
                select: { name: true }
              }
            }
          },
          showName: true,
          discipline: true,
          placement: true,
          prizeWon: true,
          competedAt: true
        },
        where: {
          placement: { in: ['1st', '2nd', '3rd'] }
        },
        orderBy: { competedAt: 'desc' },
        take: 20
      });
    });

    it('should filter by discipline', async() => {
      mockReq.query = { discipline: 'Jumping' };
      mockPrisma.competitionResult.findMany.mockResolvedValue(mockRecentWinners);

      await getRecentWinners(mockReq, mockRes);

      expect(mockPrisma.competitionResult.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            placement: { in: ['1st', '2nd', '3rd'] },
            discipline: 'Jumping'
          }
        })
      );
    });
  });

  describe('getLeaderboardStats', () => {
    const mockStats = {
      playerCount: 100, // Will need to check if controller returns 'userCount' or 'playerCount'
      horseCount: 250,
      showCount: 50,
      totalEarnings: 500000,
      totalXp: 1000000,
      avgLevel: 5.5
    };

    beforeEach(() => {
      mockPrisma.user.count.mockResolvedValue(mockStats.playerCount); // user.count is correct
      mockPrisma.horse.count.mockResolvedValue(mockStats.horseCount);
      mockPrisma.show.count.mockResolvedValue(mockStats.showCount);
      mockPrisma.horse.aggregate.mockResolvedValue({
        _sum: { total_earnings: mockStats.totalEarnings }
      });
      mockPrisma.xpEvent.aggregate.mockResolvedValue({
        _sum: { amount: mockStats.totalXp }
      });
      mockPrisma.user.aggregate.mockResolvedValue({
        _avg: { level: mockStats.avgLevel }
      });
    });

    it('should return comprehensive leaderboard statistics', async() => {
      await getLeaderboardStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Leaderboard statistics retrieved successfully',
        data: {
          userCount: mockStats.playerCount, // Controller returns userCount
          horseCount: mockStats.horseCount,
          showCount: mockStats.showCount,
          totalEarnings: mockStats.totalEarnings,
          totalXp: mockStats.totalXp,
          averageUserLevel: mockStats.avgLevel // Controller returns averageUserLevel
        }
      });
    });

    it('should handle database errors for stats', async() => {
      mockPrisma.user.count.mockRejectedValue(new Error('Stats error'));

      await getLeaderboardStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve leaderboard statistics'
      });
    });
  });
});
