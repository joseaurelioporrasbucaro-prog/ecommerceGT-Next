"use client"
import React, { useState } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGenders } from '@/hooks/api/useCatalogs';

const PersonalInfoTab = () => {
    const { user, checkAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const { data: genders = [] } = useGenders();

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
                await ApiFetch.post('/changeinfoa', {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    birthday: values.birthday,
                    genid: values.genid,
                    lang: values.lang
                });

                // 2. Enviamos Datos de Contacto/Ubicación
                await ApiFetch.post('/changeinfob', {
                    phone: values.phone,
                    address: values.address,
                    imagen: user?.imagenu || '' // Conservamos la imagen por ahora
                });

                toast.success("¡Toda la información actualizada!");
                await checkAuth();
            } catch (error) {
                toast.error("Error al actualizar la información");
            } finally {
                setLoading(false);
            }
        }
    });

    const renderError = (field: string) => {
        if (formik.touched[field as keyof typeof formik.values] && formik.errors[field as keyof typeof formik.values]) {
            return <span className="text-danger" style={{ fontSize: '12px' }}>{formik.errors[field as keyof typeof formik.values] as string}</span>;
        }
        return null;
    };

    return (
        <>
            <h4 className="mb-4">Información Personal</h4>
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
