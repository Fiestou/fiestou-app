import { useEffect, useState } from "react";
import CalendarRCT from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "./ButtonUI";
import { View } from "react-calendar/dist/cjs/shared/types";
import { dateFormat } from "@/src/helper";

interface CalendarType {
  availability?: number | 0;
  dateStart?: string;
  dateEnd?: string;
  onChange?: Function;
  required?: boolean;
  unavailable?: Array<any>;
  blockdate?: Array<string>;
}

export default function Calendar(attr: CalendarType) {
  const currentData = new Date();
  const minData = new Date(
    currentData.setDate(currentData.getDate() + (attr?.availability ?? 1))
  );

  const [dateStart, setDateStart] = useState(
    (attr?.dateStart ?? currentData) as any
  );
  const handleDateStart = (date: any) => {
    const start = new Date(date);
    setDateStart(start);
    emitData({
      dateStart: start,
      dateEnd: start,
    });
  };

  const [dateEnd, setDateEnd] = useState((attr.dateEnd ?? new Date()) as any);
  const handleDateEnd = (date?: any) => {
    const end = !!date ? new Date(date) : "";
    setDateEnd(end);
    emitData({
      dateStart: dateStart,
      dateEnd: new Date(end ?? dateStart),
    });
  };

  const emitData = (date: any) => {
    !!attr.onChange ? attr.onChange(date) : {};
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const dataFormatada = dateFormat(date);
    const datasBloqueadas = attr?.blockdate ?? [];
    const datasIndisponiveis = attr?.unavailable ?? [];

    return datasBloqueadas.includes(dataFormatada) || datasIndisponiveis.includes(dataFormatada);
  };

  return (
    <div className="border rounded-md relative z-[1]">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="w-full cursor-pointer">
          <input
            name="date_comeco"
            id="date_comeco"
            className="text-sm md:text-base bg-transparent border-0 w-full px-2 cursor-pointer"
            defaultValue={
              dateStart.toLocaleDateString("pt-BR") ??
              new Date(minData).toLocaleDateString("pt-BR")
            }
            placeholder="Definir data"
            {...(!!attr?.required ? { required: true } : {})}
          />
        </div>
        <Button
          type="button"
          style="btn-link"
          onClick={() => handleDateStart(new Date(minData))}
          className="text-sm px-2 whitespace-nowrap"
        >
          Limpar data
        </Button>
      </div>
      <div className="w-full bg-white rounded-md">
        <div className="flex justify-center p-2">
          <CalendarRCT
            locale="pt-BR"
            value={dateStart}
            tileDisabled={tileDisabled}
            // selectRange={true}
            minDate={new Date(minData)}
            onChange={(date: any) => handleDateStart(date)}
          />
        </div>
      </div>
    </div>
  );
}
