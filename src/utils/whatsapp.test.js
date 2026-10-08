import { formatPhoneNumberForWhatsApp, getWhatsAppRelanceImpayeLink } from './whatsapp';
import { numberToWordsFR } from './numberToWords';

describe('whatsapp utility', () => {
  test('nettoie les numéros locaux sénégalais avec indicatif 221', () => {
    expect(formatPhoneNumberForWhatsApp('77 123 45 67')).toBe('221771234567');
    expect(formatPhoneNumberForWhatsApp('+221 78 999 88 77')).toBe('221789998877');
    expect(formatPhoneNumberForWhatsApp('00221 76 555 44 33')).toBe('221765554433');
  });

  test('génère un lien de relance encodé valide', () => {
    const res = getWhatsAppRelanceImpayeLink({
      parentTel: '+221 77 111 22 33',
      parentNom: 'Konaté',
      eleveNom: 'Amadou',
      classe: '6ème A',
      mois: 'Octobre',
      montant: 35000
    });
    expect(res.hasValidPhone).toBe(true);
    expect(res.url).toContain('https://wa.me/221771112233?text=');
    expect(res.message).toContain('35');
    expect(res.message).toContain('Octobre');
  });
});

describe('numberToWordsFR utility', () => {
  test('convertit correctement les montants courants', () => {
    expect(numberToWordsFR(0)).toBe('zéro Franc CFA');
    expect(numberToWordsFR(1000)).toBe('Mille Francs CFA');
    expect(numberToWordsFR(35000)).toBe('Trente-cinq mille Francs CFA');
    expect(numberToWordsFR(75000)).toBe('Soixante-quinze mille Francs CFA');
    expect(numberToWordsFR(150000)).toBe('Cent cinquante mille Francs CFA');
  });
});
