"use client";
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiError } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import { uploadVerificationFile } from '@/utils/uploadVerificationFile';
import ImageCropperModal from '@/components/common/ImageCropperModal';
import { useVerificationStatus, useRequestVerification } from '@/hooks/api/useVerification';
import type { VerificationStatus } from '@/types/api';

type VerType = 'personal' | 'business';
type DpiSide = 'front' | 'back';

const STATUS_LABEL: Record<VerificationStatus, string> = {
  unverified: 'Sin verificar',
  pending: 'En revisión',
  verified: 'Verificado',
  rejected: 'Rechazada',
};

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
  // personal: frente/reverso del DPI. business: PDF del RTU en frontImage.
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropSide, setCropSide] = useState<DpiSide>('front');
  const [busy, setBusy] = useState(false);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const isPersonal = type === 'personal';
  const editable = status === 'unverified' || status === 'rejected';

  // ── DPI: seleccionar foto de un lado → abre el cropper ──
  const onPickDpi = (side: DpiSide) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen.');
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    setCropSide(side);
  };

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropped = async (file: File) => {
    setBusy(true);
    try {
      const path = await uploadVerificationFile(file);
      if (cropSide === 'front') setFrontImage(path);
      else setBackImage(path);
      toast.success(`Foto del ${cropSide === 'front' ? 'frente' : 'reverso'} adjuntada.`);
      closeCropper();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo subir la foto');
    } finally {
      setBusy(false);
    }
  };

  // ── RTU: subir PDF ──
  const onPickPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('El RTU debe ser un archivo PDF.');
      return;
    }
    setBusy(true);
    try {
      const path = await uploadVerificationFile(file);
      setFrontImage(path);
      toast.success('RTU adjuntado.');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo subir el PDF');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doc.trim().length < 5) {
      toast.error('Ingresa un número de documento válido.');
      return;
    }
    if (isPersonal && (!frontImage || !backImage)) {
      toast.error('Adjunta ambos lados del DPI (frente y reverso).');
      return;
    }
    if (!isPersonal && !frontImage) {
      toast.error('Adjunta el PDF del RTU.');
      return;
    }
    requestMutation.mutate(
      {
        type,
        document: doc.trim(),
        documentImage: frontImage ?? undefined,
        documentImageBack: isPersonal ? backImage ?? undefined : undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'Solicitud enviada.');
          setDoc('');
          setFrontImage(null);
          setBackImage(null);
        },
        onError: (err) =>
          toast.error(err instanceof ApiError ? err.message : 'No se pudo enviar la solicitud'),
      },
    );
  };

  return (
    <div className="vt-section">
      <h5 className="vt-title">
        {isPersonal ? 'Verificación personal (DPI)' : 'Verificación empresarial (RTU)'}
        <span className={`vt-chip vt-chip-${status}`}>{STATUS_LABEL[status]}</span>
      </h5>

      <StatusBanner status={status} reason={reason} />

      {editable && (
        <form className="personal-info-form mt-3" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="single-input-unit">
                <label>{isPersonal ? 'Número de DPI' : 'Número de NIT'}</label>
                <input
                  type="text"
                  placeholder={isPersonal ? '0000 00000 0000' : '0000000-0'}
                  value={doc}
                  onChange={(e) => setDoc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isPersonal ? (
            <>
              <label className="vt-doc-label">Fotos del DPI (frente y reverso)</label>
              <div className="vt-doc-grid">
                <div className="vt-doc-slot">
                  <span className="vt-doc-slot-name">Frente</span>
                  {frontImage ? (
                    <span className="vt-doc-ok"><i className="fas fa-check" /> Listo</span>
                  ) : (
                    <span className="vt-doc-empty">Sin adjuntar</span>
                  )}
                  <button type="button" className="vt-doc-btn" onClick={() => frontRef.current?.click()} disabled={busy}>
                    {frontImage ? 'Cambiar' : 'Adjuntar'}
                  </button>
                  <input ref={frontRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickDpi('front')} />
                </div>
                <div className="vt-doc-slot">
                  <span className="vt-doc-slot-name">Reverso</span>
                  {backImage ? (
                    <span className="vt-doc-ok"><i className="fas fa-check" /> Listo</span>
                  ) : (
                    <span className="vt-doc-empty">Sin adjuntar</span>
                  )}
                  <button type="button" className="vt-doc-btn" onClick={() => backRef.current?.click()} disabled={busy}>
                    {backImage ? 'Cambiar' : 'Adjuntar'}
                  </button>
                  <input ref={backRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickDpi('back')} />
                </div>
              </div>
              <p className="vt-warn">
                <i className="fas fa-exclamation-triangle" /> Los datos del DPI deben verse
                completos y legibles en ambas fotos. Si no se leen, la solicitud será rechazada.
              </p>
            </>
          ) : (
            <>
              <label className="vt-doc-label">RTU (PDF)</label>
              <div className="vt-doc-row">
                {frontImage ? (
                  <span className="vt-doc-ok"><i className="fas fa-file-pdf" /> RTU adjuntado</span>
                ) : (
                  <span className="vt-doc-empty">Sin adjuntar</span>
                )}
                <button type="button" className="vt-doc-btn" onClick={() => pdfRef.current?.click()} disabled={busy}>
                  {busy ? 'Subiendo…' : frontImage ? 'Cambiar' : 'Adjuntar PDF'}
                </button>
                <input ref={pdfRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={onPickPdf} />
              </div>
              <p className="vt-warn">
                <i className="fas fa-exclamation-triangle" /> Sube el RTU en PDF con los datos de
                la empresa legibles. Si no se leen, la solicitud será rechazada.
              </p>
            </>
          )}

          <p className="vt-note">
            Tu documento es privado: solo lo usa soporte para validar tu identidad. No se muestra
            en tu perfil.
          </p>

          <div className="personal-info-btn mt-2">
            <button type="submit" className="fill-btn" disabled={requestMutation.isPending || busy}>
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
          title={`Encuadra el ${cropSide === 'front' ? 'frente' : 'reverso'} de tu DPI`}
          busy={busy}
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

      <VerifyForm type="personal" status={data.personal.status} reason={data.personal.rejectReason} />

      {data.canRequestBusiness && data.business && (
        <>
          <hr className="my-4" />
          <VerifyForm type="business" status={data.business.status} reason={data.business.rejectReason} />
        </>
      )}

      <style jsx>{`
        .vt-section { margin-bottom: 8px; }
        .vt-title {
          display: flex; align-items: center; gap: 12px;
          font-size: 18px; margin-bottom: 14px;
        }
        .vt-chip { font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 20px; }
        .vt-chip-unverified { background: rgba(128,128,128,0.15); color: #777; }
        .vt-chip-pending { background: rgba(245,158,11,0.15); color: #b8860b; }
        .vt-chip-verified { background: rgba(34,197,94,0.15); color: #16a34a; }
        .vt-chip-rejected { background: rgba(239,68,68,0.15); color: #dc2626; }
        .vt-banner {
          display: flex; align-items: center; gap: 9px;
          padding: 12px 16px; border-radius: 10px; font-size: 14px;
        }
        .vt-ok { background: rgba(34,197,94,0.1); color: #16a34a; }
        .vt-pending { background: rgba(245,158,11,0.1); color: #b8860b; }
        .vt-rejected { background: rgba(239,68,68,0.1); color: #dc2626; }
        .vt-doc-label { display: block; font-weight: 600; margin: 6px 0 10px; }
        .vt-doc-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 575px) { .vt-doc-grid { grid-template-columns: 1fr; } }
        .vt-doc-slot {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 12px 14px; border: 1px solid rgba(128,128,128,0.25); border-radius: 10px;
        }
        .vt-doc-slot-name { font-weight: 600; min-width: 56px; }
        .vt-doc-row { display: flex; align-items: center; gap: 12px; }
        .vt-doc-ok { color: #16a34a; font-weight: 600; }
        .vt-doc-empty { color: #999; }
        .vt-doc-btn {
          padding: 7px 16px; border-radius: 24px; margin-left: auto;
          border: 1px solid var(--clr-theme-1, #6c5ce7);
          background: transparent; color: var(--clr-theme-1, #6c5ce7);
          font-weight: 600; cursor: pointer;
        }
        .vt-doc-btn:disabled { opacity: 0.6; cursor: default; }
        .vt-warn {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 13px; color: #b8860b; margin: 12px 0 0;
        }
        .vt-note { font-size: 12px; opacity: 0.6; margin: 10px 0 0; }
      `}</style>
    </>
  );
};

export default VerifyAccountTab;
