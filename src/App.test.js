import {convertHeight} from './App';

describe('convertHeight', () => {
  it('should return "n/a" if value is not passed', async () => {
    expect(convertHeight()).toBe('n/a');
  });

  it('should return a valid converted value', async () => {
    expect(convertHeight(127)).toBe('50"');
  });
});
