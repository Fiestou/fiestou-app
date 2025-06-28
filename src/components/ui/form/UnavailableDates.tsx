import React, { useState, useEffect, useRef } from 'react';
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Label } from "@/src/components/ui/form";

interface UnavailableDatesProps {
  initialDates?: string[];
  onChange: (dates: string[]) => void;
  minDate?: Date;
}

const UnavailableDates: React.FC<UnavailableDatesProps> = ({
  initialDates = [],
  onChange,
  minDate = new Date()
}) => {
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatLongDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const toggleDate = (dateString: string) => {
    const newDates = selectedDates.includes(dateString)
      ? selectedDates.filter(d => d !== dateString)
      : [...selectedDates, dateString];
    
    setSelectedDates(newDates);
    onChange(newDates);
  };

  const isDateSelected = (dateString: string): boolean => {
    return selectedDates.includes(dateString);
  };

  const isDateDisabled = (date: Date): boolean => {
    return date < minDate;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const displayText = selectedDates.length > 0 
    ? `${selectedDates.length} data${selectedDates.length > 1 ? 's' : ''} selecionada${selectedDates.length > 1 ? 's' : ''}`
    : 'Selecione as datas indisponíveis';

  return (
    <div className="relative">
      <div 
        ref={inputRef}
        className="form-control flex items-center justify-between cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <span className={`${selectedDates.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
          {displayText}
        </span>
        <Icon 
          icon="fa-calendar-alt" 
          className={`text-gray-400 transition-colors ${isCalendarOpen ? 'text-blue-500' : ''}`}
        />
      </div>
      
      {selectedDates.length > 0 && (
        <div className="mt-2 mb-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-block px-2 py-1 bg-white border border-yellow-300 rounded text-yellow-300 text-xs hover:bg-yellow-300 hover:text-black transition-colors cursor-pointer"
          >
            Confira as datas selecionadas
          </button>
        </div>
      )}
      
      {isCalendarOpen && (
        <div 
          ref={calendarRef}
          className="absolute bottom-full right-0 z-50 mb-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[320px]"
        >
          
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Icon icon="fa-chevron-left" className="text-gray-600" />
            </button>
            <h3 className="font-medium text-gray-900">
              {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Icon icon="fa-chevron-right" className="text-gray-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2"></div>;
              }

              const dateString = formatDate(day);
              const isSelected = isDateSelected(dateString);
              const isDisabled = isDateDisabled(day);
              const isToday = formatDate(day) === formatDate(new Date());

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && toggleDate(dateString)}
                  disabled={isDisabled}
                  className={`
                    p-2 text-sm rounded transition-colors
                    ${isDisabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-gray-100 cursor-pointer'
                    }
                    ${isSelected 
                      ? 'bg-gray-300 text-white hover:bg-gray-300' 
                      : ''
                    }
                    ${isToday && !isSelected 
                      ? 'bg-yellow-400 text-gray-900 font-medium' 
                      : ''
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Clique nas datas para marcar/desmarcar
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Datas selecionadas
              </h2>
              <span className="text-2xl font-bold text-gray-900">
                {selectedDates.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedDates.map((date, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-900">
                    {formatLongDate(date)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDate(date)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Icon icon="fa-times" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-black bg-white rounded border border-yellow-200 transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-black bg-yellow-300 rounded hover:bg-yellow-600 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnavailableDates;