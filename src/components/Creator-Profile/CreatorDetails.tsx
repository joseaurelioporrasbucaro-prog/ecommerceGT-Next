"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Pagination from "@/utils/Pagination";
import ExploreArtsBids from "./ExploreArtsBids";
import CollectionCard from "./CollectionCard";
import TotalBids from "./TotalBids";

import Image from "next/image";
import CreatorProfileCard from "./CreatorProfileCard";
import { ProductType } from "@/interFace/interFace";
import coverImg from "../../../public/assets/img/profile/profile-cover/profile-cover-big-1.jpg";

interface singleCreatorType {
  singleCreator: ProductType;
}

const CreatorDetails = ({ singleCreator }: singleCreatorType) => {
  const t = useTranslations('profile');
  const [activeNav, setactiveNav] = useState<number>(1);
  const menuData = [
    {
      id: 1,
      navId: "nav-created-tab",
      dataTarget: "tab-nav1",
      artistMeta: t('legacy.created'),
      kind: "created",
      create: "16",
    },
    {
      id: 2,
      navId: "nav-collection-tab",
      dataTarget: "tab-nav2",
      artistMeta: t('legacy.collection'),
      kind: "collection",
      create: "95",
    },
    {
      id: 3,
      navId: "nav-featured-tab",
      dataTarget: "tab-nav3",
      artistMeta: t('legacy.featuredItems'),
      kind: "featured",
      create: "12",
    },
    {
      id: 4,
      navId: "nav-sold-tab",
      dataTarget: "tab-nav4",
      artistMeta: t('legacy.totalSold'),
      kind: "sold",
      create: "24",
    },
    {
      id: 5,
      navId: "nav-bid-tab",
      dataTarget: "tab-nav5",
      artistMeta: t('legacy.totalBids'),
      kind: "bids",
      create: "96",
    },
  ];
  return (
    <>
      <section className="creator-details-area pt-0 pb-90">
        <div className="creator-cover-img creator-details-cover-img pos-rel wow fadeInUp">
          <Image src={singleCreator.coverImage ?? coverImg} alt="cover-img" />
        </div>
        <div className="container">
          <div className="row">
            <CreatorProfileCard singleCreator={singleCreator} />
            <div className="col-xl-9">
              <div className="creator-info-bar mb-30 wow fadeInUp">
                <div className="artist-meta-info creator-details-meta-info">
                  <div className="artist-meta-item artist-meta-item-border">
                    <div className="artist-meta-type">
                      {singleCreator?.create}
                    </div>
                    <div className="artist-created">
                      {singleCreator?.createNumber}
                    </div>
                  </div>
                  <div className="artist-meta-item artist-meta-item-border">
                    <div className="artist-meta-type">{t('stats.likes')}</div>
                    <div className="artist-likes">879,502</div>
                  </div>
                  <div className="artist-meta-item artist-meta-item-border">
                    <div className="artist-meta-type">
                      {singleCreator?.follower}
                    </div>
                    <div className="artist-follwers">
                      {singleCreator?.followerNumber}
                    </div>
                  </div>
                  <div className="artist-meta-item">
                    <div className="artist-meta-type">
                      {singleCreator?.followed}
                    </div>
                    <div className="artist-followed">
                      {singleCreator?.followedNumber}
                    </div>
                  </div>
                </div>
                <div className="creator-details-action">
                  <div className="artist-follow-btn">
                    <button className="follow-artist">
                      {singleCreator?.follow}
                    </button>
                  </div>
                  <div className="social__links creator-share">
                    <i className="flaticon-share"></i>
                    <ul className="d-none">
                      <li>
                        <a href="#">
                          <i className="fab fa-facebook-f"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="profile-link-text">
                    13b9ebda0178...
                    <button>
                      <i className="flaticon-copy"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="creator-info-tab wow fadeInUp">
                <div className="creator-info-tab-nav mb-30">
                  <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                      {menuData.map((item) => (
                        <button
                          key={item.id}
                          className={`nav-link ${
                            item.id === activeNav ? "active" : ""
                          }`}
                          id={item.navId}
                          data-bs-toggle="tab"
                          data-bs-target={`#${item.dataTarget}`}
                          type="button"
                          role="tab"
                          aria-selected="true"
                          onClick={() => setactiveNav(item.id)}
                        >
                          <span className="profile-nav-button">
                            <span className="artist-meta-item  artist-meta-item-border">
                              <span className="artist-meta-type">
                                {" "}
                                {item.artistMeta}{" "}
                              </span>
                              <span className="artist-created">
                                {" "}
                                {item.create}{" "}
                              </span>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </nav>
                </div>
                <div className="creator-info-tab-contents mb-30">
                  <div className="tab-content" id="nav-tabContent">
                    {menuData.map((item) => (
                      <div
                        key={item.id}
                        className={`tab-pane fade ${
                          item.id === activeNav ? "active show" : ""
                        }`}
                        id={item.dataTarget}
                        role="tabpanel"
                        aria-labelledby={item.navId}
                      >
                        <div className="created-items-wrapper">
                          <div className="row">
                            {item.kind === "created" && (
                              <ExploreArtsBids start={34} end={40} />
                            )}
                            {item.kind === "collection" && (
                              <CollectionCard />
                            )}
                            {item.kind === "featured" && (
                              <ExploreArtsBids start={38} end={44} />
                            )}
                            {item.kind === "sold" && (
                              <ExploreArtsBids start={39} end={45} />
                            )}
                            {item.kind === "bids" && <TotalBids />}
                          </div>

                          <div className="row">
                            <div className="col-12">
                              <Pagination />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreatorDetails;
