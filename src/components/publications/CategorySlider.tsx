"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Navigation, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/bundle';
import type { PublicationCategory } from '@/types/api';
import {
  getCategoryFallbackIcon,
  getCategoryIconPath,
} from './publicationUtils';

interface CategoryButtonProps {
  label: string;
  iconPath: string | null;
  fallbackIcon: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton = ({ label, iconPath, fallbackIcon, isActive, onClick }: CategoryButtonProps) => {
  const [iconErrored, setIconErrored] = useState(false);
  const showCustomIcon = iconPath && !iconErrored;

  return (
    <button
      type="button"
      className={`kq-chip property-category-btn ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
    >
      {showCustomIcon ? (
        <Image
          src={iconPath}
          alt=""
          width={20}
          height={20}
          unoptimized
          onError={() => setIconErrored(true)}
        />
      ) : (
        <i className={`fal ${fallbackIcon}`}></i>
      )}
      <span>{label}</span>
    </button>
  );
};

export interface CategorySliderProps {
  /** Slug único para los selectores de navegación de Swiper (prev/next).
   *  Permite tener varios sliders en la misma página sin que las flechas
   *  controlen al slider equivocado. */
  uniqueId?: string;
  categories: PublicationCategory[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

const CategorySlider = ({
  uniqueId = 'property-categories',
  categories,
  activeCategory,
  onSelect,
}: CategorySliderProps) => {
  const t = useTranslations('publications');
  const nextClass = `${uniqueId}-next`;
  const prevClass = `${uniqueId}-prev`;

  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <div className="categories-bar kq-category-chips pos-rel mb-30">
          <Swiper
            modules={[Navigation, A11y]}
            spaceBetween={10}
            slidesPerView="auto"
            navigation={{
              nextEl: `.${nextClass}`,
              prevEl: `.${prevClass}`,
            }}
          >
            <SwiperSlide style={{ width: 'auto' }}>
              <CategoryButton
                label={t('filters.all')}
                iconPath={null}
                fallbackIcon="fa-th-large"
                isActive={activeCategory === ''}
                onClick={() => onSelect('')}
              />
            </SwiperSlide>
            {categories.map((cat) => (
              <SwiperSlide key={cat.pubgen_id} style={{ width: 'auto' }}>
                <CategoryButton
                  label={cat.pubgen_description}
                  iconPath={getCategoryIconPath(cat.pubgen_description)}
                  fallbackIcon={getCategoryFallbackIcon(cat.pubgen_description)}
                  isActive={activeCategory === cat.pubgen_description}
                  onClick={() => onSelect(cat.pubgen_description)}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Flechas — Swiper las desactiva visualmente cuando todo cabe */}
          <div className="categories-nav">
            <div className={`categories-bar-button-prev ${prevClass}`}>
              <i className="fal fa-angle-left"></i>
            </div>
            <div className={`categories-bar-button-next ${nextClass}`}>
              <i className="fal fa-angle-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
