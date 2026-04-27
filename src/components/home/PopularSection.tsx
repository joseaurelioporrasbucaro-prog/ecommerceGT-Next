import React, { useState } from "react";
import Link from 'next/link';
import art26 from "../../../public/assets/img/art/art26.jpg"
import art10 from "../../../public/assets/img/art/art10.jpg"
import art20 from "../../../public/assets/img/art/art20.jpg"
import art31 from "../../../public/assets/img/art/art31.jpg"
import art32 from "../../../public/assets/img/art/art32.jpg"
import art33 from "../../../public/assets/img/art/art33.jpg"
import art36 from "../../../public/assets/img/art/art36.jpg"
import art35 from "../../../public/assets/img/art/art35.jpg"
import art34 from "../../../public/assets/img/art/art34.jpg"
import art37 from "../../../public/assets/img/art/art37.jpg"
import art38 from "../../../public/assets/img/art/art38.jpg"
import art39 from "../../../public/assets/img/art/art39.jpg"
import Image from "next/image";


const PopularSection = () => {

    const popularCollection = [
        {
            popularTitle: 'Creative Artwork',
            popularImage1: art26,
            popularImage2: art10,
            popularImage3: art20,
            popularBtnNumber: '475',
            popularBtn: 'Items',
            popularShare: 'Share',
        },
        {
            popularTitle: 'Abstract Art',
            popularImage1: art31,
            popularImage2: art32,
            popularImage3: art33,
            popularBtnNumber: '585',
            popularBtn: 'Items',
            popularShare: 'Share',
        },
        {
            popularTitle: 'Digital Product',
            popularImage1: art36,
            popularImage2: art35,
            popularImage3: art34,
            popularBtnNumber: '695',
            popularBtn: 'Items',
            popularShare: 'Share',
        },
        {
            popularTitle: 'Creative Artwork',
            popularImage1: art37,
            popularImage2: art38,
            popularImage3: art39,
            popularBtnNumber: '325',
            popularBtn: 'Items',
            popularShare: 'Share',
        },

    ];
    return (
        <section className="popular-collections-area pt-0 pb-100">
            <div className="container">
                <div className="row wow fadeInUp">
                    <div className="col-lg-12">
                        <div className="section-title1 pos-rel text-center mb-40">
                            <h2 className="section-main-title1">Popular Collection</h2>
                            <p>Browse most popular collections and Choose between auctions</p>
                        </div>
                    </div>
                </div>
                {popularCollection &&
                    <div className="row wow fadeInUp">
                        {popularCollection.map((item, num) => (
                            <div key={num} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
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
                                                                        <Link href="/art-details"><Image src={item.popularImage1} alt="art-img" /></Link>
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
                                                                        <Link href="/art-details"><Image src={item.popularImage2} alt="art-img" /></Link>
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
                                                                <Link href="/art-details"><Image src={item.popularImage3} alt="art-img" /></Link>
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
                                                        <li><a href="#"><i className="flaticon-share-1"></i>{item.popularShare}</a></li>
                                                    </ul>
                                                </div>
                                                <button className="art-3dots-icon"><i className="fal fa-ellipsis-v"></i></button>
                                            </div>
                                            <div className="collection-category">
                                                <h4 className="category-name">
                                                    <Link href="/explore-arts">{item.popularTitle}</Link>
                                                </h4>
                                                <Link className="resource-meta-item" href="/explore-arts">
                                                    <div className="resource-created">{item.popularBtnNumber}</div>
                                                    <div className="resource-meta-type">{item.popularBtn}</div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </section>
    );
};

export default PopularSection;