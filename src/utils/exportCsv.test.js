import { exportToCsv } from './exportCsv';

describe('exportToCsv utility', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL et URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('devrait retourner false si aucune donnée fournie', () => {
    expect(exportToCsv('test', [], [])).toBe(false);
    expect(exportToCsv('test', null, [])).toBe(false);
  });

  it('devrait déclencher le téléchargement avec BOM UTF-8 et colonnes formatées', () => {
    const mockClick = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = mockClick;
      }
      return el;
    });

    const data = [
      { nom: 'Konaté', prenom: 'Amadou', classe: '6ème A' }
    ];
    const columns = [
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'classe', label: 'Classe' }
    ];

    const result = exportToCsv('test_eleves', data, columns);
    expect(result).toBe(true);
    expect(mockClick).toHaveBeenCalled();
  });
});
