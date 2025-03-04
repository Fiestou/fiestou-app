interface PaginationLinksProps {
  pages?: (string | number)[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationLinks = ({ pages = [], currentPage, onPageChange }: PaginationLinksProps) => {
  return (
    <div className="flex gap-2">
      {pages.length > 0 ? (
        pages.map((item, index) =>
          item === "..." ? (
            <span key={index} className="px-2 py-1">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(item as number)}
              className={`px-2 py-1 rounded ${
                currentPage === item ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {item}
            </button>
          )
        )
      ) : (
        <span className="px-2 py-1 text-zinc-500">Sem páginas</span>
      )}
    </div>
  );
};

export default PaginationLinks;