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
                const res = await ApiFetch.post<{ message?: string }>('/changepwd', {
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
            return <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{formik.errors[field as keyof typeof formik.values] as string}</span>;
        }
        return null;
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
            {/* ── Card: correo electrónico (solo lectura) ── */}
            <div className="kq-card" style={{ padding: 28, marginBottom: 24 }}>
                <h3 style={cardTitle}>Correo electrónico</h3>
                <p style={cardSub}>Para cambiar tu correo, escribinos a soporte.</p>
                <div>
                    <label style={label}>Correo electrónico actual</label>
                    <input
                        type="email"
                        className="kq-input"
                        readOnly
                        defaultValue={user?.email || ''}
                        style={{ background: 'var(--surface-sunk)', color: 'var(--fg-muted)' }}
                    />
                </div>
            </div>

            {/* ── Card: cambiar contraseña ── */}
            <form className="kq-card" style={{ padding: 28, marginBottom: 24 }} onSubmit={formik.handleSubmit}>
                <h3 style={cardTitle}>Cambiar contraseña</h3>
                <p style={cardSub}>Usá una contraseña de al menos 8 caracteres con una mayúscula y un número.</p>
                <div>
                    <label style={label}>Contraseña actual</label>
                    <input type="password" className="kq-input" placeholder="********" {...formik.getFieldProps('lastPwd')} />
                    {renderError('lastPwd')}
                </div>
                <div style={{ ...grid2, marginTop: 18 }}>
                    <div>
                        <label style={label}>Nueva contraseña</label>
                        <input type="password" className="kq-input" placeholder="********" {...formik.getFieldProps('password')} />
                        {renderError('password')}
                    </div>
                    <div>
                        <label style={label}>Confirmar nueva contraseña</label>
                        <input type="password" className="kq-input" placeholder="********" {...formik.getFieldProps('confirmPassword')} />
                        {renderError('confirmPassword')}
                    </div>
                </div>

                <div style={{ marginTop: 22 }}>
                    <button type="submit" className="kq-btn kq-btn--action" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                    </button>
                </div>
            </form>
        </>
    );
};
export default AccountSettingsTab;