"use client"
import React from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Link from 'next/link';
import { IdType } from '@/interFace/interFace';
import { productData } from '@/data/productData';
import ArtContent from './ArtContent';
import ExploreArtsSingle from '@/elements/sliders/ExploreArtsSingle';

const ArtDetailsMain = ({id}:IdType) => {
    const artSingle = productData.find((item)=> item.id == id)

   
    return (
        <>
            <ThemeChanger />
            <section className="page-title-area">
                <div className="container">
                    <div className="row wow fadeInUp">
                        <div className="col-lg-12">
                            <div className="page-title">
                                <h2 className="breadcrumb-title mb-10">{artSingle?.title}</h2>
                                <div className="breadcrumb-menu">
                                    <nav className="breadcrumb-trail breadcrumbs">
                                        <ul className="trail-items">
                                            <li className="trail-item trail-begin"><Link href="/">Home</Link></li>
                                            <li className="trail-item trail-end"><span>{artSingle?.title}</span></li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


       <ArtContent artSingle={artSingle}/>
       <section className="related-items-area pt-110 pb-100">
                <div className="container">
                    <div className="row justify-content-center wow fadeInUp">
                        <div className="col-lg-8">
                            <div className="section-title1 text-center">
                                <h2 className="section-main-title1">Related Items</h2>
                                <p className="mb-40">Fishkin is well recognized as a market influencer. The artworks are interactive.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row wow fadeInUp">
                        {
                            productData.slice(8, 12).map(item => <ExploreArtsSingle key={item.id} item={item} />)
                        }
                    </div>
                </div>
            </section>


        </>
    );
};

export default ArtDetailsMain;