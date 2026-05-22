"use client";
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { uploadImage } from '@/utils/uploadImage';
import ImageCropperModal from '@/components/common/ImageCropperModal';
import { useVerificationStatus, useRequestVerification } from '@/hooks/api/useVerification';
import type { VerificationStatus } from '@/types/api';

type VerType = 'personal' | 'business';

const STATUS_LABEL: Record<VerificationStatus, string> = {
  unverified: 'Sin verificar',
  pending: 'En revisión',
  verified: 'Verificado',
  rejected: 'Rechazada',
};

/** Banner del estado actual (verificado / en revisión / rechazado). */
const StatusBanner = ({ status, reason }: { status: VerificationStatus; reason?: string | null }) => {
  if (status === 'verified') {
    return (
      <div className="vt-banner vt-ok">
        <i className="fas fa-check-circle" /> Identidad verificada. ¡Tu check ya es visible!
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="vt-banner vt-pending">
        <i className="fas fa-clock" /> En revisión. Soporte validará tu documento pronto.
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="vt-banner vt-rejected">
        <i className="fas fa-times-circle" /> Solicitud rechazada
        {reason ? `: ${reason}` : '.'} Puedes corregir y volver a enviar.
      </div>
    );
  }
  return null;
};

/** Formulario de una verificación (personal o empresa). */
const VerifyForm = ({
  type,
  status,
  reason,
}: {
  type: VerType;
  status: VerificationStatus;
  reason?: string | null;
}) => {
  const requestMutation = useRequestVerification();
  const [doc, setDoc] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isPersonal = type === 'personal';
  const docLabel = isPersonal ? 'Número de DPI' : 'Número de NIT';
  const docPlaceholder = isPersonal ? '0000 00000 0000' : '0000000-0';

  // Verificado o en revisión → solo banner, sin formulario.
  const editable = status === 'unverified' || status === 'rejected';

  const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen del documento.');
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropped = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadImage(file, 'detail');
      setImagePath(path);
      toast.success('Documento adjuntado.');
      closeCropper();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doc.trim().length < 5) {
      toast.error('Ingresa un número de documento válido.');
      return;
    }
    if (!imagePath) {
      toast.error('Adjunta una foto del documento.');
      return;
    }
    requestMutation.mutate(
      { type, document: doc.trim(), documentImage: imagePath },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'Solicitud enviada.');
          setDoc('');
          setImagePath(null);
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : 'No se pudo enviar la solicitud'),
      },
    );
  };

  return (
    <div className="vt-section">
      <h5 className="vt-title">
        {isPersonal ? 'Verificación personal (DPI)' : 'Verificación empresarial (NIT)'}
        <span className={`vt-chip vt-chip-${status}`}>{STATUS_LABEL[status]}</span>
      </h5>

      <StatusBanner status={status} reason={reason} />

      {editable && (
        <form className="personal-info-form mt-3" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="single-input-unit">
                <label>{docLabel}</label>
                <input
                  type="text"
                  placeholder={docPlaceholder}
                  value={doc}
                  onChange={(e) => setDoc(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-input-unit">
                <label>Foto del documento</label>
                <div className="vt-doc-row">
                  {imagePath ? (
                    <span className="vt-doc-ok"><i className="fas fa-check" /> Adjuntado</span>
                  ) : (
                    <span className="vt-doc-empty">Sin adjuntar</span>
                  )}
                  <button
                    type="button"
                    className="vt-doc-btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Subiendo…' : imagePath ? 'Cambiar' : 'Adjuntar'}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={onPickFile}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="vt-note">
            Tu documento es privado: solo lo usa nuestro equipo de soporte para validar tu
            identidad. No se muestra en tu perfil.
          </p>

          <div className="personal-info-btn mt-2">
            <button type="submit" className="fill-btn" disabled={requestMutation.isPending}>
              {requestMutation.isPending ? 'Enviando…' : 'Enviar a revisión'}
            </button>
          </div>
        </form>
      )}

      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          aspect={1.585}
          cropShape="rect"
          title="Encuadra tu documento"
          busy={uploading}
          onCancel={closeCropper}
          onConfirm={handleCropped}
        />
      )}
    </div>
  );
};

const VerifyAccountTab = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useVerificationStatus();

  if (isLoading) return <p style={{ opacity: 0.6 }}>Cargando estado de verificación…</p>;
  if (isError || !data) return <p className="text-danger">No se pudo cargar el estado de verificación.</p>;

  return (
    <>
      <h4 className="mb-2">Verificar cuenta</h4>
      <p className="text-muted mb-4">
        Verifica tu identidad para obtener el check {user ? `(${user.firstName})` : ''}. Soporte
        revisa cada solicitud manualmente.
      </p>

      <VerifyForm
        type="personal"
        status={data.personal.status}
        reason={data.personal.rejectReason}
      />

      {data.canRequestBusiness && data.business && (
        <>
          <hr className="my-4" />
          <VerifyForm
            type="business"
            status={data.business.status}
            reason={data.business.rejectReason}
          />
        </>
      )}

      <style jsx>{`
        .vt-section {
          margin-bottom: 8px;
        }
        .vt-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          margin-bottom: 14px;
        }
        .vt-chip {
          font-size: 12px;
          font-weight: 600;
          padding: 3px 12px;
          border-radius: 20px;
        }
        .vt-chip-unverified { background: rgba(128,128,128,0.15); color: #777; }
        .vt-chip-pending { background: rgba(245,158,11,0.15); color: #b8860b; }
        .vt-chip-verified { background: rgba(34,197,94,0.15); color: #16a34a; }
        .vt-chip-rejected { background: rgba(239,68,68,0.15); color: #dc2626; }
        .vt-banner {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
        }
        .vt-ok { background: rgba(34,197,94,0.1); color: #16a34a; }
        .vt-pending { background: rgba(245,158,11,0.1); color: #b8860b; }
        .vt-rejected { background: rgba(239,68,68,0.1); color: #dc2626; }
        .vt-doc-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .vt-doc-ok { color: #16a34a; font-weight: 600; }
        .vt-doc-empty { color: #999; }
        .vt-doc-btn {
          padding: 8px 18px;
          border-radius: 24px;
          border: 1px solid var(--clr-theme-1, #6c5ce7);
          background: transparent;
          color: var(--clr-theme-1, #6c5ce7);
          font-weight: 600;
          cursor: pointer;
        }
        .vt-doc-btn:disabled { opacity: 0.6; cursor: default; }
        .vt-note {
          font-size: 12px;
          opacity: 0.6;
          margin: 10px 0 0;
        }
      `}</style>
    </>
  );
};

export default VerifyAccountTab;
