const { registerUser, loginUser, verifyToken } = require('../../route/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Authentication Functions', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    jest.clearAllMocks();
    jest.spyOn(bcrypt, 'hash').mockImplementation(async (password, _salt) => `hashed-${password}`);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async (password, hash) => password === hash.replace('hashed-', ''));
    jest.spyOn(jwt, 'sign').mockImplementation(() => 'mockToken');
    jest.spyOn(jwt, 'verify').mockImplementation(() => ({
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
    }));
  });

  afterEach(async () => {
    await pool.end();
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user and return user data', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password123',
      };
      pool.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const result = await registerUser('testuser', 'test@example.com', 'password123');

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
    });

    it('should throw an error if email already exists', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
        rowCount: 1,
      });

      await expect(registerUser('testuser', 'test@example.com', 'password123')).rejects.toThrow(
        'User with this email already exists'
      );
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('loginUser', () => {
    it('should log in a user and return a JWT token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password123',
      };
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const result = await loginUser('test@example.com', 'password123');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, email, password_hash FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password_hash);
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { id: 1, username: 'testuser', email: 'test@example.com' } },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(result).toEqual({
        token: 'mockToken',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
      });
    });

    it('should throw an error if user does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(loginUser('test@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw an error if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-wrongpassword',
      };
      pool.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      await expect(loginUser('test@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return user data', async () => {
      const result = await verifyToken('validToken');

      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
      expect(result).toEqual({
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
      });
    });

    it('should throw an error for an invalid token', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(verifyToken('invalidToken')).rejects.toThrow('Invalid token');
    });
  });
});