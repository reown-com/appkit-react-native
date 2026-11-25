import { NumberUtil } from '../utils/NumberUtil';

// -- Tests --------------------------------------------------------------------
describe('NumberUtil.parseLocalStringToNumber', () => {
  it('should return 0 when value is undefined', () => {
    const result = NumberUtil.parseLocalStringToNumber(undefined);
    expect(result).toBe(0);
  });

  it('should return the number when value is a string', () => {
    const result = NumberUtil.parseLocalStringToNumber('123.45');
    expect(result).toBe(123.45);
  });

  it('should return the number when value is a string with a negative sign', () => {
    const result = NumberUtil.parseLocalStringToNumber('-123.45');
    expect(result).toBe(-123.45);
  });

  it('should return the number when value is a string with commas', () => {
    const result = NumberUtil.parseLocalStringToNumber('123,456.78');
    expect(result).toBe(123456.78);
  });
});
