import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => (
  <div className="flex justify-center my-4 space-x-2">
    <button
      disabled={page === 0}
      onClick={() => onPageChange(page - 1)}
      className="
        px-3 py-1 border rounded
        bg-white text-gray-800 border-gray-300
        hover:bg-gray-100 hover:text-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
        dark:hover:bg-gray-700 dark:hover:text-white
        transition-colors"
    >
      Prev
    </button>

    <span className="text-gray-800 dark:text-gray-200 transition-colors">
      Page {page + 1} of {totalPages}
    </span>

    <button
      disabled={page + 1 >= totalPages}
      onClick={() => onPageChange(page + 1)}
      className="
        px-3 py-1 border rounded
        bg-white text-gray-800 border-gray-300
        hover:bg-gray-100 hover:text-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
        dark:hover:bg-gray-700 dark:hover:text-white
        transition-colors"
    >
      Next
    </button>
  </div>
);

export default Pagination;
