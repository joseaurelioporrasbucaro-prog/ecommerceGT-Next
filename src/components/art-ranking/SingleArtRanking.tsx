"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';
import type { SellerRankingItem } from '@/types/api';
import { getBackendUrl } from '@/utils/backendUrl';
import { resolveAvatarSrc } from '@/utils/avatarUtils';
import { useDateFmt } from '@/utils/datetime';

interface SingleArtRankingProps {
  seller: SellerRankingItem;
  position: number;
}

function renderStars(value: number): string {
  const filled = Math.round(value);
  return `${'★'.repeat(filled)}${'☆'.repeat(Math.max(0, 5 - filled))}`;
}

const SingleArtRanking = ({ seller, position }: SingleArtRankingProps) => {
  const t = useTranslations('profile');
  const dateFmt = useDateFmt();
  const fullName = `${seller.firstName} ${seller.lastName}`.trim() || t('seller.fallback');
  const avatarSrc = resolveAvatarSrc(seller.avatar, fullName, 64, getBackendUrl);
  const profileHref = `/creator-profile/${seller.cusId}`;

  return (
    <div className="rank-list-row seller-ranking-row">
      <div className="rank-list-cell rank-list-cell-sl">
        <span>{position}</span>
      </div>
      <div className="rank-list-cell rank-list-cell-artwotrks">
        <div className="art-item-single art-item-single-rank seller-ranking-avatar">
          <div className="art-item-wraper">
            <div className="art-item-inner">
              <div className="art-item-img pos-rel">
                <Link href={profileHref}>
                  <Image
                    width={50}
                    height={50}
                    src={avatarSrc}
                    alt={fullName}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                    unoptimized={avatarSrc.startsWith('data:')}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rank-list-cell rank-list-cell-market seller-ranking-name">
        <Link href={profileHref}>{fullName}</Link>
        {seller.handle && <span>@{seller.handle}</span>}
      </div>
      <div className="rank-list-cell rank-list-cell-volume seller-ranking-rating">
        <span className="seller-ranking-stars">{renderStars(seller.averageRating)}</span>
        <strong>{seller.averageRating.toFixed(1)}</strong>
      </div>
      <div className="rank-list-cell rank-list-cell-hours">
        {t('seller.reviewCount', { count: seller.totalReviews })}
      </div>
      <div className="rank-list-cell rank-list-cell-days">
        {dateFmt.number(seller.followers)}
      </div>
      <div className="rank-list-cell rank-list-cell-assets">
        {dateFmt.number(seller.totalpublis)}
      </div>
    </div>
  );
};

export default SingleArtRanking;
