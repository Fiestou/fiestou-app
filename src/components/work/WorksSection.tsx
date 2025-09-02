import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';

// Define a interface Step no nível superior
interface Step {
  step_cover?: string;
  step_text?: string;
}

// Define a interface HomeProps usando a interface Step
interface HomeProps {
  works_text?: string;
  works_steps?: Step[];
}

interface WorksSectionProps {
  Home: HomeProps;
}

const WorksSection: React.FC<WorksSectionProps> = ({ Home }) => {
  return (
    <section className="py-12 md:py-20">
      <div className="container-medium mx-auto px-4">
        <div className="max-w-xl mx-auto text-center pb-14">
          <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
            Comece escolhendo o tipo de festa</h2>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6 -mx-[1rem] xl:-mx-[4rem]">
          {/* <div className="hidden md:block order-1 w-1/2 text-right md:text-center md:w-fit p-2">
            <button className="swiper-prev p-5 rounded-full bg-gray-200 hover:bg-gray-300">
              <i className="fas fa-arrow-left absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
            </button>
          </div> */}
          <div className="order-3 md:order-2 w-full relative overflow-hidden rounded-[.5rem]">
            <Swiper
              spaceBetween={16}
              modules={[Navigation]}
              navigation={{
                prevEl: ".swiper-prev",
                nextEl: ".swiper-next",
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1.5,
                  centeredSlides: true,
                },
                640: {
                  slidesPerView: 2.5,
                  centeredSlides: false,
                },
                1024: {
                  slidesPerView: 4,
                  centeredSlides: false,
                },
              }}
              className="swiper-equal"
            >
              {!!Home?.works_steps &&
                Home.works_steps.map((item: Step, key: number) => (
                  <SwiperSlide key={key}>
                    <div className="border h-full rounded-lg">
                      <div className="aspect-square bg-zinc-100">
                        {!!item?.step_cover && (
                          <img
                            src={item.step_cover}
                            className="w-full h-full object-cover"
                            alt={item.step_text || 'Step image'}
                          />
                        )}
                      </div>
                      <div className="p-4 md:p-5">
                        <h3 className="font-title text-zinc-900 font-bold">
                          {item?.step_text}
                        </h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
          <div className="hidden md:block order-2 md:order-3 w-1/2 text-left md:text-center md:w-fit p-2">
            <button className="swiper-next p-5 rounded-full bg-gray-200 hover:bg-gray-300">
              <i className="fas fa-arrow-right absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorksSection;