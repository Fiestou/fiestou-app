const PaginationButtons = ({ onPrevious, onNext, isPreviousDisabled, isNextDisabled }) => {
    return (
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="px-3 py-1.5 bg-gray-300 rounded disabled:opacity-50 text-sm sm:px-4 sm:py-2 sm:text-base"
        >
          ⬅️ Anterior
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="px-3 py-1.5 bg-gray-300 rounded disabled:opacity-50 text-sm sm:px-4 sm:py-2 sm:text-base"
        >
          Próxima ➡️
        </button>
      </div>
    );
  };
  
  export default PaginationButtons;