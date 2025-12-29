import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const TIME_SLOTS = [
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

interface TimeSlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function TimeSlotPicker({
  value,
  onChange,
  required = false,
}: TimeSlotPickerProps) {
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
    </div>
  );
}
