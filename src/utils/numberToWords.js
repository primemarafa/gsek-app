// Conversion des montants en lettres en Français (FCFA) pour reçus comptables

const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

function convertUnder100(n) {
  if (n === 0) return '';
  if (n < 10) return unites[n];
  if (n === 10) return 'dix';
  if (n === 11) return 'onze';
  if (n === 12) return 'douze';
  if (n === 13) return 'treize';
  if (n === 14) return 'quatorze';
  if (n === 15) return 'quinze';
  if (n === 16) return 'seize';
  if (n >= 17 && n < 20) return 'dix-' + unites[n - 10];

  const d = Math.floor(n / 10);
  const u = n % 10;

  if (d === 7) {
    if (u === 1) return 'soixante-et-onze';
    return 'soixante-' + convertUnder100(10 + u);
  }
  if (d === 9) {
    return 'quatre-vingt-' + convertUnder100(10 + u);
  }

  if (u === 1 && d !== 8) return dizaines[d] + '-et-un';
  if (u === 0) return dizaines[d];
  return dizaines[d] + '-' + unites[u];
}

function convertUnder1000(n, isFollowed = false) {
  if (n === 0) return '';
  const c = Math.floor(n / 100);
  const r = n % 100;

  let centStr = '';
  if (c === 1) centStr = 'cent';
  else if (c > 1) {
    const hasS = r === 0 && !isFollowed;
    centStr = unites[c] + ' cent' + (hasS ? 's' : '');
  }

  const rStr = convertUnder100(r);
  if (!centStr) return rStr;
  if (!rStr) return centStr;
  return centStr + ' ' + rStr;
}

export function numberToWordsFR(montant) {
  const num = Math.round(Math.abs(Number(montant) || 0));
  if (num === 0) return 'zéro Franc CFA';

  const millions = Math.floor(num / 1000000);
  const milliers = Math.floor((num % 1000000) / 1000);
  const rest = num % 1000;

  const parts = [];

  if (millions > 0) {
    if (millions === 1) parts.push('un million');
    else parts.push(convertUnder1000(millions) + ' millions');
  }

  if (milliers > 0) {
    if (milliers === 1) parts.push('mille');
    else parts.push(convertUnder1000(milliers, true) + ' mille');
  }

  if (rest > 0) {
    parts.push(convertUnder1000(rest));
  }

  const result = parts.join(' ').trim();
  // Majuscule sur la première lettre
  const capitalized = result.charAt(0).toUpperCase() + result.slice(1);
  return `${capitalized} Francs CFA`;
}
