"use client"
import React, { useRef, useState } from 'react';
import ThemeChanger from '../home/ThemeChanger';
import profile1 from "../../../public/assets/img/profile/profile1.jpg"
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/utils/AuthContext';
import { ApiError, ApiFetch } from '@/utils/Api';
import { getBackendUrl } from '@/utils/backendUrl';
import { uploadImage } from '@/utils/uploadImage';
import ImageCropperModal from '@/components/common/ImageCropperModal';

import PersonalInfoTab from './PersonalInfoTab';
import AccountSettingsTab from './AccountSettingsTab';
import VerifyAccountTab from './VerifyAccountTab';
import PaymentMethodsTab from './PaymentMethodsTab';

// Handoff #16 §1 — Configuración de cuenta. Layout 2 columnas: izq = card con
// franja uniforme navy→lavanda + avatar (con badge de cámara, sin recortarse) +
// nombre/check + menú vertical; der = tab activa. Solo cambia el skin: toda la
// lógica de subida de avatar y el estado de tabs se conserva. La portada del
// template se retira (la franja es uniforme en todos los perfiles).

interface NavTab {
  tab: number;
  icon: string;
  label: string;
}

const TAB_ITEMS: NavTab[] = [
  { tab: 0, icon: 'fa-user', label: 'Información personal' },
  { tab: 1, icon: 'fa-cog', label: 'Configuración de cuenta' },
  { tab: 3, icon: 'fa-credit-card', label: 'Métodos de pago' },
  { tab: 2, icon: 'fa-shield-alt', label: 'Verificar cuenta' },
];

