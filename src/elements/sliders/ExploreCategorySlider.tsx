"use client"
import React from "react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import imgOne from "../../../public/assets/img/svg-icon/021-star.svg";
import imgTwo from "../../../public/assets/img/svg-icon/014-artwork.svg";
import imgThree from "../../../public/assets/img/svg-icon/015-video.svg";
import imgFour from "../../../public/assets/img/svg-icon/016-music.svg";
import imgFive from "../../../public/assets/img/svg-icon/017-video-game.svg";
import imgSix from "../../../public/assets/img/svg-icon/018-software.svg";
import imgSeven from "../../../public/assets/img/svg-icon/019-photography.svg";
import imgEight from "../../../public/assets/img/svg-icon/020-laughing.svg";
import "swiper/css/bundle";
import Image from "next/image";
const ExploreCategorySlider = () => {
  const categoryList = [
    {
      categoryTitle: "All Items",
      categoryImage: imgOne,
    },
    {
      categoryTitle: "Creative Artworks",
      categoryImage: imgTwo,
    },
    {
      categoryTitle: "Videos",
      categoryImage: imgThree,
    },
    {
      categoryTitle: "Music",
      categoryImage: imgFour,
    },
    {
      categoryTitle: "Games",
      categoryImage: imgFive,
    },
    {
      categoryTitle: "Software",
      categoryImage: imgSix,
    },
    {
      categoryTitle: "Photography",
      categoryImage: imgSeven,
    },
    {
      categoryTitle: "Cartoons",
      categoryImage: imgEight,
    },
    {
        categoryTitle: "Videos",
        categoryImage: imgThree,
      },
      {
        categoryTitle: "Music",
        categoryImage: imgFour,
      },
      {
        categoryTitle: "Games",
        categoryImage: imgFive,
      },
  ];

  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <div className="categories-bar pos-rel mb-30">
          <div className="swiper-container categories-bar-active">
            {categoryList && (
              <div className="swiper-wrapper">
                <Swiper
                  modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                  spaceBetween={10}
                  slidesPerView={"auto"}
                  loop={true}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: true,
                  }}
                  navigation={{
                    nextEl: ".categories-bar-button-next",
                    prevEl: ".categories-bar-button-prev",
                  }}
                >
                  {categoryList.map((item, num) => (
                    <SwiperSlide key={num}>
                      <div className="category-item">
                        <Link href="/explore-arts">
                          <Image src={item.categoryImage} alt="icon-img" />{" "}
                          {item.categoryTitle}
                        </Link>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
          <div className="categories-nav">
            <div className="categories-bar-button-prev">
              <i className="fal fa-angle-left"></i>
            </div>
            <div className="categories-bar-button-next">
              <i className="fal fa-angle-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreCategorySlider;
