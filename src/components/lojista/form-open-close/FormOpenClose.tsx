import React from "react";
import { Input } from "@/src/components/ui/form";

type Day = {
  name: string;
  value: string;
};

type WeekItem = {
  day: string;
  open: string;
  close: string;
  working: "on" | "off";
};

type FormOpenCloseProps = {
  form: {
    edit: string;
    loading?: boolean;
  };
  days: Day[];
  week: WeekItem[];
  handleWeek: (data: Partial<WeekItem>, dayValue: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  renderAction: (key: string) => React.ReactNode;
};

export default function FormOpenClose({
  form,
  days,
  week,
  handleWeek,
  handleSubmit,
  renderAction,
}: FormOpenCloseProps) {
  return (
    <form
      onSubmit={handleSubmit}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      {/* título */}
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Horário de atendimento
          </h4>
        </div>
        <div className="w-fit">{renderAction("openClose")}</div>
      </div>

      <div className="w-full">

        {/* --- MODO DE EDIÇÃO --- */}
        {form.edit === "openClose" ? (
          <div className="grid gap-2">
            {days.length > 0 &&
              days.map((day, i) => (
                <div
                  key={day.value}
                  className="flex items-center gap-4 text-sm"
                >
                  {/* Nome do dia */}
                  <div className="w-1/6">{day.name}:</div>

                  {/* Hora de abertura */}
                  <div className="w-1/6 border-b border-zinc-900">
                    <Input
                      type="time"
                      value={week[i]?.open ?? ""}
                      onChange={(e) =>
                        handleWeek({ open: e.target.value }, day.value)
                      }
                      className="p-0 border-0"
                    />
                  </div>

                  <div className="md:px-2 text-xs">até</div>

                  {/* Hora de fechamento */}
                  <div className="w-1/6 border-b border-zinc-900">
                    <Input
                      type="time"
                      value={week[i]?.close ?? ""}
                      onChange={(e) =>
                        handleWeek({ close: e.target.value }, day.value)
                      }
                      className="p-0 border-0"
                    />
                  </div>

                  {/* Checkbox */}
                  <label className="text-xs flex gap-2 pl-2 items-center">
                    <input
                      type="checkbox"
                      checked={week[i]?.working === "on"}
                      onChange={(e) =>
                        handleWeek(
                          { working: e.target.checked ? "on" : "off" },
                          day.value
                        )
                      }
                    />
                    aberto
                  </label>
                </div>
              ))}
          </div>
        ) : (

          /* --- MODO DE VISUALIZAÇÃO --- */
          week.length > 0 ? (
            <div className="text-sm">
              {week.map((item, i) => (
                <div key={i} className="grid grid-cols-6">
                  <div>{item.day}</div>

                  {item.working !== "on" ? (
                    <>
                      <div className="text-center">fechado</div>
                      <div className="text-center">--</div>
                      <div className="text-center">--</div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">{item.open}</div>
                      <div className="text-center">até</div>
                      <div className="text-center">{item.close}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            "Informe um horário de funcionamento para sua loja"
          )
        )}
      </div>
    </form>
  );
}
