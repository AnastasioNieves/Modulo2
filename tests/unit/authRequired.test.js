jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const authRequired = require('../../src/middlewares/authRequired');
const ApiError = require('../../src/utils/apiError');

describe('authRequired middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when Bearer token is missing', async () => {
    const next = jest.fn();
    const req = { headers: {} };

    await authRequired(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toContain('JWT requerido');
  });

  it('returns 401 when JWT verification fails', async () => {
    const next = jest.fn();
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const error = new Error('invalid token');
    error.name = 'JsonWebTokenError';

    jwt.verify.mockImplementation(() => { throw error; });

    await authRequired(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toContain('JWT invalido');
  });

  it('returns 401 when user is not found or inactive', async () => {
    const next = jest.fn();
    const req = { headers: { authorization: 'Bearer validtoken' } };

    jwt.verify.mockReturnValue({ sub: 'user123' });
    const leanMock = jest.fn().mockResolvedValue(null);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    User.findById.mockReturnValue({ select: selectMock });

    await authRequired(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toContain('Usuario no autorizado');
  });

  it('attaches user data to req and calls next when token and user are valid', async () => {
    const next = jest.fn();
    const req = { headers: { authorization: 'Bearer validtoken' } };

    jwt.verify.mockReturnValue({ sub: 'user123' });
    const userDoc = {
      _id: 'user123',
      email: 'test@aprentic.test',
      role: 'admin',
      isActive: true,
      profesor: null,
      alumno: null
    };
    const leanMock = jest.fn().mockResolvedValue(userDoc);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    User.findById.mockReturnValue({ select: selectMock });

    await authRequired(req, {}, next);

    expect(req.user).toEqual({
      id: 'user123',
      email: 'test@aprentic.test',
      role: 'admin',
      profesorId: null,
      alumnoId: null
    });
    expect(next).toHaveBeenCalledWith();
  });
});
