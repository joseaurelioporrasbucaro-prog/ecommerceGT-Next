"use client"
import React, { useState } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { ApiFetch } from '@/utils/Api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AccountSettingsTab = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            lastPwd: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            lastPwd: Yup.string().required('Requerido'),
            password: Yup.string()
                .min(8, 'Mínimo 8 caracteres')
                .matches(/[A-Z]/, 'Al menos una mayúscula')
                .matches(/[0-9]/, 'Al menos un número')
                .required('Requerido'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null as any], 'Las contraseñas no coinciden')
                .required('Requerido'),
        }),
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {
                const res = await ApiFetch.post('/changepwd', {
                    lastPwd: values.lastPwd,
                    password: values.password
                });
                toast.success(res.message || "¡Contraseña actualizada!");
                resetForm();
            } catch (error: any) {
                toast.error(error.message || "Error al cambiar contraseña");
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
            <h4 className="mb-4">Seguridad de la Cuenta</h4>
            
            {/* Solo Lectura: Email */}
            <div className="personal-info-form mb-5">
                <div className="row">
                    <div className="col-md-12">
                        <div className="single-input-unit">
                            <label>Correo Electrónico Actual</label>
                            <input type="email" readOnly defaultValue={user?.email || ''} style={{ backgroundColor: '#f5f5f5', color: '#888' }} />
                            <small className="text-muted mt-1 d-block">Para cambiar tu correo electrónico, por favor contacta a soporte.</small>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="mb-5"/>

            <h4 className="mb-4">Cambiar Contraseña</h4>
            <form className="personal-info-form" onSubmit={formik.handleSubmit}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="single-input-unit">
                            <label>Contraseña Actual</label>
                            <input type="password" placeholder="********" {...formik.getFieldProps('lastPwd')} />
                            {renderError('lastPwd')}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Nueva Contraseña</label>
                            <input type="password" placeholder="********" {...formik.getFieldProps('password')} />
                            {renderError('password')}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="single-input-unit">
                            <label>Confirmar Nueva Contraseña</label>
                            <input type="password" placeholder="********" {...formik.getFieldProps('confirmPassword')} />
                            {renderError('confirmPassword')}
                        </div>
                    </div>
                </div>

                <div className="personal-info-btn mt-3">
                    <button type="submit" className="fill-btn" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </div>
            </form>
        </>
    );
};
export default AccountSettingsTab;