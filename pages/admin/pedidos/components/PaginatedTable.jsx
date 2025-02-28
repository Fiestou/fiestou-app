import { useState, useMemo } from "react";
import PaginationButtons from "./PaginationButtons";
import PaginationLinks from "./PaginationLinks";

const PaginatedTable = ({ data, columns, itemsPerPage = 7 }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      const { id, created_at, userName, metadata, status, partnerName } = row;
      const amount_total = metadata?.amount_total || 0;
      return (
        String(id).toLowerCase().includes(query) ||
        String(partnerName).toLowerCase().includes(query) ||
        String(created_at).toLowerCase().includes(query) ||
        String(userName).toLowerCase().includes(query) ||
        String(amount_total).toLowerCase().includes(query) ||
        String(status).toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === "created_at") {
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
      } else if (sortConfig.key === "amount_total") {
        aVal = a.metadata?.amount_total || 0;
        bVal = b.metadata?.amount_total || 0;
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil((sortedData ? sortedData.length : 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleSort = (sortKey) => {
    let direction = "asc";
    if (sortConfig.key === sortKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: sortKey, direction });
    setCurrentPage(1);
  };

  const getPaginationGroup = () => {
    const pages = [];
    const totalNumbers = 3;
    let startPage = Math.max(2, currentPage - Math.floor(totalNumbers / 2));
    let endPage = startPage + totalNumbers - 1;

    if (endPage > totalPages - 1) {
      endPage = totalPages - 1;
      startPage = Math.max(2, endPage - totalNumbers + 1);
    }

    pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const paginationGroup = getPaginationGroup();

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border rounded w-full"
        />
      </div>

      <div className="overflow-x-auto w-full">
        <div className="min-w-[1024px] md:min-w-full">
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[minmax(100px,1fr)_minmax(150px,2fr)_minmax(100px,1fr)_minmax(200px,3fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)] gap-4 bg-zinc-100 p-4 font-bold text-zinc-900 font-title">
              {columns.map((col, index) => (
                <div
                  key={index}
                  className={`${col.sortable ? "cursor-pointer select-none" : ""}`}
                  onClick={() => col.sortable && handleSort(col.sortKey)}
                >
                  {col.name}
                  {col.sortable && sortConfig.key === col.sortKey && (
                    <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ maxHeight: "500px" }}>
              {paginatedData.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-[minmax(100px,1fr)_minmax(150px,2fr)_minmax(100px,1fr)_minmax(200px,3fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)] gap-4 border-t p-4 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                >
                  {columns.map((col, colIndex) => (
                    <div
                      key={colIndex}
                      className="whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {col.selector(row)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Bottons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <PaginationButtons
          onPrevious={() => handlePageChange(currentPage - 1)}
          onNext={() => handlePageChange(currentPage + 1)}
          isPreviousDisabled={currentPage === 1}
          isNextDisabled={currentPage === totalPages}
        />
        <PaginationLinks
          pages={paginationGroup}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PaginatedTable;