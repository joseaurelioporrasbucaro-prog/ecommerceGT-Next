"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { ApiError, ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQueryClient } from '@tanstack/react-query';
import { useGenders, useCities, useMunicipalities } from '@/hooks/api/useCatalogs';
import { useCheckHandle, useUpdateHandle } from '@/hooks/api/useHandle';
import { SELLER_INFO_QUERY_KEY } from '@/hooks/api/usePublications';
import type { Gender, City, Municipality } from '@/types/api';
import DangerZone from './DangerZone';

interface UpdateInfoResponse {
    message?: string;
}

// Guatemala — único país del catálogo. La ubicación de perfil es departamento + municipio.
const GUATEMALA_COUNTRY_ID = 502;

const PersonalInfoTab = () => {
    const { user, checkAuth } = useAuth();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [handleValue, setHandleValue] = useState(user?.handle ?? '');
    const { data: genders = [] } = useGenders();
    const updateHandleMutation = useUpdateHandle();
    const normalizedHandle = handleValue.trim().toLowerCase();
    const handleChangesCount = user?.handleChangesCount ?? 0;
    const availableHandleChanges = Math.max(0, 2 - handleChangesCount);
    const handleLimitReached = handleChangesCount >= 2;
    const handleChanged = normalizedHandle !== (user?.handle ?? '');
    const handleFormatIsValid = /^[a-z0-9_]{3,30}$/.test(normalizedHandle);
    const handleCheckQuery = useCheckHandle(normalizedHandle);
    const handleAvailable = handleChanged ? handleCheckQuery.data?.available : true;

    // Cascada de ubicación: departamento (ciudad) → municipio (town).
    const { data: cities = [] } = useCities(GUATEMALA_COUNTRY_ID);

    useEffect(() => {
        setHandleValue(user?.handle ?? '');
    }, [user?.handle]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
            genid: user?.genid ?? '',
            lang: user?.lang || 'es',
            phone: user?.phone || '',
            address: user?.address || '',
            citId: user?.citId ? String(user.citId) : '',
            towId: user?.towId ? String(user.towId) : '',
            showLocation: user?.showLocation ?? false,
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('El nombre es obligatorio'),
            lastName: Yup.string().required('El apellido es obligatorio'),
            phone: Yup.string().max(8, 'Máximo 8 dígitos').required('El teléfono es obligatorio'),
            // La dirección (texto libre) es opcional.
            address: Yup.string().max(55, 'Máximo 55 caracteres'),
            birthday: Yup.string().required('Fecha requerida'),
            genid: Yup.string().required('Género requerido'),
            lang: Yup.string().required('Idioma requerido'),
            // Departamento y municipio son obligatorios.
            citId: Yup.string().required('Selecciona el departamento'),
            towId: Yup.string().required('Selecciona el municipio'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // 1. Enviamos Datos Personales
                await ApiFetch.post<UpdateInfoResponse>('/changeinfoa', {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    birthday: values.birthday,
                    genid: values.genid,
                    lang: values.lang
                });

                // 2. Enviamos Datos de Contacto/Ubicación
                await ApiFetch.post<UpdateInfoResponse>('/changeinfob', {
                    phone: values.phone,
                    address: values.address,
                    imagen: user?.imagenu || '', // El avatar se gestiona desde el ícono de cámara (updateAvatar)
                    citId: values.citId ? Number(values.citId) : null,
                    towId: values.towId ? Number(values.towId) : null,
                    showLocation: values.showLocation,
                });

                toast.success("¡Toda la información actualizada!");
                await checkAuth();
                // Refresca el perfil público para reflejar ubicación/visibilidad sin recargar.
                queryClient.invalidateQueries({ queryKey: SELLER_INFO_QUERY_KEY });
            } catch (error) {
                toast.error(error instanceof ApiError ? error.message : "Error al actualizar la información");
            } finally {
                setLoading(false);
            }
        }
    });

    const { data: municipalities = [] } = useMunicipalities(formik.values.citId || null);

    const renderError = (field: keyof typeof formik.values) => {
        if (formik.touched[field] && formik.errors[field]) {
            return <span className="text-danger" style={{ fontSize: '12px' }}>{formik.errors[field] as string}</span>;
        }
        return null;
    };

    const handleSubmitHandle = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!handleFormatIsValid) {
            toast.error('Usa 3 a 30 caracteres: minúsculas, números o guion bajo.');
            return;
        }

        try {
            await updateHandleMutation.mutateAsync({ handle: normalizedHandle });
            toast.success('Nombre de usuario actualizado.');
            await checkAuth();
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : 'Error inesperado');
        }
    };

    // Estilos compartidos (Handoff #16: cards .kq-card + inputs .kq-input).
    const label: React.CSSProperties = {
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
        color: 'var(--fg-strong)', display: 'block', marginBottom: 7,
    };
    const grid2: React.CSSProperties = {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
    };
    const cardTitle: React.CSSProperties = {
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20,
        color: 'var(--fg-strong)', margin: '0 0 4px',
    };
    const cardSub: React.CSSProperties = {
        fontSize: 13.5, color: 'var(--fg-muted)', margin: '0 0 20px',
    };

    return (
        <>
            {/* ── Card: nombre de usuario ── */}
            <form className="kq-card" style={{ padding: 28, marginBottom: 24 }} onSubmit={handleSubmitHandle}>
                <h3 style={cardTitle}>Nombre de usuario</h3>
                <p style={cardSub}>Podés cambiarlo hasta 2 veces.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'flex-end' }}>
                    <div>
                        <label style={label}>Usuario</label>
                        <input
                            type="text"
                            className="kq-input"
                            value={handleValue}
                            onChange={(event) => setHandleValue(event.target.value.toLowerCase())}
                            disabled={handleLimitReached}
                            title={handleLimitReached ? 'Has alcanzado el límite de 2 cambios.' : undefined}
                            placeholder="ej. ana_garcia"
                        />
                        <span style={{ display: 'block', marginTop: 6, fontSize: 12.5, color: 'var(--fg-subtle)' }}>
                            Cambios disponibles: {availableHandleChanges} / 2
                        </span>
                        {handleLimitReached && (
                            <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'var(--fg-muted)' }}>
                                Has alcanzado el límite de cambios para tu nombre de usuario.
                            </span>
                        )}
                        {handleChanged && handleFormatIsValid && handleAvailable === false && (
                            <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'var(--danger)' }}>
                                Ese nombre de usuario ya está ocupado.
                            </span>
                        )}
                        {handleChanged && handleFormatIsValid && handleAvailable === true && (
                            <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'var(--green-700)' }}>
                                Nombre disponible.
                            </span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="kq-btn kq-btn--outline"
                        style={{ height: 48 }}
                        disabled={
                            handleLimitReached ||
                            !handleChanged ||
                            !handleFormatIsValid ||
                            handleAvailable === false ||
                            handleCheckQuery.isFetching ||
                            updateHandleMutation.isPending
                        }
                    >
                        {updateHandleMutation.isPending ? 'Guardando...' : 'Guardar usuario'}
                    </button>
                </div>
            </form>

            {/* ── Card: información personal ── */}
            <form className="kq-card" style={{ padding: 28, marginBottom: 24 }} onSubmit={formik.handleSubmit}>
                <h3 style={cardTitle}>Información personal</h3>
                <div style={{ height: 16 }} />
                <div style={grid2}>
                    <div>
                        <label style={label}>Nombre(s)</label>
                        <input type="text" className="kq-input" {...formik.getFieldProps('firstName')} />
                        {renderError('firstName')}
                    </div>
                    <div>
                        <label style={label}>Apellido(s)</label>
                        <input type="text" className="kq-input" {...formik.getFieldProps('lastName')} />
                        {renderError('lastName')}
                    </div>
                    <div>
                        <label style={label}>Género</label>
                        <select className="kq-input" {...formik.getFieldProps('genid')}>
                            <option value="" disabled>Seleccione...</option>
                            {genders.map((g: Gender) => (
                                <option key={g.gen_id} value={g.gen_id}>{g.gen_description}</option>
                            ))}
                        </select>
                        {renderError('genid')}
                    </div>
                    <div>
                        <label style={label}>Fecha de nacimiento</label>
                        <input type="date" className="kq-input" {...formik.getFieldProps('birthday')} />
                        {renderError('birthday')}
                    </div>
                    <div>
                        <label style={label}>Teléfono</label>
                        <input
                            type="text"
                            className="kq-input"
                            maxLength={8}
                            {...formik.getFieldProps('phone')}
                            onKeyDown={(e) => { if (!/^[0-9]*$/.test(e.key) && e.key !== 'Backspace') e.preventDefault(); }}
                        />
                        {renderError('phone')}
                    </div>
                    <div>
                        <label style={label}>Idioma preferido</label>
                        <select className="kq-input" {...formik.getFieldProps('lang')}>
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                        {renderError('lang')}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={label}>Dirección</label>
                        <textarea
                            className="kq-input"
                            rows={2}
                            style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
                            {...formik.getFieldProps('address')}
                        />
                        {renderError('address')}
                    </div>
                    <div>
                        <label style={label}>Departamento</label>
                        <select
                            className="kq-input"
                            value={formik.values.citId}
                            onChange={(e) => {
                                formik.setFieldValue('citId', e.target.value);
                                formik.setFieldValue('towId', ''); // reset municipio al cambiar depto
                            }}
                        >
                            <option value="">Seleccione...</option>
                            {cities.map((c: City) => (
                                <option key={c.city} value={String(c.city)}>{c.description}</option>
                            ))}
                        </select>
                        {renderError('citId')}
                    </div>
                    <div>
                        <label style={label}>Municipio</label>
                        <select
                            className="kq-input"
                            value={formik.values.towId}
                            onChange={(e) => formik.setFieldValue('towId', e.target.value)}
                            disabled={!formik.values.citId}
                        >
                            <option value="">Seleccione...</option>
                            {municipalities.map((m: Municipality) => (
                                <option key={m.municipality} value={String(m.municipality)}>{m.description}</option>
                            ))}
                        </select>
                        {renderError('towId')}
                    </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 18, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={formik.values.showLocation}
                        onChange={(e) => formik.setFieldValue('showLocation', e.target.checked)}
                        style={{ width: 18, height: 18, flexShrink: 0, margin: 0, accentColor: 'var(--lav-600)' }}
                    />
                    <span style={{ fontSize: 14, color: 'var(--fg)' }}>
                        Mostrar mi ubicación (departamento y municipio) en mi perfil público
                    </span>
                </label>

                <div style={{ marginTop: 22 }}>
                    <button type="submit" className="kq-btn kq-btn--action" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar información personal'}
                    </button>
                </div>
            </form>

            {/* Zona de peligro: eliminar cuenta */}
            <DangerZone />
        </>
    );
};
export default PersonalInfoTab;
