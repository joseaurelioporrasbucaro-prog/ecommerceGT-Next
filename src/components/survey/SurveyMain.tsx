"use client";

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ThemeChanger from '@/components/home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import { useSubmitSurvey } from '@/hooks/api/useSubmitSurvey';

interface SurveyMainProps {
  token: string;
}

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 40,
            color: star <= (hovered || value) ? '#f59e0b' : 'rgba(128,128,128,0.3)',
            transition: 'color 0.12s',
            padding: '0 2px',
          }}
          title={`${star} estrella${star !== 1 ? 's' : ''}`}
          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const STAR_LABELS: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: '¡Excelente!',
};

const SurveyMain = ({ token }: SurveyMainProps) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const submitMutation = useSubmitSurvey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      toast.warning('Por favor selecciona una calificación (1 a 5 estrellas).');
      return;
    }
    submitMutation.mutate(
      { token, stars, comment },
      {
        onSuccess: (data) => {
          toast.success(data.message || '¡Gracias por tu calificación!');
          setDone(true);
        },
        onError: () => {
          toast.error('El enlace de encuesta es inválido o ya fue usado. Verifica el email.');
        },
      },
    );
  };

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Calificar vendedor" breadcrumbSubTitle="Calificar vendedor" />

      <section className="artworks-area pt-80 pb-90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-12">
              <div
                style={{
                  padding: '40px 36px',
                  borderRadius: 16,
                  border: '1px solid rgba(128,128,128,0.15)',
                  background: 'var(--clr-bg-white,#fff)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                }}
              >
                {done ? (
                  /* Estado final — éxito */
                  <>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        background: 'rgba(34,197,94,0.12)',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                      }}
                    >
                      <i className="fas fa-check" />
                    </div>
                    <h3 style={{ marginBottom: 12 }}>¡Gracias por tu opinión!</h3>
                    <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
                      Tu calificación ayuda a mantener una comunidad de vendedores confiable.
                    </p>
                  </>
                ) : (
                  /* Formulario de calificación */
                  <>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        margin: '0 auto 18px',
                        borderRadius: '50%',
                        background: 'rgba(245,158,11,0.12)',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                      }}
                    >
                      <i className="fas fa-star" />
                    </div>
                    <h3 style={{ marginBottom: 8 }}>Califica al vendedor</h3>
                    <p style={{ opacity: 0.65, marginBottom: 28, lineHeight: 1.5 }}>
                      ¿Cómo fue tu experiencia? Tu opinión es importante para la comunidad.
                    </p>

                    <form onSubmit={handleSubmit}>
                      <StarRating value={stars} onChange={setStars} />

                      {stars > 0 && (
                        <p
                          style={{
                            marginTop: -14,
                            marginBottom: 20,
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#f59e0b',
                          }}
                        >
                          {STAR_LABELS[stars]}
                        </p>
                      )}

                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Cuéntanos tu experiencia (opcional)..."
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(128,128,128,0.25)',
                          borderRadius: 10,
                          fontSize: 14,
                          lineHeight: 1.5,
                          resize: 'vertical',
                          background: 'var(--clr-bg-white,#fff)',
                          color: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box',
                          marginBottom: 24,
                        }}
                        maxLength={800}
                      />

                      <button
                        type="submit"
                        className="border-btn"
                        disabled={stars === 0 || submitMutation.isPending}
                        style={{
                          width: '100%',
                          height: 50,
                          fontSize: 16,
                          background:
                            stars > 0 && !submitMutation.isPending ? '#16a34a' : undefined,
                          borderColor:
                            stars > 0 && !submitMutation.isPending ? '#16a34a' : undefined,
                          color:
                            stars > 0 && !submitMutation.isPending ? '#fff' : undefined,
                          cursor:
                            stars === 0 || submitMutation.isPending ? 'not-allowed' : 'pointer',
                          opacity: stars === 0 || submitMutation.isPending ? 0.6 : 1,
                        }}
                      >
                        {submitMutation.isPending ? 'Enviando…' : 'Enviar calificación'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SurveyMain;
