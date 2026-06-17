"use client";
import React from 'react';
import { useAmenitiesGrouped } from '@/hooks/api/useAmenities';

/**
 * Fase 19.5 — selector de amenidades para el form de publicación.
 *
 * Renderiza chips clickeables agrupados por categoría
 * (Condominio / Interior / Exterior / Seguridad / Servicios). El padre
 * controla la selección via prop `value: number[]` y `onChange`.
 *
 * Diseño: chip outline cuando no seleccionado, chip relleno con check
 * cuando seleccionado. Click toggle. Cero estado interno → fácil de
 * resetear desde el padre y compatible con Formik.
 */
interface Props {
  value: number[];
  onChange: (next: number[]) => void;
  disabled?: boolean;
  /** Texto introductorio. `undefined` = copy por defecto (form de publicación);
   * `null` = sin intro (ej. en filtros, donde el popover ya rotula el contexto). */
  intro?: React.ReactNode;
}

const DEFAULT_INTRO =
  'Marcá las comodidades que ofrece la propiedad. Los compradores las usan como filtro.';

const AmenitiesPicker: React.FC<Props> = ({ value, onChange, disabled = false, intro }) => {
  const { grouped, isLoading } = useAmenitiesGrouped();
  const selected = new Set(value);
  const introNode = intro === undefined ? DEFAULT_INTRO : intro;

  const toggle = (amenId: number) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(amenId)) next.delete(amenId);
    else next.add(amenId);
    onChange(Array.from(next));
  };

  if (isLoading) {
    return (
      <div className="amp-loading">
        <i className="fal fa-spinner fa-spin" /> Cargando amenidades…
      </div>
    );
  }

  if (grouped.length === 0) {
    return null;
  }

  return (
    <div className="amenities-picker">
      {introNode && <p className="amp-intro">{introNode}</p>}

      {grouped.map((group) => (
        <div key={group.category} className="amp-group">
          <h5 className="amp-group-title">{group.label}</h5>
          <div className="amp-chips">
            {group.items.map((a) => {
              const isSelected = selected.has(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`amp-chip ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => toggle(a.id)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                >
                  {a.icon && <i className={`fas ${a.icon} amp-chip-icon`} />}
                  <span>{a.name}</span>
                  {isSelected && (
                    <i className="fas fa-check amp-chip-check" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <style jsx>{`
        .amenities-picker {
          background: var(--surface-sunk);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
        }
        .amp-loading {
          padding: 16px;
          text-align: center;
          color: var(--fg-muted);
          font-size: 14px;
        }
        .amp-intro {
          margin: 0 0 18px;
          font-size: 13.5px;
          color: var(--fg-muted);
          line-height: 1.5;
        }
        .amp-group + .amp-group {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px dashed var(--border);
        }
        .amp-group-title {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--fg-strong);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin: 0 0 12px;
        }
        .amp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .amp-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px 8px 12px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          color: var(--fg-strong);
          cursor: pointer;
          transition: all 0.15s;
          user-select: none;
        }
        .amp-chip:hover:not(:disabled) {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        .amp-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .amp-chip.is-selected {
          background: var(--navy-800);
          border-color: var(--navy-800);
          color: var(--cream);
        }
        .amp-chip.is-selected:hover {
          color: var(--cream);
        }
        [data-theme='dark'] .amp-chip.is-selected {
          background: var(--lav-500);
          border-color: var(--lav-500);
          color: var(--navy-900);
        }
        .amp-chip-icon {
          font-size: 13px;
        }
        .amp-chip-check {
          font-size: 10px;
          margin-left: 2px;
        }
      `}</style>
    </div>
  );
};

export default AmenitiesPicker;
