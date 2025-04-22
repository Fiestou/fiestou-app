import React, { useState } from 'react';
import {
    getImage,
} from "@/src/helper";
import Img from '../../utils/ImgBase';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper';
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface FullScreenSwiperProps {
    images: Array<any>
}

const FullscreenSwiper: React.FC<FullScreenSwiperProps> = (props) => { 
    return (
        <div className="relative w-full h-[250px]">
            <Swiper
                zoom={true}
                navigation={true}
                pagination={{
                    clickable: true,
                }}
                modules={[Zoom, Navigation, Pagination]}
                className="w-full h-full"
            >
                {props.images.map((value, index) => (
                    <SwiperSlide key={index}>
                        <div className="swiper-zoom-container">
                            <Img
                                src={getImage(value, "xl")}
                                alt={`Slide ${index + 1}`}
                                
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default FullscreenSwiper