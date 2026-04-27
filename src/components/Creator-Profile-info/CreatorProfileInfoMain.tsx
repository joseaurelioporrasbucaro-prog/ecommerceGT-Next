"use client"
import React,{useState} from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import cover4 from "../../../public/assets/img/profile/profile-cover/profile-cover4.jpg"
import profile1 from "../../../public/assets/img/profile/profile1.jpg"
import Image from 'next/image';
import Link from 'next/link';
import NiceSelectForm from '@/elements/niceSelect/NiceSelectForm';
import { Gender } from '@/data/nice-select-data';

const CreatorProfileInfoMain = () => {
    const [selelectForm, setSelelectForm] = useState<string>("")
    const selectHandler = () =>{}

    return (
        <>
            <ThemeChanger/>
            <Breadcrumbs breadcrumbTitle="Profile Information" breadcrumbSubTitle="Profile Information" />
            <section className="creator-info-area pt-130 pb-90">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-8">
                            <div className="creator-info-details mb-40 wow fadeInUp">
                                <div className="creator-cover-img pos-rel">
                                    <div className="change-photo"><i className="flaticon-photo-camera"></i></div>
                                    <Image src={cover4} alt="cover-img" />
                                </div>
                                <div className="creator-img-name">
                                    <div className="profile-img pos-rel">
                                        <div className="change-photo"><i className="flaticon-photo-camera"></i></div>
                                        <Image src={profile1} alt="profile-img" />
                                    </div>
                                    <div className="creator-name-id">
                                        <h4 className="artist-name pos-rel">
                                            Kallaban Joy
                                            <span className="profile-verification verified">
                                                <i className="fas fa-check"></i>
                                            </span>
                                        </h4>
                                        <div className="artist-id">@Kalla.ban</div>
                                    </div>
                                </div>
                                <div className="profile-setting-list">
                                    <ul>
                                        <li className="active"><Link href="/creator-profile-info-personal"><i className="flaticon-account"></i>Personal Info</Link></li>
                                        <li><Link href="#"><i className="flaticon-settings"></i>Account Settings</Link></li>
                                        <li><Link href="#"><i className="flaticon-notification"></i>Notification Settings</Link></li>
                                        <li><Link href="#"><i className="flaticon-wallet-1"></i>Wallet Info</Link></li>
                                        <li><Link href="#"><i className="flaticon-check-mark"></i>Verify Account</Link></li>
                                        <li><Link href="#"><i className="flaticon-add-2"></i>Manage Artwork</Link></li>
                                        <li><Link href="#"><i className="flaticon-newspaper"></i>Report</Link></li>
                                        <li><Link href="#"><i className="flaticon-logout"></i>Log Out</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="creator-info-personal mb-40 wow fadeInUp">
                                <form className="personal-info-form" action="#">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>First Name</label>
                                                <input type="text" defaultValue="Steve" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Last Name</label>
                                                <input type="text" defaultValue="Long" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Gender</label>
                                                <div className="w-full">
                                                    <NiceSelectForm
                                                     options={Gender}
                                                     defaultCurrent={0}
                                                     onChange={selectHandler}
                                                     setSelelectForm={setSelelectForm}
                                                     name="g-select"
                                                     className="gender-category-select w-full mb-30"
                                                   />
                                                </div> 
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Location</label>
                                                <input type="text" defaultValue="Cupertino, California" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Date of Bith</label>
                                                <input type="date" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Email</label>
                                                <input type="email" defaultValue="admin@gmail.com" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Username</label>
                                                <input type="text" defaultValue="Steve" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Password</label>
                                                <input type="password" defaultValue="********" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="personal-info-text">
                                        <textarea defaultValue="Hello, I am Kallaban a web development Extensive documentation plus great video guides on how to setup and customize Trucking will make your customizations super easy and fast!"></textarea>
                                    </div>
                                    <div className="personal-info-btn">
                                        <button id="update-btn" className="fill-btn">Update Now</button>
                                        <button id="reset-btn" className="fill-btn-orange">Reset All</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CreatorProfileInfoMain;