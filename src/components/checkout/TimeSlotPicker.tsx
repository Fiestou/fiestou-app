import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useMemo } from "react";

interface TimeSlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  stores?: Array<any>;
  selectedDate?: string;
}

function generateTimeSlots(stores: Array<any>, selectedDate?: string) {
  if (!stores || stores.length === 0 || !selectedDate) {
    return [
      { period: "Manhã", time: "08:00" },
      { period: "Manhã", time: "09:00" },
      { period: "Manhã", time: "10:00" },
      { period: "Manhã", time: "11:00" },
      { period: "Manhã", time: "12:00" },
      { period: "Tarde", time: "13:00" },
      { period: "Tarde", time: "14:00" },
      { period: "Tarde", time: "15:00" },
      { period: "Tarde", time: "16:00" },
      { period: "Tarde", time: "17:00" },
      { period: "Noite", time: "18:00" },
      { period: "Noite", time: "19:00" },
      { period: "Noite", time: "20:00" },
      { period: "Noite", time: "21:00" },
    ];
  }

  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay();
  const dayMap: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  const dayKey = dayMap[dayOfWeek];

  let commonOpen = "08:00";
  let commonClose = "21:00";

  for (const store of stores) {
    if (!store.openClose || !Array.isArray(store.openClose)) continue;

    const daySchedule = store.openClose.find(
      (d: any) => d.day?.toLowerCase() === dayKey
    );

    if (
      !daySchedule ||
      (daySchedule.working !== "on" &&
        daySchedule.working !== "true" &&
        daySchedule.working !== true)
    ) {
      return [];
    }

    const storeOpen = daySchedule.open || "08:00";
    const storeClose = daySchedule.close || "21:00";

    if (storeOpen > commonOpen) commonOpen = storeOpen;
    if (storeClose < commonClose) commonClose = storeClose;
  }

  if (commonOpen >= commonClose) {
    return [];
  }

  const slots = [];
  let current = commonOpen;

  while (current < commonClose) {
    const [hours] = current.split(":");
    const h = parseInt(hours);

    let period = "Manhã";
    if (h >= 12 && h < 18) period = "Tarde";
    else if (h >= 18) period = "Noite";

    slots.push({ period, time: current });

    const nextHour = h + 1;
    current = `${String(nextHour).padStart(2, "0")}:00`;
  }

  return slots;
}

export default function TimeSlotPicker({
  value,
  onChange,
  required = false,
  stores = [],
  selectedDate,
}: TimeSlotPickerProps) {
  const TIME_SLOTS = useMemo(
    () => generateTimeSlots(stores, selectedDate),
    [stores, selectedDate]
  );
  return (
    <div className="border border-gray-200 rounded-lg p-4 relative">
      {required && (
        <div className="h-0 relative overflow-hidden">
          {!value && <input readOnly name="agendamento" required />}
        </div>
      )}
      <div className="absolute -top-3 left-3 bg-white px-2 text-sm font-medium text-gray-700">
        Horário
      </div>

      {TIME_SLOTS.length === 0 ? (
        <div className="mt-2 text-center py-4 text-gray-500">
          Nenhum horário disponível para retirada nesta data. Escolha outra data ou entre em contato com a loja.
        </div>
      ) : (
        <div className="mt-2">
          <Swiper
            spaceBetween={12}
            breakpoints={{
              0: { slidesPerView: 3.5 },
              640: { slidesPerView: 5.5 },
              1024: { slidesPerView: 7.5 },
            }}
            className="!pb-2"
          >
            {TIME_SLOTS.map((item, key) => {
              const slotValue = `${item.period} - ${item.time}`;
              const isSelected = value === slotValue;

              return (
                <SwiperSlide key={key}>
                  <div
                    onClick={() => onChange(slotValue)}
                    className={`${
                      isSelected
                        ? "text-yellow-600 bg-yellow-50 border-yellow-300"
                        : "text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-gray-50"
                    } border rounded-lg p-3 text-center cursor-pointer transition-all duration-200`}
                  >
                    <div className="text-xs font-medium">{item.period}</div>
                    <div className="font-bold text-sm mt-1">{item.time}</div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </div>
  );
}
