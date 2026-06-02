const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('password utils', () => {
  it('hashea y compara passwords con bcrypt', async () => {
    const hash = await hashPassword('Secreto123!');

    expect(hash).not.toBe('Secreto123!');
    expect(await comparePassword('Secreto123!', hash)).toBe(true);
    expect(await comparePassword('Otro123!', hash)).toBe(false);
  });
});
