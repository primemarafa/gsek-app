import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      marginTop: '12px',
      flexWrap: 'wrap',
      gap: 12
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur <strong>{totalItems}</strong> éléments
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: 13 }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Précédent
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              minWidth: 34,
              padding: '6px 10px',
              fontSize: 13,
              fontWeight: page === currentPage ? 700 : 500
            }}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: 13 }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
