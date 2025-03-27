import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import React, { useState } from 'react';
import {
    getImage,
} from "@/src/helper";
import Img from '../../utils/ImgBase';

const images = [
    'https://api.fiestou.com.br/storage/products/19/11-10-2024/xl-1892-dsc-0385.JPG',
    'https://source.unsplash.com/1600x900/?city',
    'https://source.unsplash.com/1600x900/?ocean'
];

interface FullScreenSwiperProps {
    images: Array<any>
}

const FullscreenSwiper: React.FC<FullScreenSwiperProps> = (props) => {
    const [swiperInstance, setSwiperInstance] = useState(null as any);
    const navegateImageCarousel = (imageID: any) => {
        const imageIndex = props.images.findIndex((img) => img.id === imageID);

        if (imageIndex !== -1 && swiperInstance) {
            swiperInstance.slideTo(imageIndex);
        }
    };

    return (
        <div className="relative w-full h-[250px]">
            <Swiper
                onSwiper={(swiper) => setSwiperInstance(swiper)}
                modules={[Pagination, Navigation]}
                navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                pagination={{
                    el: ".swiper-pagination",
                }}
                className="w-full h-full"
            >
                {props.images.map((value, index) => (
                    <SwiperSlide key={index}>
                        <Img
                            src={getImage(value, "xl")}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default FullscreenSwiper