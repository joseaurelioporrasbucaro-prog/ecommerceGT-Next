"use client";
import React from "react";
import Link from "next/link";
import profile1 from "../../../public/assets/img/profile/profile1.jpg";
import profile2 from "../../../public/assets/img/profile/profile2.jpg";
import profile3 from "../../../public/assets/img/profile/profile3.jpg";
import profile4 from "../../../public/assets/img/profile/profile4.jpg";
import profile5 from "../../../public/assets/img/profile/profile5.jpg";
import profile6 from "../../../public/assets/img/profile/profile6.jpg";
import profile7 from "../../../public/assets/img/profile/profile7.jpg";
import profile8 from "../../../public/assets/img/profile/profile8.jpg";
import Image from "next/image";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import { dates } from "@/data/nice-select-data";

const TopCreatorTwo = () => {
  const selectHandler = () => {};
  const CreatorList = [
    {
      profileImage: profile1,
      name: "Stive Machman",
      artistId: "@machman",
      artistNumber: "820",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile2,
      name: "Jobanico Mina",
      artistId: "@jobanico",
      artistNumber: "80",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile3,
      name: "Walter Russell",
      artistId: "@russell",
      artistNumber: "82",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile4,
      name: "Mary Callahan",
      artistId: "@mary.hano",
      artistNumber: "720",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile5,
      name: "John Schreffler",
      artistId: "@john.874",
      artistNumber: "870",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile6,
      name: "Kenny Chess",
      artistId: "@chess.62",
      artistNumber: "80",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile7,
      name: "Jeffrey Hayes",
      artistId: "@jerrifo",
      artistNumber: "880",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile8,
      name: "Patricia Stephens",
      artistId: "@stephens",
      artistNumber: "820",
      artistType: "Created",
      follow: "follow",
    },
    {
      profileImage: profile1,
      name: "Stive Machman",
      artistId: "@machman",
      artistNumber: "820",
      artistType: "Created",
      follow: "follow",
    },
  ];

  return (
    <section className="top-seller-area pt-110">
      <div className="container">
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="row wow fadeInUp">
              <div className="col-lg-8 col-md-8 col-sm-8">
                <div className="section-title1">
                  <h2 className="section-main-title1 mb-40">Top Creator</h2>
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-sm-4">
                <div className="t-seller-filter d-flex justify-content-sm-end mb-40">
                  <form action="#">
                    <div className="white-bg">
                      <NiceSelect
                        options={dates}
                        defaultCurrent={0}
                        onChange={selectHandler}
                        name="ts-select"
                        className="top-seller-select"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div>
              {CreatorList && (
                <div className="row wow fadeInUp">
                  {CreatorList.map((item, num) => (
                    <div
                      key={num}
                      className="col-xl-4 col-lg-6 col-md-6 col-sm-12"
                    >
                      <div className="creator-single creator-single-short creator-single-filled mb-30">
                        <div className="creator-wraper">
                          <div className="creator-inner">
                            <div className="creator-content pos-rel creator-short-content">
                              <div className="profile-img pos-rel">
                                <Link href="/creators">
                                  <Image
                                    width={50}
                                    height={50}
                                    style={{ width: "100%", height: "auto" }}
                                    src={item.profileImage}
                                    alt="profile-img"
                                  />
                                </Link>
                              </div>
                              <div className="creator-info">
                                <div>
                                  <h4 className="artist-name pos-rel">
                                    <Link href="/creators">{item.name}</Link>
                                    <span className="profile-verification verified">
                                      <i className="fas fa-check"></i>
                                    </span>
                                  </h4>
                                  <div className="artist-id">
                                    {item.artistId}
                                  </div>
                                  <div className="artist-meta-item">
                                    <div className="artist-created">
                                      {item.artistNumber}
                                    </div>
                                    <div className="artist-meta-type">
                                      {item.artistType}
                                    </div>
                                  </div>
                                </div>
                                <div className="artist-follow-btn">
                                  <button className="follow-artist">
                                    {item.follow}
                                  </button>
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
  );
};

export default TopCreatorTwo;
