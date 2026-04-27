import Link from "next/link";
import React from "react";
import art14 from "../../../public/assets/img/art/art14.jpg";
import art16 from "../../../public/assets/img/art/art16.jpg";
import art12 from "../../../public/assets/img/art/art12.jpg";
import art28 from "../../../public/assets/img/art/art28.jpg";
import art31 from "../../../public/assets/img/art/art31.jpg";
import art32 from "../../../public/assets/img/art/art32.jpg";
import art33 from "../../../public/assets/img/art/art33.jpg";
import art36 from "../../../public/assets/img/art/art36.jpg";
import art35 from "../../../public/assets/img/art/art35.jpg";
import art34 from "../../../public/assets/img/art/art34.jpg";
import art37 from "../../../public/assets/img/art/art37.jpg";
import art38 from "../../../public/assets/img/art/art38.jpg";
import art39 from "../../../public/assets/img/art/art39.jpg";
import art29 from "../../../public/assets/img/art/art29.jpg";
import art27 from "../../../public/assets/img/art/art27.jpg";
import art26 from "../../../public/assets/img/art/art26.jpg";
import art10 from "../../../public/assets/img/art/art10.jpg";
import art20 from "../../../public/assets/img/art/art20.jpg";
import Image from "next/image";
const CollectionCard = () => {
  return (
    <>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className="category-collections-wrapper mb-30">
          <div className="category-collections-inner">
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art14}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art29}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="art-item-single">
                  <div className="art-item-wraper">
                    <div className="art-item-inner">
                      <div className="art-item-img pos-rel">
                        <Link href="/art-details">
                          <Image
                            style={{ width: "100%", height: "100%" }}
                            src={art27}
                            alt="art-img"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="collection-content pos-rel">
              <div className="art-3dots-menu">
                <div className="art-3dots-action">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fal fa-share-alt"></i>
                        Share
                      </a>
                    </li>
                  </ul>
                </div>
                <button className="art-3dots-icon">
                  <i className="fal fa-ellipsis-v"></i>
                </button>
              </div>
              <div className="collection-category">
                <h4 className="category-name">
                  <Link href="/explore-arts">Flat landscapes</Link>
                </h4>
                <Link className="resource-meta-item" href="/explore-arts">
                  <div className="resource-created">18</div>
                  <div className="resource-meta-type">Items</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className="category-collections-wrapper mb-30">
          <div className="category-collections-inner">
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art26}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art10}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="art-item-single">
                  <div className="art-item-wraper">
                    <div className="art-item-inner">
                      <div className="art-item-img pos-rel">
                        <Link href="/art-details">
                          <Image
                            style={{ width: "100%", height: "100%" }}
                            src={art20}
                            alt="art-img"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="collection-content pos-rel">
              <div className="art-3dots-menu">
                <div className="art-3dots-action">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fal fa-share-alt"></i>
                        Share
                      </a>
                    </li>
                  </ul>
                </div>
                <button className="art-3dots-icon">
                  <i className="fal fa-ellipsis-v"></i>
                </button>
              </div>
              <div className="collection-category">
                <h4 className="category-name">
                  <Link href="/explore-arts">
                    Creative Artwork
                  </Link>
                </h4>
                <Link className="resource-meta-item" href="/explore-arts">
                  
                    <div className="resource-created">12</div>
                    <div className="resource-meta-type">Items</div>
                  
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className="category-collections-wrapper mb-30">
          <div className="category-collections-inner">
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art16}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art12}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="art-item-single">
                  <div className="art-item-wraper">
                    <div className="art-item-inner">
                      <div className="art-item-img pos-rel">
                        <Link href="/art-details">
                          <Image
                            style={{ width: "100%", height: "100%" }}
                            src={art28}
                            alt="art-img"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="collection-content pos-rel">
              <div className="art-3dots-menu">
                <div className="art-3dots-action">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fal fa-share-alt"></i>
                        Share
                      </a>
                    </li>
                  </ul>
                </div>
                <button className="art-3dots-icon">
                  <i className="fal fa-ellipsis-v"></i>
                </button>
              </div>
              <div className="collection-category">
                <h4 className="category-name">
                  <Link href="/explore-arts">Digital Painting</Link>
                </h4>
                <Link className="resource-meta-item" href="/explore-arts">
                  <div className="resource-created">17</div>
                  <div className="resource-meta-type">Items</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className="category-collections-wrapper mb-30">
          <div className="category-collections-inner">
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art31}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art32}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="art-item-single">
                  <div className="art-item-wraper">
                    <div className="art-item-inner">
                      <div className="art-item-img pos-rel">
                        <Link href="/art-details">
                          <Image
                            style={{ width: "100%", height: "100%" }}
                            src={art33}
                            alt="art-img"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="collection-content pos-rel">
              <div className="art-3dots-menu">
                <div className="art-3dots-action">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fal fa-share-alt"></i>
                        Share
                      </a>
                    </li>
                  </ul>
                </div>
                <button className="art-3dots-icon">
                  <i className="fal fa-ellipsis-v"></i>
                </button>
              </div>
              <div className="collection-category">
                <h4 className="category-name">
                  <Link href="/explore-arts">Abstract Art</Link>
                </h4>
                <Link className="resource-meta-item" href="/explore-arts">
                  <div className="resource-created">13</div>
                  <div className="resource-meta-type">Items</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className="category-collections-wrapper mb-30">
          <div className="category-collections-inner">
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art36}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art35}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="art-item-single">
                  <div className="art-item-wraper">
                    <div className="art-item-inner">
                      <div className="art-item-img pos-rel">
                        <Link href="/art-details">
                          <Image
                            style={{ width: "100%", height: "100%" }}
                            src={art34}
                            alt="art-img"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="collection-content pos-rel">
              <div className="art-3dots-menu">
                <div className="art-3dots-action">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fal fa-share-alt"></i>
                        Share
                      </a>
                    </li>
                  </ul>
                </div>
                <button className="art-3dots-icon">
                  <i className="fal fa-ellipsis-v"></i>
                </button>
              </div>
              <div className="collection-category">
                <h4 className="category-name">
                  <Link href="/explore-arts">CDigital Product</Link>
                </h4>
                <Link className="resource-meta-item" href="/explore-arts">
                  <div className="resource-created">21</div>
                  <div className="resource-meta-type">Items</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <div className="category-collections-wrapper mb-30">
          <div className="category-collections-inner">
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art37}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/art-details">
                              <Image
                                src={art38}
                                alt="art-img"
                                style={{ width: "100%", height: "auto" }}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="art-item-single">
                  <div className="art-item-wraper">
                    <div className="art-item-inner">
                      <div className="art-item-img pos-rel">
                        <Link href="/art-details">
                          <Image
                            style={{ width: "100%", height: "100%" }}
                            src={art39}
                            alt="art-img"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="collection-content pos-rel">
              <div className="art-3dots-menu">
                <div className="art-3dots-action">
                  <ul>
                    <li>
                      <a href="#">
                        <i className="fal fa-share-alt"></i>
                        Share
                      </a>
                    </li>
                  </ul>
                </div>
                <button className="art-3dots-icon">
                  <i className="fal fa-ellipsis-v"></i>
                </button>
              </div>
              <div className="collection-category">
                <h4 className="category-name">
                  <Link href="/explore-arts">Colorful Design</Link>
                </h4>
                <Link className="resource-meta-item" href="/explore-arts">
                  <div className="resource-created">14</div>
                  <div className="resource-meta-type">Items</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionCard;
