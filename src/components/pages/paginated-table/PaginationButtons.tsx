import React from "react";

interface PaginationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

const PaginationButtons = ({
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
}: PaginationButtonsProps) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Próximo
      </button>
    </div>
  );
};
  
  export default PaginationButtons;