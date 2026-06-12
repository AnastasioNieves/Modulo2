const asyncHandler = require('../../src/utils/asyncHandler');

describe('asyncHandler', () => {
  it('calls the wrapped async function and does not call next on success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const next = jest.fn();

    const handler = asyncHandler(fn);
    handler({}, {}, next);

    await new Promise((resolve) => process.nextTick(resolve));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards errors to next when the async function rejects', async () => {
    const error = new Error('boom');
    const fn = jest.fn().mockRejectedValue(error);
    const next = jest.fn();

    const handler = asyncHandler(fn);
    handler({}, {}, next);

    await new Promise((resolve) => process.nextTick(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });
});
