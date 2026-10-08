/**
 * Utilitaire d'exportation de données au format CSV (compatible Excel / accents UTF-8 français)
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || rows.length === 0) {
    return false;
  }

  // En-têtes CSV
  const headerLine = columns
    .map(col => `"${(col.label || col.key).toString().replace(/"/g, '""')}"`)
    .join(';');

  // Lignes de données
  const dataLines = rows.map(row => {
    return columns
      .map(col => {
        let value = col.formatter ? col.formatter(row[col.key], row) : row[col.key];
        if (value === null || value === undefined) {
          value = '';
        }
        const strVal = String(value).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(';');
  });

  // Ajout du BOM UTF-8 (\uFEFF) pour qu'Excel reconnaisse correctement les accents français
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
