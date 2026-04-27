"use client"
import { dates } from "@/data/nice-select-data";
import { TopCreator, TopSeller } from "@/data/top-creator-data";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const TopSellerSection = () => {
  const selectHandler = () => {};
  return (
    <>
      <section className="top-seller-area pt-110 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-12">
              <div className="row wow fadeInUp">
                <div className="col-lg-8 col-md-8 col-sm-8">
                  <div className="section-title1">
                    <h2 className="section-main-title1 mb-40">Top Creator</h2>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-4">
                  <div className="t-seller-filter d-flex justify-content-sm-end mb-40">
                    <form action="#">
                      <div className="">
                        <NiceSelect
                          options={dates}
                          defaultCurrent={0}
                          onChange={selectHandler}
                          name="tc-select"
                          className="top-seller-select"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div>
                {TopCreator.length && (
                  <div className="row wow fadeInUp">
                    {TopCreator.map((item, num) => (
                      <div
                        key={num}
                        className="col-xl-6 col-lg-4 col-md-6 col-sm-6"
                      >
                        <div className="creator-single creator-single-short mb-30">
                          <div className="creator-wraper">
                            <div className="creator-inner">
                              <div className="creator-content pos-rel creator-short-content">
                                <div className="profile-img pos-rel">
                                  <Link href="/creators">
                                    <Image
                                      width={50}
                                      height={50}
                                      style={{ width: "100%", height: "auto" }}
                                      src={item.TopCreatorImage}
                                      alt="profile-img"
                                    />
                                  </Link>
                                </div>
                                <div className="creator-info">
                                  <div>
                                    <h4 className="artist-name pos-rel">
                                      <Link href="/creators">
                                        {item.TopCreatorTitle}
                                      </Link>
                                      <span className="profile-verification verified">
                                        <i className="fas fa-check"></i>
                                      </span>
                                    </h4>
                                    <div className="artist-id">
                                      {item.TopCreatorCat}
                                    </div>
                                    <div className="artist-meta-item">
                                      <div className="artist-created">
                                        {item.TopCreatorNumber}
                                      </div>
                                      <div className="artist-meta-type">
                                        {item.TopCreatorBtn}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-xl-6 col-lg-12">
              <div className="row wow fadeInUp">
                <div className="col-lg-8 col-md-8 col-sm-8">
                  <div className="section-title1">
                    <h2 className="section-main-title1 mb-40">Top Seller</h2>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-4">
                  <div className="t-seller-filter d-flex justify-content-sm-end mb-40">
                    <form action="#">
                      <div className="">
                      <NiceSelect
                          options={dates}
                          defaultCurrent={0}
                          onChange={selectHandler}
                          name="tc-select"
                          className="top-seller-select"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div>
                {TopSeller.length && (
                  <div className="row wow fadeInUp">
                    {TopSeller.map((item, num) => (
                      <div
                        key={num}
                        className="col-xl-6 col-lg-4 col-md-6 col-sm-6"
                      >
                        <div className="creator-single creator-single-short mb-30">
                          <div className="creator-wraper">
                            <div className="creator-inner">
                              <div className="creator-content pos-rel creator-short-content">
                                <div className="profile-img pos-rel">
                                  <Link href="/creators">
                                    <Image
                                      src={item.TopSellerImage}
                                      alt="profile-img"
                                      width={50}
                                      height={50}
                                      style={{ width: "100%", height: "auto" }}
                                    />
                                  </Link>
                                </div>
                                <div className="creator-info">
                                  <div>
                                    <h4 className="artist-name pos-rel">
                                      <Link href="/creators">
                                        {item.TopSellerTitle}
                                      </Link>
                                      <span className="profile-verification verified">
                                        <i className="fas fa-check"></i>
                                      </span>
                                    </h4>
                                    <div className="artist-id">
                                      {item.TopSellerCat}
                                    </div>
                                    <div className="artist-meta-item">
                                      <div className="artist-created">
                                        {item.TopSellerNumber}
                                      </div>
                                      <div className="artist-meta-type">
                                        {item.TopSellerBtn}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TopSellerSection;
