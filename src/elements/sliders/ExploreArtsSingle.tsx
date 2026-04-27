import { ProductType } from '@/interFace/interFace';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface artType {
    item:ProductType | any
}

const ExploreArtsSingle = ({item}:artType) => {
    const {id, wrapperClass, img, tag, featureClass, count, bid, share, report, profileImage, artistId, title, currentBid, price, activity} = item
    return (
        <>
            <div className={wrapperClass}>
            <div className="art-item-single mb-30">
                <div className="art-item-wraper">
                    <div className="art-item-inner">
                        <div className="art-item-img pos-rel">
                            <div className={featureClass}><i className="fas fa-star"></i>{tag}</div>
                            <div className="art-action">
                                <button className="art-action-like"><i className="flaticon-heart"></i></button>
                                <div className="art-action-like-count">{count}</div>
                                <div className="art-action-collection"><i className="flaticon-plus-sign"></i></div>
                            </div>
                            <Link href="" className="place-bid">{bid}</Link>
                            <Link href={`/art-details/${id}`}><Image  style={{ width: "100%", height: "auto" }} src={img} alt="art-img" /></Link>
                        </div>
                        <div className="art-item-content pos-rel">
                            <div className="art-3dots-menu">
                                <div className="art-3dots-action">
                                    <ul>
                                        <li><Link href="#"><i className="fal fa-share-alt"></i>{share}</Link></li>
                                        <li><Link href="#"><i className="fal fa-flag-alt"></i>{report}</Link></li>
                                    </ul>
                                </div>
                                <button className="art-3dots-icon"><i className="fal fa-ellipsis-v"></i></button>
                            </div>
                            <div className="artist">
                                <div className="profile-img pos-rel">
                                    <Link href="/creator-profile"><Image width={20} height={20} style={{ width: "100%", height: "100%" }} src={profileImage} alt="profile-img" /></Link>
                                    <div className="profile-verification verified">
                                        <i className="fas fa-check"></i>
                                    </div>
                                </div>
                                <div className="artist-id">{artistId}</div>
                            </div>
                            <h4 className="art-name"><Link href={`/art-details/${id}`}>{title}</Link></h4>
                            <div className="art-meta-info">
                                <div className="art-meta-item">
                                    <div className="art-meta-type">{currentBid}</div>
                                    <div className="art-price">{price}</div>
                                </div>
                                <div className="art-activity-btn">
                                    <Link className="art-activity" href="/activity"><i className="fal fa-waveform-path"></i>{activity}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ExploreArtsSingle;