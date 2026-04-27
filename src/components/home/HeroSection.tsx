"use client"
import React, { useState } from "react";
import Link from 'next/link';
import ReactPlayer from "react-player";
import Modal from "react-responsive-modal";
import thumbOne from "../../../public/assets/img/banner/b1-shape1.png"
import bgImgOne from "../../../public/assets/img/banner/oc-banner-bg.png"
import bgImgTwo from "../../../public/assets/img/banner/oc-banner-bg-light.png"
// thumbs 
import thumbTwo from "../../../public/assets/img/banner/oc-banner-1.jpg"
import thumbThree from "../../../public/assets/img/banner/oc-banner-2.jpg"
import thumbFour from "../../../public/assets/img/banner/oc-banner-3.jpg"
import thumbFive from "../../../public/assets/img/banner/oc-banner-4.jpg"

// profileImg
import profileOne from "../../../public/assets/img/profile/profile1.jpg"
import profileTwo from "../../../public/assets/img/profile/profile2.jpg"
import profileThree from "../../../public/assets/img/profile/profile3.jpg"
import profileFour from "../../../public/assets/img/profile/profile4.jpg"
import profileFive from "../../../public/assets/img/profile/profile5.jpg"

import Image from "next/image";

const HeroSection = () => {

   const [open, setOpen] = useState(false);
   const onOpenModal = () => setOpen(true);
   const onCloseModal = () => setOpen(false);

   return (
      <>
         <Modal
            open={open}
            onClose={onCloseModal}
            styles={{
               modal: {
                  maxWidth: "unset",
                  width: "70%",
                  padding: "unset"
               },
               overlay: {
                  background: "rgba(0, 0, 0, 0.5)"
               },
               closeButton: {
                  background: "yellow"
               }
            }}
            center
         >
            <ReactPlayer
               url="https://youtu.be/YRIHdCJqQOg"
               width="100%"
               height="calc(100vh - 200px)"
            />
         </Modal>
         <div className="banner-area banner-area1 pos-rel fix">
            <div className="swiper-container">
               <div className="swiper-wrapper">
                  <div className="swiper-slide">
                     <div className="single-banner single-banner-1 banner-900 d-flex align-items-center pos-rel mb-30">
                        <Image src={thumbOne} alt="img not found" className="b1-shape1" />
                        <div className="banner-bg" style={{ backgroundImage: `url(${bgImgOne.src})`}} ></div>
                        <div className="banner-bg-light" style={{ backgroundImage: `url(${bgImgTwo.src})`}}></div>
                        <div className="container pos-rel">
                           <div className="row align-items-center justify-content-between">
                              <div className="col-xl-6 col-lg-6">
                                 <div className="banner-content banner-content1 banner-content1-1 pt-0">
                                    <h1 data-animation="fadeInUp" data-delay=".3s" className="mb-25 font-prata">Discover Digital Artworks & Collect Best <span>NFTs</span></h1>
                                    <p data-animation="fadeInUp" data-delay=".5s" className="mb-40">There is enough digital
                                       artworks available online to help you put together crypto currency website.</p>
                                    <div className="banner-btn mb-105" data-animation="fadeInUp" data-delay=".7s">
                                       <Link className="fill-btn" href="/explore-arts">Explore Now</Link>
                                       <div className="oc-banner-video">
                                          <Link href="" className="popup-video" onClick={onOpenModal}> <i className="fas fa-play"></i></Link>
                                          <span>Watch Video</span>
                                       </div>
                                    </div>
                                    <div className="oc-banner-counter">
                                       <div className="art-meta-item">
                                          <div className="art-meta-notice"><span className="counter">85</span>k+</div>
                                          <div className="art-meta-type">Digital Artworks</div>
                                       </div>
                                       <div className="art-meta-item">
                                          <div className="art-meta-notice"><span className="counter">25</span>k+</div>
                                          <div className="art-meta-type">Global Creators</div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="col-xl-5 col-lg-6">
                                 <div className="oc-banner-img pos-rel">
                                    <div className="oc-banner-img-1 stuff">
                                       <Image data-depth=".5" src={thumbTwo} alt="img not found" />
                                    </div>
                                    <div className="oc-banner-img-2 stuff2">
                                       <Image data-depth=".6" src={thumbThree} alt="img not found" />
                                    </div>

                                    <div className="oc-banner-img-3 stuff3">
                                       <Image data-depth=".3" src={thumbFour} alt="img not found" />
                                    </div>

                                    <div className="oc-banner-img-4 stuff4">
                                       <Image data-depth=".5" src={thumbFive} alt="img not found" />
                                    </div>
                                    <div className="oc-banner-client-wrapper stuff5">
                                       <div className="oc-banner-client " data-depth=".3">
                                          <div className="q-meta-item">
                                             <div className="q-meta-viewed-members">
                                                <Link href="/creator-profile"><Image src={profileOne} alt="profile-img" /></Link>
                                                <Link href="/creator-profile"><Image src={profileTwo} alt="profile-img" /></Link>
                                                <Link href="/creator-profile"><Image src={profileThree} alt="profile-img" /></Link>
                                                <Link href="/creator-profile"><Image src={profileFour} alt="profile-img" /></Link>
                                                <Link href="/creator-profile"><Image src={profileFive} alt="profile-img" /></Link>
                                             </div>
                                             <div className="q-meta-viewed-members-count">
                                                <span className="q-meta-views">More Than</span>
                                                <span className="q-meta-type">25k+</span>
                                             </div>
                                          </div>
                                          <p>Digital art creators and sellers joined us to sale and create their own NFT to
                                             our marketplace</p>
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
      </>
   );
};

export default HeroSection;