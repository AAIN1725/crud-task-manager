import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
} from '../../services/auth.service';

describe('auth.service', () => {
  describe('hashPassword', () => {
    it('returns a bcrypt hash string', async () => {
      const hash = await hashPassword('mypassword');
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('produces different hashes for the same input', async () => {
      const h1 = await hashPassword('same');
      const h2 = await hashPassword('same');
      expect(h1).not.toBe(h2);
    });
  });

  describe('comparePassword', () => {
    it('returns true for a matching password', async () => {
      const hash = await hashPassword('secret');
      expect(await comparePassword('secret', hash)).toBe(true);
    });

    it('returns false for a wrong password', async () => {
      const hash = await hashPassword('secret');
      expect(await comparePassword('wrong', hash)).toBe(false);
    });
  });

  describe('signToken', () => {
    it('returns a string with three JWT parts', () => {
      const token = signToken('user-123');
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('throws when JWT_SECRET is not set', () => {
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      expect(() => signToken('user-123')).toThrow('JWT_SECRET is not set');
      process.env.JWT_SECRET = original;
    });
  });

  describe('verifyToken', () => {
    it('returns the userId from a valid token', () => {
      const token = signToken('user-abc');
      const payload = verifyToken(token);
      expect(payload.userId).toBe('user-abc');
    });

    it('throws for a tampered token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('throws for a token signed with a different secret', () => {
      const original = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'different-secret-entirely-for-this-test';
      const tokenWithWrongSecret = signToken('user-xyz');
      process.env.JWT_SECRET = original;
      expect(() => verifyToken(tokenWithWrongSecret)).toThrow();
    });
  });
});
