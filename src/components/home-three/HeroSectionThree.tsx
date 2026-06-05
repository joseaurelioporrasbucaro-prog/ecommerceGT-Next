import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import thumb from "../../../public/assets/img/banner/banner-3-bg.jpg";
import thumb2 from "../../../public/assets/img/banner/banner-3-bg.jpg";
import thumb3 from "../../../public/assets/img/bids/oc-category-2-2.jpg";
import thumb4 from "../../../public/assets/img/profile/profile5.jpg";
import thumb5 from "../../../public/assets/img/bids/oc-category-1.jpg";
import thumb6 from "../../../public/assets/img/profile/profile6.jpg";
import thumb7 from "../../../public/assets/img/bids/oc-category-3.jpg";
import thumb8 from "../../../public/assets/img/profile/profile7.jpg";
import Image from "next/image";
const HeroSectionThree = () => {
  const t = useTranslations('home');
  return (
    <div className="banner-area banner-area3 pos-rel pt-130">
      <div className="container c-container-1">
        <div className="row">
          <div className="col-xl-8 banner-3-column">
            <div className="single-banner single-banner-3 banner-460 d-flex align-items-center pos-rel">
              <div className="banner-bg">
                <Image
                  width={500}
                  height={500}
                  style={{ width: "100%", height: "100%" }}
                  src={thumb}
                  alt="img not found"
                />
              </div>
              <div className="banner-bg-light">
                <Image
                  width={500}
                  height={500}
                  style={{ width: "100%", height: "auto" }}
                  src={thumb2}
                  alt="img not found"
                />
              </div>
              <div className="banner-content banner-content3 pt-0">
                <h1
                  data-animation="fadeInUp"
                  data-delay=".3s"
                  className="mb-20 font-prata"
                >
                  {t('legacy.heroTitle')} <span>{t('legacy.heroAccent')}</span>
                </h1>
                <p data-animation="fadeInUp" data-delay=".5s" className="mb-30">
                  {t('legacy.heroText')}
                </p>
                <div
                  className="banner-btn"
                  data-animation="fadeInUp"
                  data-delay=".7s"
                >
                  <Link className="fill-btn" href="/explore-arts">
                    {t('legacy.exploreNow')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4 sidebar-art-list-column">
            <div className="sidebar-art-list">
              <div className="art-item-single sidebar-art-item">
                <div className="art-item-wraper">
                  <div className="art-item-inner">
                    <div className="art-item-img pos-rel">
                      <Link href="/explore-arts">
                        <Image
                          width={500}
                          height={500}
                          style={{ width: "100%", height: "auto" }}
                          src={thumb3}
                          alt="art-img"
                        />
                      </Link>
                    </div>
                    <div className="art-item-content pos-rel">
                      <h4 className="art-name">
                        <Link href="/explore-arts">{t('legacy.items.abstractCube')}</Link>
                      </h4>
                      <div className="artist">
                        <div className="profile-img pos-rel">
                          <Link href="/creators">
                            <Image
                              width={20}
                              height={20}
                              style={{ width: "100%", height: "auto" }}
                              src={thumb4}
                              alt="profile-img"
                            />
                          </Link>
                          <div className="profile-verification verified">
                            <i className="fas fa-check"></i>
                          </div>
                        </div>
                        <div className="artist-id">@jarin_mock</div>
                      </div>
                      <div className="art-meta-info">
                        <div className="art-meta-item">
                          <div className="art-meta-type">{t('legacy.currentBid')}</div>
                          <div className="art-price">24.47 ETH</div>
                        </div>
                        <div className="art-activity-btn">
                          <a href="#" className="place-bid">
                            {t('legacy.placeBid')}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="art-item-single sidebar-art-item">
                <div className="art-item-wraper">
                  <div className="art-item-inner">
                    <div className="art-item-img pos-rel">
                      <Link href="/explore-arts">
                        <Image
                          width={500}
                          height={500}
                          style={{ width: "100%", height: "auto" }}
                          src={thumb5}
                          alt="art-img"
                        />
                      </Link>
                    </div>
                    <div className="art-item-content pos-rel">
                      <h4 className="art-name">
                        <Link href="/explore-arts">{t('legacy.items.cryptoArtwork')}</Link>
                      </h4>
                      <div className="artist">
                        <div className="profile-img pos-rel">
                          <Link href="/creators">
                            <Image
                              width={20}
                              height={20}
                              style={{ width: "100%", height: "auto" }}
                              src={thumb6}
                              alt="profile-img"
                            />
                          </Link>
                          <div className="profile-verification verified">
                            <i className="fas fa-check"></i>
                          </div>
                        </div>
                        <div className="artist-id">@chess.62</div>
                      </div>
                      <div className="art-meta-info">
                        <div className="art-meta-item">
                          <div className="art-meta-type">{t('legacy.currentBid')}</div>
                          <div className="art-price">23.84 ETH</div>
                        </div>
                        <div className="art-activity-btn">
                          <a href="#" className="place-bid">
                            {t('legacy.placeBid')}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="art-item-single sidebar-art-item">
                <div className="art-item-wraper">
                  <div className="art-item-inner">
                    <div className="art-item-img pos-rel">
                      <Link href="/explore-arts">
                        <Image
                          width={500}
                          height={500}
                          style={{ width: "100%", height: "auto" }}
                          src={thumb7}
                          alt="art-img"
                        />
                      </Link>
                    </div>
                    <div className="art-item-content pos-rel">
                      <h4 className="art-name">
                        <Link href="/explore-arts">{t('legacy.items.watchLooper')}</Link>
                      </h4>
                      <div className="artist">
                        <div className="profile-img pos-rel">
                          <Link href="/creators">
                            <Image
                              width={20}
                              height={20}
                              style={{ width: "100%", height: "auto" }}
                              src={thumb8}
                              alt="profile-img"
                            />
                          </Link>
                          <div className="profile-verification verified">
                            <i className="fas fa-check"></i>
                          </div>
                        </div>
                        <div className="artist-id">@stephens</div>
                      </div>
                      <div className="art-meta-info">
                        <div className="art-meta-item">
                          <div className="art-meta-type">{t('legacy.currentBid')}</div>
                          <div className="art-price">32.84 ETH</div>
                        </div>
                        <div className="art-activity-btn">
                          <a href="#" className="place-bid">
                            {t('legacy.placeBid')}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionThree;
