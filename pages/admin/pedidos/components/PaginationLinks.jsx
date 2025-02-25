const PaginationLinks = ({ pages, currentPage, onPageChange }) => {
    return (
      <div className="flex gap-2">
        {pages.map((item, index) =>
          item === "..." ? (
            <span key={index} className="px-2 py-1">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(item)}
              className={`px-2 py-1 rounded ${
                currentPage === item ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>
    );
  };
  
  export default PaginationLinks;