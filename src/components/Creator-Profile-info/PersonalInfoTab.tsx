"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { ApiError, ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGenders } from '@/hooks/api/useCatalogs';
import { useCheckHandle, useUpdateHandle } from '@/hooks/api/useHandle';

interface UpdateInfoResponse {
    message?: string;
}

const PersonalInfoTab = () => {
    const { user, checkAuth } = useAuth();
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
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('El nombre es obligatorio'),
            lastName: Yup.string().required('El apellido es obligatorio'),
            phone: Yup.string().max(8, 'Máximo 8 dígitos').required('El teléfono es obligatorio'),
            address: Yup.string().max(55, 'Máximo 55 caracteres').required('La dirección es obligatoria'),
            birthday: Yup.string().required('Fecha requerida'),
            genid: Yup.string().required('Género requerido'),
            lang: Yup.string().required('Idioma requerido'),
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
                    imagen: user?.imagenu || '' // Conservamos la imagen por ahora
                });

                toast.success("¡Toda la información actualizada!");
                await checkAuth();
            } catch (error) {
                toast.error(error instanceof ApiError ? error.message : "Error al actualizar la información");
            } finally {
                setLoading(false);
            }
        }
    });

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

    return (
        <>
            <h4 className="mb-4">Información Personal</h4>
            <form className="personal-info-form mb-5" onSubmit={handleSubmitHandle}>
                <div className="row">
                    <div className="col-md-8">
                        <div className="single-input-unit">
                            <label>Nombre de usuario</label>
                            <input
                                type="text"
                                value={handleValue}
                                onChange={(event) => setHandleValue(event.target.value.toLowerCase())}
                                disabled={handleLimitReached}
                                title={handleLimitReached ? 'Has alcanzado el límite de 2 cambios.' : undefined}
                                placeholder="ej. ana_garcia"
                            />
                            <span className="handle-counter">
                                Cambios disponibles: {availableHandleChanges} / 2
                            </span>
                            {handleLimitReached && (
                                <span className="text-muted d-block mt-1" style={{ fontSize: '12px' }}>
                                    Has alcanzado el límite de cambios para tu nombre de usuario.
                                </span>
                            )}
                            {handleChanged && handleFormatIsValid && handleAvailable === false && (
                                <span className="text-danger d-block mt-1" style={{ fontSize: '12px' }}>
                                    Ese nombre de usuario ya está ocupado.
                                </span>
                            )}
                            {handleChanged && handleFormatIsValid && handleAvailable === true && (
                                <span className="text-success d-block mt-1" style={{ fontSize: '12px' }}>
                                    Nombre disponible.
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                        <button
                            type="submit"
                            className="fill-btn mb-30"
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
                </div>
            </form>
            <form className="personal-info-form mb-5" onSubmit={formik.handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Nombre(s)</label>
                            <input type="text" {...formik.getFieldProps('firstName')} />
                            {renderError('firstName')}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Apellido(s)</label>
                            <input type="text" {...formik.getFieldProps('lastName')} />
                            {renderError('lastName')}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Género</label>
                            <select className="form-control" style={{ height: '55px', borderRadius: '5px', border: '1px solid #e0e0e0' }} {...formik.getFieldProps('genid')}>
                                <option value="" disabled>Seleccione...</option>
                                {genders.map((g) => (
                                    <option key={g.gen_id} value={g.gen_id}>{g.gen_description}</option>
                                ))}
                            </select>
                            {renderError('genid')}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" {...formik.getFieldProps('birthday')} />
                            {renderError('birthday')}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Teléfono</label>
                            <input type="text" maxLength={8} {...formik.getFieldProps('phone')} 
                                onKeyDown={(e) => { if (!/^[0-9]*$/.test(e.key) && e.key !== 'Backspace') e.preventDefault(); }}
                            />
                            {renderError('phone')}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Idioma Preferido</label>
                            <select className="form-control" style={{ height: '55px', borderRadius: '5px', border: '1px solid #e0e0e0' }} {...formik.getFieldProps('lang')}>
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                            {renderError('lang')}
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="single-input-unit">
                            <label>Dirección / Municipio</label>
                            <textarea rows={3} style={{ width: '100%', padding: '15px', borderRadius: '5px', border: '1px solid #e0e0e0' }} {...formik.getFieldProps('address')}></textarea>
                            {renderError('address')}
                        </div>
                    </div>
                </div>

                <div className="personal-info-btn mt-3">
                    <button type="submit" className="fill-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Información Personal'}
                    </button>
                </div>
            </form>
        </>
    );
};
export default PersonalInfoTab;
