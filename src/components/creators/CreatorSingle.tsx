import React from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { getBackendUrl } from "@/utils/backendUrl";
import type { TopSellerRow } from "@/types/api";

const fmt = (v: number | string): string => {
  const n = Number(v) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
};

interface Props {
  creator: TopSellerRow;
  rank: number;
  defaultCover: StaticImageData;
}

const CreatorSingle = ({ creator, rank, defaultCover }: Props) => {
  const name = `${creator.firstname ?? ""} ${creator.lastname ?? ""}`.trim() || "Vendedor";
  const avatar = creator.imagenu ? getBackendUrl(creator.imagenu) : null;

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
      <div className="creator-single mb-30 pos-rel">
        <span className="creator-rank">#{rank}</span>
        <div className="creator-wraper">
          <div className="creator-inner">
            <div className="creator-cover-img pos-rel">
              <Image width={500} height={300} style={{ width: "100%", height: "auto" }} src={defaultCover} alt="cover-img" />
            </div>
            <div className="creator-content pos-rel">
              <div className="creator-info">
                <div className="profile-img pos-rel oction-creator-profile-img">
                  <Link href={`/creator-profile/${creator.id}`}>
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        width={65}
                        height={65}
                        style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "50%" }}
                        src={avatar}
                        alt={name}
                      />
                    ) : (
                      <span className="creator-initials" aria-hidden>
                        {name[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </Link>
                  {creator.verified && (
                    <div className="profile-verification verified" title="Verificado">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </div>
                <h4 className="artist-name">
                  <Link href={`/creator-profile/${creator.id}`}>{name}</Link>
                </h4>
                {creator.handle && <div className="artist-id">@{creator.handle}</div>}
              </div>
              <div className="artist-meta-info">
                <div className="artist-meta-item artist-meta-item-border">
                  <div className="artist-meta-type">Publicaciones</div>
                  <div className="artist-created">{fmt(creator.totalpubs)}</div>
                </div>
                <div className="artist-meta-item artist-meta-item-border">
                  <div className="artist-meta-type">Seguidores</div>
                  <div className="artist-follwers">{fmt(creator.followers)}</div>
                </div>
                <div className="artist-meta-item">
                  <div className="artist-meta-type">Rating</div>
                  <div className="artist-followed">{Number(creator.avgrating) > 0 ? `${creator.avgrating}★` : "—"}</div>
                </div>
              </div>
              <div className="artist-follow-btn">
                <Link className="follow-artist" href={`/creator-profile/${creator.id}`}>
                  Ver perfil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .creator-rank {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          background: var(--clr-theme-1, #6c5ce7);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .creator-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--navy-700), var(--navy-900));
          color: var(--cream);
          font-weight: 700;
          font-size: 26px;
        }
      `}</style>
    </div>
  );
};

export default CreatorSingle;
