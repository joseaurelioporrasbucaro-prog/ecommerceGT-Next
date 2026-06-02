"use client";

import Image from 'next/image';
import React, { useState } from 'react';
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
      className={`property-category-btn ${isActive ? 'is-active' : ''}`}
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
  const nextClass = `${uniqueId}-next`;
  const prevClass = `${uniqueId}-prev`;

  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <div className="categories-bar pos-rel mb-30">
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
                label="Todas"
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

      <style jsx>{`
        :global(.property-category-btn) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: 1px solid #3a3852;
          border-radius: 8px;
          color: inherit;
          cursor: pointer;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.25s ease;
        }
        :global(.property-category-btn i) {
          font-size: 16px;
        }
        :global(.property-category-btn:hover) {
          background: var(--tp-theme-1, #0f4c4c);
          border-color: var(--tp-theme-1, #0f4c4c);
          color: #fff;
          transform: translateY(-2px);
        }
        :global(.property-category-btn.is-active) {
          background: var(--tp-theme-1, #0f4c4c);
          border-color: var(--tp-theme-1, #0f4c4c);
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default CategorySlider;
