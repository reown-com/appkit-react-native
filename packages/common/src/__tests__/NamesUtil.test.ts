import { ConstantsUtil, NamesUtil } from '../index';

describe('NamesUtil', () => {
  describe('isReownName', () => {
    test('returns true for names ending with legacy suffix', () => {
      const legacyName = `testname${ConstantsUtil.WC_NAME_SUFFIX_LEGACY}`;
      expect(NamesUtil.isReownName(legacyName)).toBe(true);
    });

    test('returns true for names ending with current suffix', () => {
      const currentName = `testname${ConstantsUtil.WC_NAME_SUFFIX}`;
      expect(NamesUtil.isReownName(currentName)).toBe(true);
    });

    test('returns false for names not ending with either suffix', () => {
      expect(NamesUtil.isReownName('testname')).toBe(false);
      expect(NamesUtil.isReownName('testname.com')).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(NamesUtil.isReownName('')).toBe(false);
    });
  });
});
