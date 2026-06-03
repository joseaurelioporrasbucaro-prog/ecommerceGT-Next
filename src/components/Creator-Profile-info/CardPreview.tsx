"use client";
import React from 'react';

/**
 * Fase 11 — preview animado de la tarjeta de crédito mientras el
 * usuario llena el form de "Agregar método de pago".
 *
 * Inspirado en los checkouts modernos (Stripe Elements, Vue Card,
 * react-credit-cards). El usuario ve cómo se va armando su tarjeta
 * en tiempo real: número en grupos de 4, nombre del titular en
 * mayúsculas, vencimiento MM/YY, y el logo de marca cambia según la
 * marca seleccionada.
 *
 * Cuando hay foco activo en un campo del form, el `focus` prop
 * permite resaltar el área correspondiente de la tarjeta — guía
 * visual fuerte de qué dato está editando el usuario.
 *
 * Diseño:
 *   - 100% del ancho del contenedor, aspect 1.586 (proporción real).
 *   - Gradient con la marca activa para que se sienta "real".
 *   - Chip dorado tipo EMV centrado a la izquierda.
 *   - Logo de marca arriba a derecha — bus de íconos cc-{brand} de
 *     Font Awesome (vienen con el theme).
 */

export type CardFocus = 'number' | 'holder' | 'exp' | null;

interface Props {
  brand: string;
  /** Sin formato — el componente formatea con espacios. */
  cardNumber: string;
  holderName: string;
  /** "1" a "12" como string o "" vacío. */
  expMonth: string;
  /** "2026", "2030", etc. */
  expYear: string;
  focus?: CardFocus;
}

/**
 * Convierte "1234567812345678" → "1234 5678 1234 5678" (4-4-4-4) o
 * "374512345612345" → "3745 123456 12345" para AMEX (4-6-5).
 *
 * Si está vacío, rellena con bullets "•" para preservar el ancho.
 */
function formatNumberDisplay(digits: string, brand: string): string {
  const isAmex = brand.toLowerCase() === 'amex';
  const totalLen = isAmex ? 15 : 16;
  const padded = digits.padEnd(totalLen, '•');

  if (isAmex) {
    return `${padded.slice(0, 4)} ${padded.slice(4, 10)} ${padded.slice(10, 15)}`;
  }
  return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
}

const BRAND_GRADIENTS: Record<string, string> = {
  visa:       'linear-gradient(135deg, #1a1f71 0%, #4f5cb8 60%, #2c3aaa 100%)',
  mastercard: 'linear-gradient(135deg, #1a1a1a 0%, #3a2826 40%, #c44 100%)',
  amex:       'linear-gradient(135deg, #006fcf 0%, #4ea7f4 60%, #0a3a78 100%)',
  discover:   'linear-gradient(135deg, #ff6000 0%, #e85d04 60%, #722f00 100%)',
};

const BRAND_ICON: Record<string, string> = {
  visa: 'fa-cc-visa',
  mastercard: 'fa-cc-mastercard',
  amex: 'fa-cc-amex',
  discover: 'fa-cc-discover',
};

const CardPreview: React.FC<Props> = ({
  brand,
  cardNumber,
  holderName,
  expMonth,
  expYear,
  focus = null,
}) => {
  const digits = cardNumber.replace(/\s+/g, '');
  const formattedNumber = formatNumberDisplay(digits, brand);
  const expMM = (expMonth || '').padStart(2, '0').slice(0, 2);
  const expYY = (expYear || '').slice(-2).padEnd(2, '•');
  const expDisplay = expMonth || expYear ? `${expMM || '••'}/${expYY}` : '••/••';

  const gradient = BRAND_GRADIENTS[brand.toLowerCase()] || BRAND_GRADIENTS.visa;
  const brandIcon = BRAND_ICON[brand.toLowerCase()] || 'fa-credit-card';

  return (
    <div className="cp-wrap">
      <div className="cp-card" style={{ background: gradient }}>
        {/* Decoración: 3 círculos en esquina inferior izquierda para
            simular el detalle "ondas" de tarjetas reales. */}
        <div className="cp-decor cp-decor-1" />
        <div className="cp-decor cp-decor-2" />

        {/* Logo de marca arriba a derecha. Si la marca no tiene icono
            FA cc-*, mostramos el texto. */}
        <div className="cp-brand">
          {BRAND_ICON[brand.toLowerCase()] ? (
            <i className={`fab ${brandIcon}`} />
          ) : (
            <span>{brand.toUpperCase()}</span>
          )}
        </div>

        {/* Chip EMV tipo dorado. */}
        <div className="cp-chip">
          <div className="cp-chip-grid" />
        </div>

        {/* Número de tarjeta. Hold focus → light glow border. */}
        <div className={`cp-number ${focus === 'number' ? 'is-focused' : ''}`}>
          {formattedNumber}
        </div>

        {/* Footer: holder + exp. */}
        <div className="cp-footer">
          <div className={`cp-holder ${focus === 'holder' ? 'is-focused' : ''}`}>
            <span className="cp-label">Titular</span>
            <span className="cp-value">
              {holderName ? holderName.toUpperCase() : 'NOMBRE EN LA TARJETA'}
            </span>
          </div>
          <div className={`cp-exp ${focus === 'exp' ? 'is-focused' : ''}`}>
            <span className="cp-label">Vence</span>
            <span className="cp-value">{expDisplay}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cp-wrap {
          perspective: 1000px;
          width: 100%;
          max-width: 340px;
          margin: 0 auto 18px;
        }
        .cp-card {
          position: relative;
          width: 100%;
          aspect-ratio: 1.586 / 1;
          border-radius: 14px;
          color: #fff;
          padding: 18px 20px;
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          overflow: hidden;
          transition: background 0.35s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family:
            ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;
        }
        .cp-decor {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          pointer-events: none;
        }
        .cp-decor-1 {
          width: 180px;
          height: 180px;
          right: -60px;
          top: -60px;
        }
        .cp-decor-2 {
          width: 140px;
          height: 140px;
          left: -40px;
          bottom: -40px;
          background: rgba(255, 255, 255, 0.05);
        }
        .cp-brand {
          position: absolute;
          top: 16px;
          right: 18px;
          font-size: 30px;
          line-height: 1;
          z-index: 2;
        }
        .cp-brand :global(span) {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1.2px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .cp-chip {
          width: 38px;
          height: 28px;
          border-radius: 5px;
          background: linear-gradient(135deg, #d4a849 0%, #f0d484 50%, #b08820 100%);
          padding: 3px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
          position: relative;
          z-index: 2;
        }
        .cp-chip-grid {
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.3) 1px, transparent 1px);
          background-size: 7px 6px;
          border-radius: 3px;
        }
        .cp-number {
          font-size: clamp(16px, 4.5vw, 21px);
          letter-spacing: 1.5px;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          padding: 4px 0;
          border-radius: 4px;
          transition: background 0.2s, box-shadow 0.2s;
          position: relative;
          z-index: 2;
        }
        .cp-number.is-focused {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
        }
        .cp-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
          position: relative;
          z-index: 2;
        }
        .cp-holder {
          flex: 1;
          min-width: 0;
          padding: 4px 6px;
          border-radius: 4px;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .cp-exp {
          padding: 4px 6px;
          border-radius: 4px;
          transition: background 0.2s, box-shadow 0.2s;
          text-align: right;
        }
        .cp-holder.is-focused,
        .cp-exp.is-focused {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
        }
        .cp-label {
          display: block;
          font-size: 9.5px;
          letter-spacing: 1px;
          opacity: 0.75;
          text-transform: uppercase;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .cp-value {
          display: block;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CardPreview;
