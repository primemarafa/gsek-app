import { numberToWordsFR } from './numberToWords';

describe('numberToWordsFR', () => {
  test('converts 0 properly', () => {
    expect(numberToWordsFR(0)).toBe('zéro Franc CFA');
  });

  test('converts typical tuition and registration fees', () => {
    expect(numberToWordsFR(35000)).toBe('Trente-cinq mille Francs CFA');
    expect(numberToWordsFR(25000)).toBe('Vingt-cinq mille Francs CFA');
    expect(numberToWordsFR(100000)).toBe('Cent mille Francs CFA');
    expect(numberToWordsFR(150000)).toBe('Cent cinquante mille Francs CFA');
  });

  test('converts irregular french numbers', () => {
    expect(numberToWordsFR(71000)).toBe('Soixante-et-onze mille Francs CFA');
    expect(numberToWordsFR(80000)).toBe('Quatre-vingts mille Francs CFA');
    expect(numberToWordsFR(95000)).toBe('Quatre-vingt-quinze mille Francs CFA');
  });

  test('converts millions', () => {
    expect(numberToWordsFR(1000000)).toBe('Un million Francs CFA');
    expect(numberToWordsFR(2500000)).toBe('Deux millions cinq cent mille Francs CFA');
  });
});
