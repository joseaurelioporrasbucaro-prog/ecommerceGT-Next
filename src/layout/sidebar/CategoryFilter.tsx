import React, { useState } from 'react';
import Link from 'next/link';
import thumbOne from "../../../public/assets/img/svg-icon/021-star.svg"
import thumbTwo from "../../../public/assets/img/svg-icon/014-artwork.svg"
import thumbThree from "../../../public/assets/img/svg-icon/015-video.svg"
import thumbFour from "../../../public/assets/img/svg-icon/016-music.svg"
import thumbFive from "../../../public/assets/img/svg-icon/017-video-game.svg"
import thumbSix from "../../../public/assets/img/svg-icon/018-software.svg"
import thumbSeven from "../../../public/assets/img/svg-icon/019-photography.svg"
import thumbEight from "../../../public/assets/img/svg-icon/020-laughing.svg"
import Image from 'next/image';
interface propsType {
    menuOpen2: boolean;
    setMenuOpen2: React.Dispatch<React.SetStateAction<boolean>>;
  }


const CategoryFilter = ({ setMenuOpen2, menuOpen2 }:propsType) => {
    const [isActiveG, setActiveG] = useState(false);
    const [isActiveG1, setActiveG1] = useState(false);
    const [isActiveG2, setActiveG2] = useState(false);
    const [isActiveG3, setActiveG3] = useState(false);

    const handleToggleG = () => {
        setActiveG(!isActiveG);
    };
    const handleToggleG1 = () => {
        setActiveG1(!isActiveG1);
    };
    const handleToggleG2 = () => {
        setActiveG2(!isActiveG2);
    };
    const handleToggleG3 = () => {
        setActiveG3(!isActiveG3);
    };

    return (
        <>
            <div className="fix">
                <div className={menuOpen2 ? "sidebar-category-filter-wrapper open" : "sidebar-category-filter-wrapper"}>
                    <div className="sidebar-category-filter">
                        <div className="filter-widget mb-20">
                            <div className={`filter-widget-content ${isActiveG ? "content-hidden" : "danger"}`}>
                                <h3 className="filter-widget-title drop-btn" onClick={handleToggleG}>Category</h3>
                                <ul>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbOne} alt="icon-img" />All Items</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbTwo} alt="icon-img" />Creative Artworks</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbThree} alt="icon-img" />Videos</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbFour} alt="icon-img" />Music</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbFive} alt="icon-img" />Games</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbSix} alt="icon-img" />Software</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbSeven} alt="icon-img" />Photography</Link>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="category-item">
                                            <Link href="/explore-arts"><Image src={thumbEight} alt="icon-img" />Cartoons</Link>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="filter-widget mb-20">
                            <div className={`filter-widget-content ${isActiveG1 ? "content-hidden" : "danger"}`}>
                                <h3 className="filter-widget-title drop-btn" onClick={handleToggleG1}>Sale Type</h3>
                                <ul>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="s-t-1" />
                                            <label className="oc-check-label" htmlFor="s-t-1">Fixed</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="s-t-2" />
                                            <label className="oc-check-label" htmlFor="s-t-2">Auction</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="s-t-3" />
                                            <label className="oc-check-label" htmlFor="s-t-3">Bid</label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="filter-widget mb-20">
                            <div className={`filter-widget-content ${isActiveG2 ?"content-hidden" : "danger"}`}>
                                <h3 className="filter-widget-title drop-btn" onClick={handleToggleG2}>Currency ( Price)</h3>
                                <ul>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="pr-1" />
                                            <label className="oc-check-label" htmlFor="pr-1">ETH</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="pr-2" />
                                            <label className="oc-check-label" htmlFor="pr-2">USD</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="pr-3" />
                                            <label className="oc-check-label" htmlFor="pr-3">Bid</label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="filter-widget">
                            <div className={`filter-widget-content ${isActiveG3 ? "content-hidden" : "danger"}`}>
                                <h3 className="filter-widget-title drop-btn" onClick={handleToggleG3}>Status</h3>
                                <ul>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="sta-1" />
                                            <label className="oc-check-label" htmlFor="sta-1">New Arrival</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="filter-list-item">
                                            <input className="oc-check-box" type="checkbox" id="sta-2" />
                                            <label className="oc-check-label" htmlFor="sta-2">Featured</label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="offcanvas-overlay" onClick={() => { setMenuOpen2(!menuOpen2) }}></div>
        </>
    );
};

export default CategoryFilter;