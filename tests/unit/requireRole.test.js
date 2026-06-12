const requireRole = require('../../src/middlewares/requireRole');
const ApiError = require('../../src/utils/apiError');

describe('requireRole middleware', () => {
  it('returns 401 when user is not authenticated', () => {
    const middleware = requireRole('admin');
    const next = jest.fn();

    middleware({} , {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('returns 403 when role is not allowed', () => {
    const middleware = requireRole('admin');
    const next = jest.fn();

    middleware({ user: { role: 'alumno' } }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('calls next without error when role is allowed', () => {
    const middleware = requireRole('admin', 'profesor');
    const next = jest.fn();

    middleware({ user: { role: 'profesor' } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});
