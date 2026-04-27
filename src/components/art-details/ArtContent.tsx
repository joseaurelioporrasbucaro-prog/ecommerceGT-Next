import { ProductType } from "@/interFace/interFace";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import profile7 from "../../../public/assets/img/profile/profile7.jpg";
import profile8 from "../../../public/assets/img/profile/profile8.jpg";
import profile15 from "../../../public/assets/img/profile/profile15.jpg";
interface artSingleType {
  artSingle: ProductType | any;
}

const ArtContent = ({ artSingle }: artSingleType) => {
  return (
    <>
      <section className="art-details-area pt-130 pb-0">
        <div className="container">
          <div className="art-details-wrapper">
            <div className="row">
              <div className="col-xl-6 col-lg-5">
                <div className="art-item-img pos-rel art-details-img wow fadeInUp">
                  <span>
                    <Image
                      width={500}
                      height={500}
                      style={{ width: "100%", height: "100%" }}
                      src={artSingle?.img}
                      alt="art-img"
                    />
                  </span>
                </div>
              </div>
              <div className="col-xl-6 col-lg-7">
                <div className="art-details-content wow fadeInUp">
                  <div className="created-by">Created by</div>
                  <div className="creator mb-30">
                    <div className="profile-img pos-rel">
                      <Link href="/creators">
                        <Image
                          src={artSingle?.profileImage}
                          alt="profile-img"
                          width={500}
                          height={500}
                          style={{ width: "100%", height: "auto" }}
                        />
                      </Link>
                      <div className="profile-verification verified">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                    <div className="creator-name-id">
                      <h4 className="artist-name">
                        <Link href="/creators">{artSingle?.name}</Link>
                      </h4>
                      <div className="artist-id">{artSingle?.artistId}</div>
                    </div>
                  </div>
                  <div className="art-name-details">
                    <h4 className="art-name mb-25">{artSingle?.title}</h4>
                    <p>
                      There is enough material available online to help you put
                      together a website. This kind includes choosing the
                      domain, templates, layout and the overall design for your
                      best marketplace.
                    </p>
                  </div>
                  <div className="artist-meta-info art-details-meta-info">
                    <div className="art-meta-item artist-meta-item-border">
                      <div className="art-meta-type">Price</div>
                      <div className="art-price">{artSingle?.price}</div>
                      <div className="art-meta-notice">352.342 USD</div>
                    </div>
                    <div className="art-meta-item artist-meta-item-border">
                      <div className="art-meta-type">Stock</div>
                      <div className="art-sale">
                        <span className="art-sold">12</span>/
                        <span className="art-stock">58</span>
                        Sale
                      </div>
                      <div className="art-meta-notice">2nd Addition</div>
                    </div>
                    <div className="art-meta-item">
                      <div className="art-meta-type">Auction Ends</div>
                      <div
                        className="art-auction-ends"
                        data-countdown="2022/09/20"
                      ></div>
                      <div className="art-meta-notice">Hurry up!</div>
                    </div>
                  </div>
                  <div className="art-details-action mt-50 mb-50">
                    <a href="#" className="place-bid">
                      Place Bid
                    </a>
                    <div className="art-action-like-count">
                      <i className="flaticon-heart"></i>
                      {artSingle?.count}
                    </div>
                    <div className="art-action-collection">
                      <i className="flaticon-plus-sign"></i>Collect
                    </div>
                    <div className="social__links art-item-share">
                      <i className="flaticon-share"></i>
                      <ul>
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
                  </div>
                  <div className="art-details-information">
                    <div className="art-information-tab-nav mb-20">
                      <nav>
                        <div
                          className="nav nav-tabs"
                          id="nav-tab"
                          role="tablist"
                        >
                          <button
                            className="nav-link active"
                            id="nav-bid-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav1"
                            type="button"
                            role="tab"
                            aria-selected="true"
                          >
                            <span className="profile-nav-button">
                              Placed Bids
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-info-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav2"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="profile-nav-button">
                              Additional Information
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-details-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav3"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="profile-nav-button">Details</span>
                          </button>
                        </div>
                      </nav>
                    </div>
                    <div className="art-information-tab-contents mb-0">
                      <div className="tab-content" id="nav-tabContent">
                        <div
                          className="tab-pane fade active show"
                          id="tab-nav1"
                          role="tabpanel"
                          aria-labelledby="nav-bid-tab"
                        >
                          <div className="placed-bids-wrapper">
                            <div className="single-bid">
                              <div className="creator">
                                <div className="profile-img pos-rel">
                                  <Link href="/creators">
                                    <Image
                                      width={500}
                                      height={500}
                                      style={{ width: "100%", height: "auto" }}
                                      src={profile7}
                                      alt="profile-img"
                                    />
                                  </Link>
                                </div>
                                <div className="creator-name-id">
                                  <h4 className="artist-name">
                                    <Link href="/creators">Juliyan Asans</Link>
                                  </h4>
                                  <div className="artist-id">@asans</div>
                                  <div className="bid-date-time">
                                    <div className="bid-date">06/20/2021</div>
                                    <div className="bid-time">9:58am</div>
                                  </div>
                                </div>
                              </div>
                              <div className="bid-pricing">
                                <div className="bid-status">
                                  Status :{" "}
                                  <span className="accepted">Accepted</span>
                                </div>
                                <div className="bid-price">3.58 ETH</div>
                                <div className="bid-price-dollar">
                                  352.342 USD
                                </div>
                              </div>
                            </div>
                            <div className="single-bid">
                              <div className="creator">
                                <div className="profile-img pos-rel">
                                  <Link href="/creators">
                                    <Image
                                      width={500}
                                      height={500}
                                      style={{ width: "100%", height: "auto" }}
                                      src={profile8}
                                      alt="profile-img"
                                    />
                                  </Link>
                                </div>
                                <div className="creator-name-id">
                                  <h4 className="artist-name">
                                    <Link href="/creators">Naresh Hasmia</Link>
                                  </h4>
                                  <div className="artist-id">@asans</div>
                                  <div className="bid-date-time">
                                    <div className="bid-date">06/20/2021</div>
                                    <div className="bid-time">9:58am</div>
                                  </div>
                                </div>
                              </div>
                              <div className="bid-pricing">
                                <div className="bid-status">
                                  Status :{" "}
                                  <span className="accepted">Accepted</span>
                                </div>
                                <div className="bid-price">3.58 ETH</div>
                                <div className="bid-price-dollar">
                                  352.342 USD
                                </div>
                              </div>
                            </div>
                            <div className="single-bid">
                              <div className="creator">
                                <div className="profile-img pos-rel">
                                  <Link href="/creators">
                                    <Image
                                      width={500}
                                      height={500}
                                      style={{ width: "100%", height: "auto" }}
                                      src={profile15}
                                      alt="profile-img"
                                    />
                                  </Link>
                                </div>
                                <div className="creator-name-id">
                                  <h4 className="artist-name">
                                    <Link href="/creators">David Laver</Link>
                                  </h4>
                                  <div className="artist-id">@asans</div>
                                  <div className="bid-date-time">
                                    <div className="bid-date">06/20/2021</div>
                                    <div className="bid-time">9:58am</div>
                                  </div>
                                </div>
                              </div>
                              <div className="bid-pricing">
                                <div className="bid-status">
                                  Status :{" "}
                                  <span className="pending">Pending</span>
                                </div>
                                <div className="bid-price">3.58 ETH</div>
                                <div className="bid-price-dollar">
                                  352.342 USD
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="tab-pane fade"
                          id="tab-nav2"
                          role="tabpanel"
                          aria-labelledby="nav-info-tab"
                        >
                          <div className="art-info-wrapper">
                            <ul>
                              <li>
                                <span className="art-info-title">Size</span>600
                                x 1000px (37MB)
                              </li>
                              <li>
                                <span className="art-info-title">Formats</span>
                                JPEG / PNG / PDF
                              </li>
                              <li>
                                <span className="art-info-title">Contract</span>
                                OcXuy69.....hxoFkD
                              </li>
                              <li>
                                <span className="art-info-title">Token</span>
                                ID8795ER2
                              </li>
                              <li>
                                <span className="art-info-title">
                                  Token Standard
                                </span>
                                RCU-352
                              </li>
                              <li>
                                <span className="art-info-title">
                                  Blockchain
                                </span>
                                Ethereum
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div
                          className="tab-pane fade"
                          id="tab-nav3"
                          role="tabpanel"
                          aria-labelledby="nav-details-tab"
                        >
                          <div className="art-user-wrapper">
                            <ul className="mb-20">
                              <li>For commercial and personal projects</li>
                              <li>On digital or printed media</li>
                              <li>
                                For limited number of times and shortlisted
                              </li>
                              <li>Full copyrights sale</li>
                              <li>From anywhere in the world</li>
                            </ul>
                            <div className="note">
                              <span>Note:</span>10+ More artworks available of
                              this creator
                              <Link className="text-btn" href="/explore-arts">
                                Browse All
                              </Link>
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
      </section>
    </>
  );
};

export default ArtContent;
