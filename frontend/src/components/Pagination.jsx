import React, { useEffect } from "react";

const Pagination = ({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (totalPages >= 1 && currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500 font-medium">
        Hiển thị <span className="font-bold text-gray-800">{startItem}</span> -{" "}
        <span className="font-bold text-gray-800">{endItem}</span> trong tổng số{" "}
        <span className="font-bold text-gray-800">{totalItems}</span> mục
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            currentPage === 1
              ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
          }`}
        >
          Trước
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            currentPage === totalPages
              ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
          }`}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
