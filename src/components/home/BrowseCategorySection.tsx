import React from 'react';
import Link from 'next/link';
import thumb1 from "../../../public/assets/img/bids/oc-category-1.jpg"
import thumb2 from "../../../public/assets/img/bids/oc-category-2.jpg"
import thumb3 from "../../../public/assets/img/bids/oc-category-3.jpg"
import thumb4 from "../../../public/assets/img/bids/oc-category-4.jpg"
import thumb5 from "../../../public/assets/img/bids/oc-category-5.jpg"
import thumb6 from "../../../public/assets/img/bids/oc-category-6.jpg"
import thumb7 from "../../../public/assets/img/bids/oc-category-7.jpg"
import thumb8 from "../../../public/assets/img/bids/oc-category-8.jpg"
import Image from 'next/image';

const BrowseCategorySection = () => {

    const BrowseCategoryList = [
        {
            BrowseCategoryTitle: '3D Artwork',
            BrowseCategoryImage: thumb1
        },
        {
            BrowseCategoryTitle: 'Video & Music',
            BrowseCategoryImage: thumb2
        },
        {
            BrowseCategoryTitle: 'Trading Elements',
            BrowseCategoryImage: thumb3
        },
        {
            BrowseCategoryTitle: 'Photography',
            BrowseCategoryImage: thumb4
        },
        {
            BrowseCategoryTitle: 'PSD Mockup',
            BrowseCategoryImage: thumb5
        },
        {
            BrowseCategoryTitle: 'Historical Book',
            BrowseCategoryImage: thumb6
        },
        {
            BrowseCategoryTitle: 'Game & Software',
            BrowseCategoryImage: thumb7
        },
        {
            BrowseCategoryTitle: 'Photo & Image',
            BrowseCategoryImage: thumb8
        },
    
    ];


    return (
        <section className="oc-category-area pt-110 pb-70">
         <div className="container">
            <div className="row wow fadeInUp">
               <div className="col-lg-12">
                  <div className="section-title1 pos-rel text-center mb-40">
                     <h2 className="section-main-title1">Browse by Category</h2>
                     <p>Here are a few reasons why you should choose Oction for sell your NFT</p>
                  </div>
               </div>
            </div>
            {BrowseCategoryList &&
            <div className="row wow fadeInUp">
                {BrowseCategoryList.map( (BrowseCategorySection, num) => (
               <div key={num} className="col-xl-3 col-lg-3 col-sm-6">
                  <div className="oc-category mb-55">
                     <div className="oc-category-img">
                        <Link href="/explore-arts"><Image src={BrowseCategorySection.BrowseCategoryImage} alt="img not found"/></Link>
                     </div>
                     <h5 className="oc-category-title"><Link href="/explore-arts">{BrowseCategorySection.BrowseCategoryTitle}</Link></h5>
                  </div>
               </div>
                ))}
            </div>
            }
         </div>
      </section>
    );
};

export default BrowseCategorySection;