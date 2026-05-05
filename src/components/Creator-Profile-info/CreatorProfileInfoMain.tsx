"use client"
import React, { useState } from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import cover4 from "../../../public/assets/img/profile/profile-cover/profile-cover4.jpg"
import profile1 from "../../../public/assets/img/profile/profile1.jpg"
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/utils/AuthContext';

// Importamos los submódulos que crearemos en el Paso 2
import PersonalInfoTab from './PersonalInfoTab';
import AccountSettingsTab from './AccountSettingsTab';

const CreatorProfileInfoMain = () => {
    const { user } = useAuth();
    // Estado para controlar qué pestaña está activa (0 = Personal, 1 = Account)
    const [activeTab, setActiveTab] = useState(0); 

    return (
        <>
            <ThemeChanger/>
            <Breadcrumbs breadcrumbTitle="Profile Information" breadcrumbSubTitle="Profile Information" />
            <section className="creator-info-area pt-130 pb-90">
                <div className="container">
                    <div className="row">
                        {/* COLUMNA IZQUIERDA: MENÚ Y FOTOS */}
                        <div className="col-lg-4 col-md-8">
                            <div className="creator-info-details mb-40 wow fadeInUp">
                                <div className="creator-cover-img pos-rel">
                                    <div className="change-photo"><i className="flaticon-photo-camera"></i></div>
                                    <Image src={cover4} alt="cover-img" />
                                </div>
                                <div className="creator-img-name">
                                    <div className="profile-img pos-rel">
                                        <div className="change-photo"><i className="flaticon-photo-camera"></i></div>
                                        <Image 
                                            src={user?.imagenu ? (user.imagenu.startsWith('http') ? user.imagenu : `http://localhost:4000${user.imagenu}`) : profile1} 
                                            alt="profile-img" 
                                            width={160} height={160} 
                                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    </div>
                                    <div className="creator-name-id">
                                        <h4 className="artist-name pos-rel">
                                            {user?.firstName} {user?.lastName}
                                            <span className="profile-verification verified">
                                                <i className="fas fa-check"></i>
                                            </span>
                                        </h4>
                                        <div className="artist-id">{user?.email}</div>
                                    </div>
                                </div>
                                
                                <div className="profile-setting-list">
                                    <ul>
                                        {/* Usamos onClick para cambiar la pestaña activa */}
                                        <li className={activeTab === 0 ? "active" : ""}>
                                            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab(0); }}>
                                                <i className="flaticon-account"></i>Personal Info
                                            </Link>
                                        </li>
                                        <li className={activeTab === 1 ? "active" : ""}>
                                            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab(1); }}>
                                                <i className="flaticon-settings"></i>Account Settings
                                            </Link>
                                        </li>
                                        <li><Link href="#"><i className="flaticon-notification"></i>Notification Settings</Link></li>
                                        <li><Link href="/forgot"><i className="flaticon-check-mark"></i>Verify Account</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: CONTENIDO DINÁMICO */}
                        <div className="col-lg-8">
                            <div className="creator-info-personal mb-40 wow fadeInUp">
                                {activeTab === 0 && <PersonalInfoTab />}
                                {activeTab === 1 && <AccountSettingsTab />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default CreatorProfileInfoMain;