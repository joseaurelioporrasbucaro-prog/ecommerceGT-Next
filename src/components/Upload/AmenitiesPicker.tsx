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
}

const AmenitiesPicker: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const { grouped, isLoading } = useAmenitiesGrouped();
  const selected = new Set(value);

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
      <p className="amp-intro">
        Marcá las comodidades que ofrece la propiedad. Los compradores las
        usan como filtro.
      </p>

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
          background: var(--clr-bg-gray, #f9f9f9);
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 12px;
          padding: 20px;
        }
        .amp-loading {
          padding: 16px;
          text-align: center;
          opacity: 0.7;
          font-size: 14px;
        }
        .amp-intro {
          margin: 0 0 18px;
          font-size: 13.5px;
          color: var(--clr-common-body-text);
          line-height: 1.5;
        }
        .amp-group + .amp-group {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px dashed var(--clr-common-border, #e0e2e5);
        }
        .amp-group-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--clr-common-heading);
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
          background: var(--clr-bg-white, #fff);
          border: 1.5px solid var(--clr-common-border, #e0e2e5);
          border-radius: 22px;
          font-size: 13px;
          font-weight: 600;
          color: var(--clr-common-heading);
          cursor: pointer;
          transition: all 0.15s;
          user-select: none;
        }
        .amp-chip:hover:not(:disabled) {
          border-color: var(--clr-theme-1, #2785ff);
          color: var(--clr-theme-1, #2785ff);
        }
        .amp-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .amp-chip.is-selected {
          background: var(--clr-theme-1, #2785ff);
          border-color: var(--clr-theme-1, #2785ff);
          color: #fff;
        }
        .amp-chip.is-selected:hover {
          color: #fff;
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
