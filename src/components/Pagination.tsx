import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border cursor-pointer border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-auto transition-colors text-gray-300"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-gray-300"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded-md transition-colors cursor-pointer ${
            page === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-700 hover:bg-gray-800 text-gray-300"
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages - 1 && (
        <>
          <span className="px-2 text-gray-500">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-gray-300"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 border border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-auto cursor-pointer transition-colors text-gray-300"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
