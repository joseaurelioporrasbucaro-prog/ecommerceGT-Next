"use client"
import React from "react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay, } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import ExploreArtsSingle from "./ExploreArtsSingle";
import { productData } from "@/data/productData";

const LiveOctionSlider = () => {

 

    return (
        <div className="auction-wrapper pos-rel">
            <div className="swiper-container auction-active">
                <div className="swiper-wrapper">
                    <Swiper
                        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        breakpoints={{
                            320: {
                                slidesPerView: 1
                            },
                            500: {
                                slidesPerView: 1
                            },
                            768: {
                                slidesPerView: 2
                            },
                            992: {
                                slidesPerView: 3
                            },
                            1200: {
                                slidesPerView: 3
                            }
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: true
                        }}
                        navigation={{
                           
                            nextEl: '.auction-button-next',
                            prevEl: '.auction-button-prev',
                        }}
                    >
                       

                        {
                          productData.slice(48,53).map((item)=>(
                            <SwiperSlide key={item.id}>
                             <ExploreArtsSingle item={item}/>
                        </SwiperSlide>
                          ))
                        }
                     
                    </Swiper>
                </div>
            </div>
            <div className="auction-nav">
                <div className="auction-button-prev square-nav-btn"><i className="fal fa-long-arrow-left"></i></div>
                <div className="auction-button-next square-nav-btn"><i className="fal fa-long-arrow-right"></i></div>
            </div>
        </div>
    );
};

export default LiveOctionSlider;