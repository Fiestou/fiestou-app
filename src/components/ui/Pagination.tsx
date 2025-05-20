import React from "react";

type PaginationProps = {
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ links, onPageChange }) => {
  const getPageNumber = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? Number(match[1]) : null;
  };

  return (
    <nav className="flex gap-2 mt-6 justify-center" aria-label="Paginação">
      {links.map((link, idx) => {
        const label = link.label
          .replace(/&laquo;/g, "«")
          .replace(/&raquo;/g, "»")
          .replace(/<[^>]+>/g, "");

        const pageNum = getPageNumber(link.url);

        return (
          <button
            key={idx}
            type="button"
            disabled={!link.url || link.active}
            className={`px-3 py-1 rounded border text-sm
              ${link.active ? "bg-yellow-300 text-black border-yellow-300" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"}
              ${!link.url ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => pageNum && onPageChange(pageNum)}
            dangerouslySetInnerHTML={{ __html: label }}
          />
        );
      })}
    </nav>
  );
};

export default Pagination;