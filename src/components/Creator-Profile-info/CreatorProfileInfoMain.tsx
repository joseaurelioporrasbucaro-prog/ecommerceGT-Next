"use client"
import React, { useState, useEffect } from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import cover4 from "../../../public/assets/img/profile/profile-cover/profile-cover4.jpg"
import profile1 from "../../../public/assets/img/profile/profile1.jpg"
import Image from 'next/image';
import Link from 'next/link';
import NiceSelectForm from '@/elements/niceSelect/NiceSelectForm';
import { Gender } from '@/data/nice-select-data';

// --- Importaciones Clave para tu Lógica ---
import { useAuth } from '@/utils/AuthContext';
import { ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CreatorProfileInfoMain = () => {
    const { user, checkAuth } = useAuth(); // Sacamos los datos de tu contexto
    const [selelectForm, setSelelectForm] = useState<string>("")
    const [loadingInfoA, setLoadingInfoA] = useState(false);

    const selectHandler = () => {}

    // --- Formulario 1: Información Personal (/changeinfoa) ---
    const formikInfoA = useFormik({
        enableReinitialize: true, // Vital: Permite que formik se actualice cuando 'user' cargue
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            // Omitimos birthday y location por ahora si no los tienes en el user del context actual
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('El nombre es obligatorio'),
            lastName: Yup.string().required('El apellido es obligatorio'),
        }),
        onSubmit: async (values) => {
            setLoadingInfoA(true);
            try {
                // Aquí usamos el endpoint exacto que reportó el asistente
                const res = await ApiFetch.post('/changeinfoa', {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    // Enviaríamos gender y birthday aquí cuando los agregues
                });
                
                if (res.idpwd === 1 || res.message === 'success') {
                    toast.success("¡Información personal actualizada!");
                    await checkAuth(); // Refresca el contexto para ver los cambios arriba en el menú
                } else {
                    toast.warning(res.message || "No se pudo actualizar");
                }
            } catch (error) {
                toast.error("Error de conexión al actualizar");
            } finally {
                setLoadingInfoA(false);
            }
        }
    });

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
                                    {/* Aquí luego pondremos la lógica de imágenes de cover */}
                                    <Image src={cover4} alt="cover-img" />
                                </div>
                                <div className="creator-img-name">
                                    <div className="profile-img pos-rel">
                                        <div className="change-photo"><i className="flaticon-photo-camera"></i></div>
                                        {/* Mostramos la foto real si existe, o la de por defecto */}
                                        <Image 
                                            // Usamos un condicional inteligente: si ya trae "http", lo usamos tal cual. Si no, se lo agregamos.
                                            src={user?.imagenu ? (user.imagenu.startsWith('http') ? user.imagenu : `http://localhost:4000${user.imagenu}`) : profile1} 
                                            alt="profile-img" 
                                            width={160} height={160} 
                                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    </div>
                                    <div className="creator-name-id">
                                        <h4 className="artist-name pos-rel">
                                            {/* Mostramos el nombre real del usuario */}
                                            {user?.firstName} {user?.lastName}
                                            <span className="profile-verification verified">
                                                <i className="fas fa-check"></i>
                                            </span>
                                        </h4>
                                        <div className="artist-id">{user?.email}</div>
                                    </div>
                                </div>
                                
                                {/* Menú Lateral Limpio y Adaptado */}
                                <div className="profile-setting-list">
                                    <ul>
                                        <li className="active"><Link href="/creator-profile-info-personal"><i className="flaticon-account"></i>Personal Info</Link></li>
                                        <li><Link href="#"><i className="flaticon-settings"></i>Account Settings</Link></li>
                                        <li><Link href="#"><i className="flaticon-notification"></i>Notification Settings</Link></li>
                                        <li><Link href="#"><i className="flaticon-check-mark"></i>Verify Account</Link></li>
                                        <li><Link href="#"><i className="flaticon-add-2"></i>Manage Subscriptions</Link></li>
                                        <li><Link href="#"><i className="flaticon-logout"></i>Log Out</Link></li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="creator-info-personal mb-40 wow fadeInUp">
                                
                                {/* Formulario 1: Información Personal */}
                                <h4 className="mb-4">Información Personal</h4>
                                <form className="personal-info-form mb-5" onSubmit={formikInfoA.handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>First Name</label>
                                                <input 
                                                    type="text" 
                                                    name="firstName"
                                                    onChange={formikInfoA.handleChange}
                                                    value={formikInfoA.values.firstName}
                                                />
                                                {formikInfoA.errors.firstName && <span className="text-danger">{formikInfoA.errors.firstName}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Last Name</label>
                                                <input 
                                                    type="text" 
                                                    name="lastName"
                                                    onChange={formikInfoA.handleChange}
                                                    value={formikInfoA.values.lastName}
                                                />
                                                {formikInfoA.errors.lastName && <span className="text-danger">{formikInfoA.errors.lastName}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="personal-info-btn">
                                        <button type="submit" className="fill-btn" disabled={loadingInfoA}>
                                            {loadingInfoA ? 'Actualizando...' : 'Update Personal Info'}
                                        </button>
                                    </div>
                                </form>

                                <hr className="mb-5"/>

                                {/* Formulario 2: Seguridad (Pronto lo conectaremos a /changeinfob) */}
                                <h4 className="mb-4">Seguridad de la Cuenta</h4>
                                <form className="personal-info-form" action="#">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="single-input-unit">
                                                <label>Email</label>
                                                {/* Prellenamos visualmente el email para que se vea bien */}
                                                <input type="email" readOnly defaultValue={user?.email || ''} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="personal-info-btn">
                                        <button type="button" className="fill-btn">Update Account Info</button>
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