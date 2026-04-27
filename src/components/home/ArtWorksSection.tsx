"use client";
import React, { useState } from "react";
import { productData } from "@/data/productData";
import Link from "next/link";
import Image from "next/image";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import { Price, SaleData, Status, categoryData } from "@/data/nice-select-data";
const ArtWorksSection = () => {
  const selectHandler = () => {};

  return (
    <section className="artworks-area artworks-area-bg pt-110 pb-100 z-index-1">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-4">
            <div className="section-title1">
              <h2 className="section-main-title1 mb-40">Explore Artworks</h2>
            </div>
          </div>
          <div className="col-lg-8">
            <form action="#" className="artwork-filter-row mb-40">
              <div className="">
                <NiceSelect
                  options={SaleData}
                  defaultCurrent={0}
                  onChange={selectHandler}
                  name="s-t-select"
                  className="sale-type-select"
                />
              </div>
              <div className="">
                <NiceSelect
                  options={categoryData}
                  defaultCurrent={0}
                  onChange={selectHandler}
                  name="cat-select"
                  className="category-select"
                />
              </div>
              <div className="">
                <NiceSelect
                  options={Status}
                  defaultCurrent={0}
                  onChange={selectHandler}
                  name="st-select"
                  className="status-select"
                />
              </div>
              <div className="">
                <NiceSelect
                  options={Price}
                  defaultCurrent={0}
                  onChange={selectHandler}
                  name="pr-select"
                  className="price-select"
                />
              </div>
            </form>
          </div>
        </div>
        <div className="row wow fadeInUp">
          {productData.slice(10, 18).map((item: any) => (
            <div key={item.id} className={item.wrapperClass}>
              <div className="art-item-single mb-30">
                <div className="art-item-wraper">
                  <div className="art-item-inner">
                    <div className="art-item-img pos-rel">
                      <div className={item.featureClass}>
                        <i className="fas fa-star"></i>
                        {item.tag}
                      </div>
                      <div className="art-action">
                        <button className="art-action-like">
                          <i className="flaticon-heart"></i>
                        </button>
                        <div className="art-action-like-count">
                          {item.count}
                        </div>
                        <div className="art-action-collection">
                          <i className="flaticon-plus-sign"></i>
                        </div>
                      </div>
                      <a href="#" className="place-bid">
                        {item.bid}
                      </a>
                      <Link href={`/art-details/${item.id}`}>
                        <Image
                          style={{ width: "100%", height: "auto" }}
                          src={item.img}
                          alt="art-img"
                        />
                      </Link>
                    </div>
                    <div className="art-item-content pos-rel">
                      <div className="art-3dots-menu">
                        <div className="art-3dots-action">
                          <ul>
                            <li>
                              <a href="#">
                                <i className="fal fa-share-alt"></i>
                                {item.share}
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <i className="fal fa-flag-alt"></i>
                                {item.report}
                              </a>
                            </li>
                          </ul>
                        </div>
                        <button className="art-3dots-icon">
                          <i className="fal fa-ellipsis-v"></i>
                        </button>
                      </div>
                      <div className="artist">
                        <div className="profile-img pos-rel">
                          <Link href="/creator-profile">
                            <Image
                              width={20}
                              height={20}
                              style={{ width: "auto", height: "auto" }}
                              src={item.profileImage}
                              alt="profile-img"
                            />
                          </Link>
                          <div className="profile-verification verified">
                            <i className="fas fa-check"></i>
                          </div>
                        </div>
                        <div className="artist-id">{item.artistId}</div>
                      </div>
                      <h4 className="art-name">
                        <Link href={`/art-details/${item.id}`}>{item.title}</Link>
                      </h4>
                      <div className="art-meta-info">
                        <div className="art-meta-item">
                          <div className="art-meta-type">{item.currentBid}</div>
                          <div className="art-price">{item.price}</div>
                        </div>
                        <div className="art-activity-btn">
                          <Link className="art-activity" href="/activity">
                            <i className="fal fa-waveform-path"></i>
                            {item.activity}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtWorksSection;
