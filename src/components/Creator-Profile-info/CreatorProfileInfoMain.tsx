"use client"
import React, { useRef, useState } from 'react';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import cover4 from "../../../public/assets/img/profile/profile-cover/profile-cover4.jpg"
import profile1 from "../../../public/assets/img/profile/profile1.jpg"
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/utils/AuthContext';
import { ApiError, ApiFetch } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import { uploadImage } from '@/utils/uploadImage';
import ImageCropperModal from '@/components/common/ImageCropperModal';

// Importamos los submódulos que crearemos en el Paso 2
import PersonalInfoTab from './PersonalInfoTab';
import AccountSettingsTab from './AccountSettingsTab';

type CropTarget = 'avatar' | 'cover';

const CreatorProfileInfoMain = () => {
    const { user, checkAuth } = useAuth();
    // Estado para controlar qué pestaña está activa (0 = Personal, 1 = Account)
    const [activeTab, setActiveTab] = useState(0);
    // Si el archivo de avatar no existe en backend (404), caemos al placeholder.
    const [avatarErrored, setAvatarErrored] = useState(false);

    // ── Recorte/subida de avatar y portada (reusa los íconos de cámara) ──
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
    const [busy, setBusy] = useState(false);

    const remoteAvatar = user?.imagenu
        ? (user.imagenu.startsWith('http') ? user.imagenu : getBackendUrl(user.imagenu))
        : null;
    const avatarSrc = remoteAvatar && !avatarErrored ? remoteAvatar : profile1;
    const coverUrl = user?.cover ? getBackendUrl(user.cover) : null;

    const onPickFile = (target: CropTarget) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Selecciona un archivo de imagen.');
            return;
        }
        setCropSrc(URL.createObjectURL(file));
        setCropTarget(target);
    };

    const closeCropper = () => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
        setCropTarget(null);
    };

    const handleCropped = async (file: File) => {
        if (!cropTarget) return;
        setBusy(true);
        try {
            const variant = cropTarget === 'cover' ? 'detail' : 'card';
            const path = await uploadImage(file, variant);
            if (cropTarget === 'avatar') {
                await ApiFetch.post('/update-avatar', { imagen: path });
                setAvatarErrored(false);
            } else {
                await ApiFetch.post('/update-cover', { cover: path });
            }
            await checkAuth();
            toast.success(cropTarget === 'avatar' ? 'Foto de perfil actualizada.' : 'Portada actualizada.');
            closeCropper();
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar la imagen');
        } finally {
            setBusy(false);
        }
    };

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
                                    <div
                                        className="change-photo"
                                        role="button"
                                        title="Cambiar portada"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        <i className="flaticon-photo-camera"></i>
                                    </div>
                                    {coverUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={coverUrl} alt="cover-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Image src={cover4} alt="cover-img" />
                                    )}
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={onPickFile('cover')}
                                    />
                                </div>
                                <div className="creator-img-name">
                                    <div className="profile-img pos-rel">
                                        <div
                                            className="change-photo"
                                            role="button"
                                            title="Cambiar foto de perfil"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => avatarInputRef.current?.click()}
                                        >
                                            <i className="flaticon-photo-camera"></i>
                                        </div>
                                        <Image
                                            src={avatarSrc}
                                            alt="profile-img"
                                            width={160}
                                            height={160}
                                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                                            onError={() => setAvatarErrored(true)}
                                            unoptimized={avatarSrc === profile1 ? false : true}
                                        />
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={onPickFile('avatar')}
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

            {cropSrc && cropTarget && (
                <ImageCropperModal
                    imageSrc={cropSrc}
                    aspect={cropTarget === 'cover' ? 16 / 9 : 1}
                    cropShape={cropTarget === 'avatar' ? 'round' : 'rect'}
                    title={cropTarget === 'avatar' ? 'Encuadra tu foto de perfil' : 'Encuadra tu portada'}
                    busy={busy}
                    onCancel={closeCropper}
                    onConfirm={handleCropped}
                />
            )}
        </>
    );
};

export default CreatorProfileInfoMain;
