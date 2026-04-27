import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductType } from "@/interFace/interFace";
interface propsType {
  product: ProductType;
}

const SingleArtRanking = ({ product }: propsType) => {
  // distructure items
  const { id, img, title, volume, hours, days, bids, price, name, count } =
    product;

  return (
    <div className="rank-list-row">
      <div className="rank-list-cell rank-list-cell-sl">
        <span></span>
      </div>
      <div className="rank-list-cell rank-list-cell-artwotrks">
        <div className="art-item-single art-item-single-rank">
          <div className="art-item-wraper">
            <div className="art-item-inner">
              <div className="art-item-img pos-rel">
                <Link href={`/art-details/${id}`}>
                  <Image
                    width={50}
                    height={50}
                    style={{ width: "100%", height: "auto" }}
                    src={img}
                    alt="art-img"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rank-list-cell rank-list-cell-market">{title}</div>
      <div className="rank-list-cell rank-list-cell-volume">{volume}</div>
      <div className="rank-list-cell rank-list-cell-hours">{hours}</div>
      <div className="rank-list-cell rank-list-cell-days">{days}</div>
      <div className="rank-list-cell rank-list-cell-bids">{bids}</div>
      <div className="rank-list-cell rank-list-cell-price">{price}</div>
      <div className="rank-list-cell rank-list-cell-owner">{name}</div>
      <div className="rank-list-cell rank-list-cell-assets">{count}</div>
    </div>
  );
};

export default SingleArtRanking;
