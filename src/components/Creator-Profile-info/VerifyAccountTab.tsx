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

// Estilo del chip de estado según el estado actual de verificación.
const STATUS_CHIP: Record<VerificationStatus, React.CSSProperties> = {
  unverified: { background: 'var(--surface-sunk)', color: 'var(--fg-muted)' },
  pending: { background: 'var(--warning-bg)', color: '#9a5a12' },
  verified: { background: 'var(--green-100)', color: 'var(--green-800)' },
  rejected: { background: 'var(--danger-bg)', color: 'var(--danger)' },
};

const chipBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 12,
  padding: '4px 12px',
  borderRadius: 'var(--r-pill)',
  whiteSpace: 'nowrap',
};

const bannerBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '12px 16px',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  marginTop: 14,
};

const StatusBanner = ({ status, reason }: { status: VerificationStatus; reason?: string | null }) => {
  if (status === 'verified') {
    return (
      <div style={{ ...bannerBase, background: 'var(--green-100)', color: 'var(--green-800)' }}>
        <i className="fas fa-check-circle" /> Identidad verificada. ¡Tu check ya es visible!
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div style={{ ...bannerBase, background: 'var(--warning-bg)', color: '#9a5a12' }}>
        <i className="fas fa-clock" /> En revisión. Soporte validará tu documento pronto.
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div style={{ ...bannerBase, background: 'var(--danger-bg)', color: 'var(--danger)' }}>
        <i className="fas fa-times-circle" /> Solicitud rechazada
        {reason ? `: ${reason}` : '.'} Puedes corregir y volver a enviar.
      </div>
    );
  }
  return null;
};

// Estilos compartidos (Handoff §1: cards .kq-card + inputs .kq-input).
const sectionTitle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 18,
  color: 'var(--fg-strong)',
  margin: 0,
};
const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--fg-strong)',
  display: 'block',
  marginBottom: 7,
};
const docLabel: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--fg-strong)',
  margin: '18px 0 10px',
};
const docGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
};
const docSlot: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  padding: '14px 16px',
  border: '1px dashed var(--border-strong)',
  borderRadius: 'var(--r-md)',
  background: 'var(--surface-sunk)',
};
const docRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  padding: '14px 16px',
  border: '1px dashed var(--border-strong)',
  borderRadius: 'var(--r-md)',
  background: 'var(--surface-sunk)',
};
const slotName: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13.5,
  color: 'var(--fg-strong)',
  minWidth: 56,
};
const docOk: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'var(--green-700)',
  fontWeight: 600,
  fontSize: 13.5,
};
const docEmpty: React.CSSProperties = {
  color: 'var(--fg-subtle)',
  fontSize: 13.5,
};
const warnText: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  fontSize: 13,
  color: 'var(--fg-muted)',
  margin: '12px 0 0',
};
const noteText: React.CSSProperties = {
  fontSize: 12.5,
  color: 'var(--fg-muted)',
  margin: '10px 0 0',
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
    <div className="kq-card" style={{ padding: 28 }}>
      <h5 style={sectionTitle}>
        {isPersonal ? 'Verificación personal (DPI)' : 'Verificación empresarial (RTU)'}
        <span style={{ ...chipBase, ...STATUS_CHIP[status] }}>{STATUS_LABEL[status]}</span>
      </h5>

      <StatusBanner status={status} reason={reason} />

      {editable && (
        <form className="mt-3" onSubmit={handleSubmit}>
          <div style={{ maxWidth: 360 }}>
            <label style={fieldLabel}>{isPersonal ? 'Número de DPI' : 'Número de NIT'}</label>
            <input
              type="text"
              className="kq-input"
              placeholder={isPersonal ? '0000 00000 0000' : '0000000-0'}
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
            />
          </div>

          {isPersonal ? (
            <>
              <label style={docLabel}>Fotos del DPI (frente y reverso)</label>
              <div style={docGrid}>
                <div style={docSlot}>
                  <span style={slotName}>Frente</span>
                  {frontImage ? (
                    <span style={docOk}><i className="fas fa-check" /> Listo</span>
                  ) : (
                    <span style={docEmpty}>Sin adjuntar</span>
                  )}
                  <button
                    type="button"
                    className="kq-btn kq-btn--outline kq-btn--sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => frontRef.current?.click()}
                    disabled={busy}
                  >
                    {frontImage ? 'Cambiar' : 'Adjuntar'}
                  </button>
                  <input ref={frontRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickDpi('front')} />
                </div>
                <div style={docSlot}>
                  <span style={slotName}>Reverso</span>
                  {backImage ? (
                    <span style={docOk}><i className="fas fa-check" /> Listo</span>
                  ) : (
                    <span style={docEmpty}>Sin adjuntar</span>
                  )}
                  <button
                    type="button"
                    className="kq-btn kq-btn--outline kq-btn--sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => backRef.current?.click()}
                    disabled={busy}
                  >
                    {backImage ? 'Cambiar' : 'Adjuntar'}
                  </button>
                  <input ref={backRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickDpi('back')} />
                </div>
              </div>
              <p style={warnText}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#9a5a12', marginTop: 2 }} /> Los datos del DPI deben verse
                completos y legibles en ambas fotos. Si no se leen, la solicitud será rechazada.
              </p>
            </>
          ) : (
            <>
              <label style={docLabel}>RTU (PDF)</label>
              <div style={docRow}>
                {frontImage ? (
                  <span style={docOk}><i className="fas fa-file-pdf" /> RTU adjuntado</span>
                ) : (
                  <span style={docEmpty}>Sin adjuntar</span>
                )}
                <button
                  type="button"
                  className="kq-btn kq-btn--outline kq-btn--sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => pdfRef.current?.click()}
                  disabled={busy}
                >
                  {busy ? 'Subiendo…' : frontImage ? 'Cambiar' : 'Adjuntar PDF'}
                </button>
                <input ref={pdfRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={onPickPdf} />
              </div>
              <p style={warnText}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#9a5a12', marginTop: 2 }} /> Sube el RTU en PDF con los datos de
                la empresa legibles. Si no se leen, la solicitud será rechazada.
              </p>
            </>
          )}

          <p style={noteText}>
            Tu documento es privado: solo lo usa soporte para validar tu identidad. No se muestra
            en tu perfil.
          </p>

          <div style={{ marginTop: 18 }}>
            <button type="submit" className="kq-btn kq-btn--action" disabled={requestMutation.isPending || busy}>
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

  if (isLoading) return <p style={{ color: 'var(--fg-muted)' }}>Cargando estado de verificación…</p>;
  if (isError || !data) return <p style={{ color: 'var(--danger)' }}>No se pudo cargar el estado de verificación.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: 'var(--fg-strong)', margin: '0 0 4px' }}>
          Verificar cuenta
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--fg-muted)', margin: 0 }}>
          Verifica tu identidad para obtener el check {user ? `(${user.firstName})` : ''}. Soporte
          revisa cada solicitud manualmente.
        </p>
      </div>

      <VerifyForm type="personal" status={data.personal.status} reason={data.personal.rejectReason} />

      {data.canRequestBusiness && data.business && (
        <VerifyForm type="business" status={data.business.status} reason={data.business.rejectReason} />
      )}
    </div>
  );
};

export default VerifyAccountTab;
