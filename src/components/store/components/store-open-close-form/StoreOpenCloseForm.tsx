import { Input } from "@/src/components/ui/form";

export default function StoreOpenCloseForm({
  editing,
  days,
  week,
  onSubmit,
  onChangeWeek,
  actions,
}: {
  editing: boolean;
  days: any[];
  week: any[] | null | undefined;
  onSubmit: (e: any) => void;
  onChangeWeek: (dayValue: string, updates: any) => void;
  actions: React.ReactNode;
}) {
  const safeWeek = Array.isArray(week) ? week : [];

  return (
    <form
      onSubmit={onSubmit}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Horário de atendimento
          </h4>
        </div>
        <div className="w-fit">{actions}</div>
      </div>

      <div className="w-full">
        {editing ? (
          <div className="grid gap-2">
            {days.map((day, key) => {
              const item = safeWeek.find((d: any) => d.day === day.value) || {};

              return (
                <div key={key} className="flex items-center gap-4 text-sm">
                  <div className="w-1/6">{day.name}:</div>

                  {/* Horário de abertura */}
                  <div className="w-1/6 border-b border-zinc-900">
                    <Input
                      type="time"
                      value={item.open || ""}
                      onChange={(e: any) =>
                        onChangeWeek(day.value, { open: e.target.value })
                      }
                      className="p-0 border-0"
                    />
                  </div>

                  <div className="md:px-2 text-xs">até</div>

                  {/* Horário de fechamento */}
                  <div className="w-1/6 border-b border-zinc-900">
                    <Input
                      type="time"
                      value={item.close || ""}
                      onChange={(e: any) =>
                        onChangeWeek(day.value, { close: e.target.value })
                      }
                      className="p-0 border-0"
                    />
                  </div>

                  {/* Checkbox aberto/fechado */}
                  <label className="text-xs flex gap-2 pl-2">
                    <input
                      type="checkbox"
                      checked={item.working === "on"}
                      onChange={(e: any) =>
                        onChangeWeek(day.value, {
                          working: e.target.checked ? "on" : "off",
                        })
                      }
                    />
                    aberto
                  </label>
                </div>
              );
            })}
          </div>
        ) : safeWeek.length > 0 ? (
          <div className="text-sm">
            {safeWeek.map((day, key) => (
              <div key={key} className="grid grid-cols-6">
                <div>{day.day}</div>

                {day.working !== "on" ? (
                  <>
                    <div className="text-center">fechado</div>
                    <div className="text-center">--</div>
                    <div className="text-center">--</div>
                  </>
                ) : (
                  <>
                    <div className="text-center">{day.open}</div>
                    <div className="text-center">até</div>
                    <div className="text-center">{day.close}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          "Informe um horário de funcionamento para sua loja"
        )}
      </div>
    </form>
  );
}
