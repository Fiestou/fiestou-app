import { useState } from "react";
import CalendarRCT from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "./ButtonUI";
import { dateFormat } from "@/src/helper";

interface CalendarType {
  availability?: number | 0;
  dateStart?: string;
  dateEnd?: string;
  onChange?: Function;
  required?: boolean;
  unavailable?: Array<string>;
  blockdate?: Array<string>;
}

export default function Calendar(attr: CalendarType) {
  const today = new Date();

  const minDate = new Date();
  minDate.setDate(today.getDate() + (attr?.availability ?? 1));

  const [dateStart, setDateStart] = useState<Date | null>(
    attr?.dateStart ? new Date(attr.dateStart) : null
  );

  const [activeMonth, setActiveMonth] = useState<Date>(
    dateStart ?? minDate
  );

  /* ===============================
   * EMITIR DATA
   * =============================== */
  const emitData = (date: any) => {
    if (attr.onChange) attr.onChange(date);
  };

  const handleDateStart = (date: Date) => {
    setDateStart(date);
    setActiveMonth(date);

    emitData({
      dateStart: date,
      dateEnd: date,
    });
  };

  const clearDate = () => {
    setDateStart(null);
    setActiveMonth(minDate);

    emitData({
      dateStart: undefined,
      dateEnd: undefined,
    });
  };

  /* ===============================
   * DESABILITAR DATAS
   * =============================== */
  const tileDisabled = ({ date }: { date: Date }) => {
    const formatted = dateFormat(date);
    return (
      (attr?.blockdate ?? []).includes(formatted) ||
      (attr?.unavailable ?? []).includes(formatted)
    );
  };

  /* ===============================
   * CLASSES DOS DIAS
   * =============================== */
  const tileClassName = ({
    date,
    view,
  }: {
    date: Date;
    view: string;
  }) => {
    if (view !== "month") return "";

    const isToday =
      date.toDateString() === new Date().toDateString();

    const isSelected =
      !!dateStart &&
      date.toDateString() === dateStart.toDateString();

    if (isSelected) return "calendar-day-selected";
    if (isToday) return "calendar-day-today";

    return "";
  };

  return (
    <div className="border rounded-md relative z-[1]">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="w-full">
          <input
            readOnly
            className="text-sm md:text-base bg-transparent border-0 w-full px-2"
            value={
              dateStart
                ? `Data selecionada: ${dateStart.toLocaleDateString("pt-BR")}`
                : "Selecione a data"
            }
            {...(attr?.required ? { required: true } : {})}
          />
        </div>

        {dateStart && (
          <Button
            type="button"
            style="btn-link"
            onClick={clearDate}
            className="text-sm px-2 whitespace-nowrap"
          >
            Limpar data
          </Button>
        )}
      </div>

      <div className="w-full bg-white rounded-md">
        <div className="flex justify-center p-2">
          <CalendarRCT
            locale="pt-BR"
            value={dateStart}
            activeStartDate={activeMonth}
            minDate={minDate}
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveMonth(activeStartDate!)
            }
            onChange={(date: any) => handleDateStart(date as Date)}
          />
        </div>
      </div>
    </div>
  );
}
