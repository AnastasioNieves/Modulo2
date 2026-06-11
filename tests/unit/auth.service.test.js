jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('../../src/utils/password');

const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const { hashPassword, comparePassword } = require('../../src/utils/password');
const authService = require('../../src/services/auth.service');
const ApiError = require('../../src/utils/apiError');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new profesor when no role is provided', async () => {
    hashPassword.mockResolvedValue('hashed');
    User.exists.mockResolvedValue(false);
    User.create.mockResolvedValue({
      _id: '123',
      email: 'test@aprentic.test',
      role: 'profesor',
      profesor: null,
      alumno: null,
      toString() {
        return this._id;
      }
    });
    jwt.sign.mockReturnValue('token123');

    const result = await authService.register({ email: 'test@aprentic.test', password: 'Password123!' });

    expect(hashPassword).toHaveBeenCalledWith('Password123!');
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@aprentic.test', role: 'profesor' }));
    expect(result.token).toBe('token123');
    expect(result.user).toEqual({ id: '123', email: 'test@aprentic.test', role: 'profesor', profesor: null, alumno: null });
  });

  it('throws when registering a second admin', async () => {
    hashPassword.mockResolvedValue('hashed');
    User.exists.mockResolvedValue(true);

    await expect(authService.register({ email: 'admin@aprentic.test', password: 'Password123!', role: 'admin' })).rejects.toMatchObject({ statusCode: 403 });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('logs in a valid active user', async () => {
    const mockUser = {
      _id: 'abc',
      email: 'login@aprentic.test',
      role: 'admin',
      isActive: true,
      passwordHash: 'hash',
      lastLoginAt: null,
      save: jest.fn().mockResolvedValue(true)
    };

    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    comparePassword.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token-login');

    const result = await authService.login('login@aprentic.test', 'Password123!');

    expect(User.findOne).toHaveBeenCalledWith({ email: 'login@aprentic.test' });
    expect(comparePassword).toHaveBeenCalledWith('Password123!', 'hash');
    expect(mockUser.save).toHaveBeenCalled();
    expect(result.user).toEqual({ id: 'abc', email: 'login@aprentic.test', role: 'admin', profesor: undefined, alumno: undefined });
    expect(result.token).toBe('token-login');
  });

  it('throws invalid credentials if user is inactive', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ isActive: false }) });
    await expect(authService.login('x@aprentic.test', 'pass')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws invalid credentials when password mismatch', async () => {
    const mockUser = { isActive: true, passwordHash: 'hash' };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    comparePassword.mockResolvedValue(false);

    await expect(authService.login('x@aprentic.test', 'pass')).rejects.toMatchObject({ statusCode: 401 });
  });
});