const CreatorProfileInfoMain = () => {
    const { user, checkAuth } = useAuth();
    // Estado para controlar qué pestaña está activa (0 = Personal, 1 = Account,
    // 2 = Verificar, 3 = Métodos de pago).
    const [activeTab, setActiveTab] = useState(0);
    // Si el archivo de avatar no existe en backend (404), caemos al placeholder.
    const [avatarErrored, setAvatarErrored] = useState(false);

    // ── Recorte/subida de avatar (badge de cámara) ──
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const remoteAvatar = user?.imagenu
        ? (user.imagenu.startsWith('http') ? user.imagenu : getBackendUrl(user.imagenu))
        : null;
    const avatarSrc = remoteAvatar && !avatarErrored ? remoteAvatar : profile1;
    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

    const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Selecciona un archivo de imagen.');
            return;
        }
        setCropSrc(URL.createObjectURL(file));
    };

    const closeCropper = () => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
    };

    const handleCropped = async (file: File) => {
        setBusy(true);
        try {
            const path = await uploadImage(file, 'card');
            await ApiFetch.post('/update-avatar', { imagen: path });
            setAvatarErrored(false);
            await checkAuth();
            toast.success('Foto de perfil actualizada.');
            closeCropper();
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar la imagen');
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <ThemeChanger />
            <main className="acc-shell">
                <div className="acc-container">
                    <h1 className="acc-title">Mi cuenta</h1>
                    <p className="acc-sub">Administrá tu información, seguridad y métodos de pago.</p>

                    <div className="acc-grid">
                        {/* ── Columna izquierda: identidad + menú ── */}
                        <aside className="acc-card">
                            <div className="acc-band" />
                            <div className="acc-id">
                                <div className="acc-avatar-wrap">
                                    {remoteAvatar && !avatarErrored ? (
                                        <Image
                                            src={avatarSrc}
                                            alt="Foto de perfil"
                                            width={104}
                                            height={104}
                                            className="acc-avatar"
                                            onError={() => setAvatarErrored(true)}
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="acc-avatar acc-avatar-initials">{initials || 'KQ'}</span>
                                    )}
                                    <button
                                        type="button"
                                        className="acc-avatar-cam"
                                        title="Cambiar foto de perfil"
                                        aria-label="Cambiar foto de perfil"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        <i className="fas fa-camera" />
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={onPickFile}
                                    />
                                </div>
                                <div className="acc-name">
                                    <span>{user?.firstName} {user?.lastName}</span>
                                    {user?.verified && (
                                        <i className="fas fa-check-circle acc-check" title="Cuenta verificada" />
                                    )}
                                </div>
                                <div className="acc-email">{user?.email}</div>
                            </div>

                            <nav className="acc-nav">
                                {TAB_ITEMS.map((item) => (
                                    <button
                                        key={item.tab}
                                        type="button"
                                        className={`acc-nav-item ${activeTab === item.tab ? 'is-active' : ''}`}
                                        onClick={() => setActiveTab(item.tab)}
                                    >
                                        <i className={`fas ${item.icon}`} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                                <Link href="/soporte/tickets" className="acc-nav-item">
                                    <i className="fas fa-ticket-alt" />
                                    <span>Mis tickets</span>
                                </Link>
                                <Link href="/pauta" className="acc-nav-item">
                                    <i className="fas fa-bullhorn" />
                                    <span>Promocionar (Pauta)</span>
                                </Link>
                                {(user?.role === 'support' || user?.role === 'admin') && (
                                    <>
                                        <div className="acc-nav-sep">Soporte</div>
                                        <Link href="/soporte/verificaciones" className="acc-nav-item">
                                            <i className="fas fa-user-shield" />
                                            <span>Verificaciones</span>
                                        </Link>
                                        <Link href="/soporte/usuarios" className="acc-nav-item">
                                            <i className="fas fa-users" />
                                            <span>Usuarios</span>
                                        </Link>
                                        <Link href="/soporte/denuncias" className="acc-nav-item">
                                            <i className="fas fa-flag" />
                                            <span>Denuncias</span>
                                        </Link>
                                        <Link href="/soporte/tickets-admin" className="acc-nav-item">
                                            <i className="fas fa-headset" />
                                            <span>Tickets (soporte)</span>
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </aside>

                        {/* ── Columna derecha: tab activa ── */}
                        <div className="acc-content">
                            {activeTab === 0 && <PersonalInfoTab />}
                            {activeTab === 1 && <AccountSettingsTab />}
                            {activeTab === 2 && <VerifyAccountTab />}
                            {activeTab === 3 && <PaymentMethodsTab />}
                        </div>
                    </div>
                </div>
            </main>

            {cropSrc && (
                <ImageCropperModal
                    imageSrc={cropSrc}
                    aspect={1}
                    cropShape="round"
                    title="Encuadra tu foto de perfil"
                    busy={busy}
                    onCancel={closeCropper}
                    onConfirm={handleCropped}
                />
            )}

            <style jsx>{`
                .acc-shell {
                    padding: 110px 0 90px;
                    background: var(--bg);
                }
                .acc-container {
                    max-width: 1120px;
                    margin: 0 auto;
                    padding: 0 24px;
                }
                .acc-title {
                    font-family: var(--font-display);
                    font-weight: 700;
                    font-size: 30px;
                    letter-spacing: -0.02em;
                    color: var(--fg-strong);
                    margin: 0 0 6px;
                }
                .acc-sub {
                    color: var(--fg-muted);
                    font-size: 15px;
                    margin: 0 0 28px;
                }
                .acc-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 28px;
                    align-items: start;
                }
                @media (max-width: 860px) {
                    .acc-grid { grid-template-columns: 1fr; }
                }

                /* ── Card de identidad ── */
                .acc-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--r-lg);
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                }
                .acc-band {
                    height: 96px;
                    background: linear-gradient(120deg, var(--navy-800), var(--lav-600));
                }
                .acc-id {
                    padding: 0 20px 16px;
                    text-align: center;
                }
                /* El wrapper reserva su propio espacio (margin-top negativo) para
                   que el avatar suba sobre la franja SIN recortarse. */
                .acc-avatar-wrap {
                    position: relative;
                    width: 104px;
                    height: 104px;
                    margin: -52px auto 12px;
                }
                .acc-card :global(.acc-avatar) {
                    width: 104px;
                    height: 104px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid var(--surface);
                    background: var(--surface-sunk);
                    display: block;
                }
                .acc-avatar-initials {
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--lav-500), var(--lav-700));
                    color: #fff;
                    font-family: var(--font-display);
                    font-weight: 700;
                    font-size: 34px;
                }
                .acc-avatar-cam {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--green-500);
                    color: var(--navy-900);
                    border: 3px solid var(--surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background 0.15s ease;
                }
                .acc-avatar-cam:hover { background: var(--green-600); }
                .acc-name {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    font-family: var(--font-display);
                    font-weight: 700;
                    font-size: 18px;
                    color: var(--fg-strong);
                }
                .acc-check { color: var(--green-600); font-size: 14px; }
                .acc-email { font-size: 14px; color: var(--fg-muted); margin-top: 2px; }

                /* ── Menú vertical ── */
                .acc-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    padding: 12px 12px 16px;
                    border-top: 1px solid var(--border);
                }
                .acc-card :global(.acc-nav-item) {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    padding: 11px 16px;
                    border: none;
                    background: transparent;
                    border-radius: var(--r-sm);
                    color: var(--fg-muted);
                    font-family: var(--font-body);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    text-align: left;
                    text-decoration: none;
                    transition: background 0.15s ease, color 0.15s ease;
                }
                .acc-card :global(.acc-nav-item i) {
                    width: 20px;
                    text-align: center;
                    font-size: 15px;
                    color: var(--fg-subtle);
                }
                .acc-card :global(.acc-nav-item:hover) {
                    background: var(--surface-sunk);
                    color: var(--fg-strong);
                }
                .acc-card :global(.acc-nav-item.is-active) {
                    background: var(--navy-800);
                    color: var(--cream);
                }
                .acc-card :global(.acc-nav-item.is-active i) {
                    color: var(--green-400);
                }
                .acc-nav-sep {
                    margin: 10px 16px 4px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: var(--fg-subtle);
                }
                .acc-content {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    min-width: 0;
                }
            `}</style>
        </>
    );
};

export default CreatorProfileInfoMain;
