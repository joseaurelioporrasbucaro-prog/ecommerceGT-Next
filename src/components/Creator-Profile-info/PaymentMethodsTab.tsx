"use client";
import React, { useState } from 'react';
import Modal from 'react-responsive-modal';
import {
  usePaymentMethods,
  useAddPaymentMethod,
  useDeletePaymentMethod,
  useSetPaymentMethodDefault,
  type PaymentMethod,
  type PaymentMethodType,
  type AddPaymentMethodPayload,
} from '@/hooks/api/usePaymentMethods';
import CardPreview, { type CardFocus } from './CardPreview';

/**
 * Fase 11 — feature flags por tipo de método.
 *
 * Hoy solo habilitamos tarjeta. Los chips de transfer/wallet se ocultan
 * pero el backend ya los soporta — cambiar a `true` aquí los reactiva
 * sin necesidad de redeploy del backend.
 */
const ENABLED_PM_TYPES: Record<PaymentMethodType, boolean> = {
  card: true,
  transfer: false,
  wallet: false,
};

/**
 * Fase 11 — UI de métodos de pago en el perfil.
 *
 * Stub de pasarela: el form pide los datos directamente y genera un token
 * mock en cliente. Cuando llegue Fase 11.2 (Recurrente/NeoNet/Stripe), este
 * componente cambia para usar el SDK del proveedor que devuelve el token
 * tokenizado; el backend NO cambia (sigue recibiendo el mismo payload).
 *
 * IMPORTANTE PCI: el form pide número completo y CVV de tarjeta SOLO para
 * mostrar el flow al usuario y testear validaciones de UI; pero el cliente
 * NUNCA envía el número completo ni el CVV al backend — solo los últimos 4
 * dígitos + token mock. En producción, este form se reemplaza completo por
 * el iframe/widget del proveedor de pagos.
 */

const TYPE_META: Record<PaymentMethodType, { label: string; icon: string }> = {
  card: { label: 'Tarjeta', icon: 'fa-credit-card' },
  transfer: { label: 'Transferencia bancaria', icon: 'fa-university' },
  wallet: { label: 'Billetera digital', icon: 'fa-wallet' },
};

const BRAND_META: Record<string, { icon: string; color: string }> = {
  visa: { icon: 'fa-cc-visa', color: '#1a1f71' },
  mastercard: { icon: 'fa-cc-mastercard', color: '#eb001b' },
  amex: { icon: 'fa-cc-amex', color: '#006fcf' },
  discover: { icon: 'fa-cc-discover', color: '#ff6000' },
};

const generateMockToken = () =>
  `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const PaymentMethodsTab: React.FC = () => {
  const { data, isLoading } = usePaymentMethods();
  const addMut = useAddPaymentMethod();
  const removeMut = useDeletePaymentMethod();
  const defaultMut = useSetPaymentMethodDefault();

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<PaymentMethodType>('card');
  const [label, setLabel] = useState('');
  // Card
  const [brand, setBrand] = useState('visa');
  const [cardNumber, setCardNumber] = useState(''); // NO se envía completo
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [holderName, setHolderName] = useState('');
  // Foco para el preview dinámico de la tarjeta.
  const [cardFocus, setCardFocus] = useState<CardFocus>(null);
  // Transfer
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'ahorro' | 'monetario'>('ahorro');
  // Wallet
  const [walletProvider, setWalletProvider] = useState('paypal');
  const [walletHandle, setWalletHandle] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);

  const items = data ?? [];

  const resetForm = () => {
    setType('card');
    setLabel('');
    setBrand('visa');
    setCardNumber('');
    setExpMonth('');
    setExpYear('');
    setHolderName('');
    setBankName('');
    setAccountType('ahorro');
    setWalletProvider('paypal');
    setWalletHandle('');
    setMakeDefault(false);
  };

  const close = () => {
    if (addMut.isPending) return;
    setModalOpen(false);
    resetForm();
  };

  const submit = () => {
    let payload: AddPaymentMethodPayload;
    if (type === 'card') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (digits.length < 13) {
        alert('Número de tarjeta inválido.');
        return;
      }
      const last4 = digits.slice(-4);
      payload = {
        type,
        label: label || undefined,
        brand,
        last4,
        expMonth: Number(expMonth),
        expYear: Number(expYear),
        holderName,
        providerToken: generateMockToken(),
        provider: 'manual',
        makeDefault,
      };
    } else if (type === 'transfer') {
      payload = {
        type,
        label: label || undefined,
        bankName,
        accountType,
        providerToken: generateMockToken(),
        provider: 'manual',
        makeDefault,
      };
    } else {
      payload = {
        type,
        label: label || walletProvider,
        walletHandle,
        provider: walletProvider,
        providerToken: generateMockToken(),
        makeDefault,
      };
    }
    addMut.mutate(payload, {
      onSuccess: () => {
        setModalOpen(false);
        resetForm();
      },
    });
  };

  const renderMethodCard = (m: PaymentMethod) => {
    const brandKey = (m.brand || '').toLowerCase();
    const brandMeta = brandKey ? BRAND_META[brandKey] : undefined;
    const typeMeta = TYPE_META[m.type];

    return (
      <div key={m.id} className={`pm-card ${m.isDefault ? 'is-default' : ''}`}>
        <div className="pm-card-icon" style={brandMeta ? { color: brandMeta.color } : undefined}>
          <i className={`fab ${brandMeta?.icon ?? ''} fas ${typeMeta.icon}`} />
        </div>
        <div className="pm-card-info">
          <p className="pm-card-title">
            {m.label || typeMeta.label}
            {m.isDefault && <span className="kq-badge kq-badge--lav pm-default-badge">Principal</span>}
          </p>
          <p className="pm-card-detail">
            {m.type === 'card' && m.last4 && (
              <>
                {m.brand?.toUpperCase()} •••• {m.last4}
                {m.expMonth && m.expYear && (
                  <> · Vence {String(m.expMonth).padStart(2, '0')}/{String(m.expYear).slice(-2)}</>
                )}
              </>
            )}
            {m.type === 'transfer' && (
              <>{m.bankName} · {m.accountType}</>
            )}
            {m.type === 'wallet' && (
              <>{m.provider} · {m.walletHandle}</>
            )}
          </p>
        </div>
        <div className="pm-card-actions">
          {!m.isDefault && (
            <button
              type="button"
              className="pm-action-btn pm-action-primary"
              onClick={() => defaultMut.mutate(m.id)}
              disabled={defaultMut.isPending}
              title="Hacer principal"
            >
              <i className="fas fa-star" />
            </button>
          )}
          <button
            type="button"
            className="pm-action-btn pm-action-danger"
            onClick={() => {
              if (window.confirm('¿Eliminar este método de pago?')) {
                removeMut.mutate(m.id);
              }
            }}
            disabled={removeMut.isPending}
            title="Quitar"
          >
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="payment-methods-tab">
      <div className="pm-head">
        <div>
          <h4>Métodos de pago</h4>
          <p>Guardá tarjetas, cuentas y billeteras para pagar planes y pauta.</p>
        </div>
        <button
          type="button"
          className="kq-btn kq-btn--outline"
          onClick={() => setModalOpen(true)}
        >
          <i className="fas fa-plus" /> Agregar tarjeta
        </button>
      </div>

      {isLoading ? (
        <div className="pm-empty">Cargando métodos…</div>
      ) : items.length === 0 ? (
        <div className="pm-empty">
          <i className="fas fa-credit-card" />
          <p>Aún no tenés métodos de pago guardados.</p>
          <button
            type="button"
            className="kq-btn kq-btn--action"
            onClick={() => setModalOpen(true)}
          >
            Agregar mi primer método
          </button>
        </div>
      ) : (
        <div className="pm-list">{items.map(renderMethodCard)}</div>
      )}

      <Modal
        open={modalOpen}
        onClose={close}
        center
        styles={{
          overlay: { background: 'rgba(11,17,32,0.55)' },
          modal: {
            maxWidth: 540,
            width: '94%',
            padding: '28px 26px',
            borderRadius: 'var(--r-lg)',
            background: 'var(--surface)',
            color: 'var(--fg-strong)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          },
          closeButton: { display: 'none' },
        }}
      >
        <div className="pm-modal">
          <h4>Agregar método de pago</h4>

          {/* Selector de tipo: hoy solo mostramos los habilitados. Si solo
              hay uno habilitado, ocultamos el selector entero — no aporta. */}
          {(() => {
            const enabledTypes = (Object.keys(TYPE_META) as PaymentMethodType[])
              .filter((t) => ENABLED_PM_TYPES[t]);
            if (enabledTypes.length <= 1) return null;
            return (
              <div className="pm-type-selector">
                {enabledTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pm-type-chip ${type === t ? 'is-active' : ''}`}
                    onClick={() => setType(t)}
                  >
                    <i className={`fas ${TYPE_META[t].icon}`} /> {TYPE_META[t].label}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Preview animado de la tarjeta — solo cuando el tipo es card. */}
          {type === 'card' && (
            <CardPreview
              brand={brand}
              cardNumber={cardNumber}
              holderName={holderName}
              expMonth={expMonth}
              expYear={expYear}
              focus={cardFocus}
            />
          )}

          <label className="pm-field">
            <span>Etiqueta (opcional)</span>
            <input
              type="text"
              className="kq-input"
              placeholder="Ej. Visa principal, Cuenta Banrural, PayPal trabajo"
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 80))}
            />
          </label>

          {type === 'card' && (
            <>
              <label className="pm-field">
                <span>Marca</span>
                <select className="kq-input" value={brand} onChange={(e) => setBrand(e.target.value)}>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="discover">Discover</option>
                </select>
              </label>
              <label className="pm-field">
                <span>Número de tarjeta</span>
                <input
                  type="text"
                  className="kq-input"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
                  onFocus={() => setCardFocus('number')}
                  onBlur={() => setCardFocus(null)}
                />
                <small className="pm-note">
                  Solo guardaremos los últimos 4 dígitos. El número completo
                  nunca se envía a nuestros servidores.
                </small>
              </label>
              <div className="pm-row">
                <label className="pm-field">
                  <span>Mes (MM)</span>
                  <input
                    type="number"
                    className="kq-input"
                    min={1}
                    max={12}
                    placeholder="MM"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    onFocus={() => setCardFocus('exp')}
                    onBlur={() => setCardFocus(null)}
                  />
                </label>
                <label className="pm-field">
                  <span>Año (YYYY)</span>
                  <input
                    type="number"
                    className="kq-input"
                    min={new Date().getFullYear()}
                    max={2100}
                    placeholder="YYYY"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    onFocus={() => setCardFocus('exp')}
                    onBlur={() => setCardFocus(null)}
                  />
                </label>
              </div>
              <label className="pm-field">
                <span>Nombre del titular</span>
                <input
                  type="text"
                  className="kq-input"
                  autoComplete="cc-name"
                  placeholder="Tal como aparece en la tarjeta"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value.slice(0, 100))}
                  onFocus={() => setCardFocus('holder')}
                  onBlur={() => setCardFocus(null)}
                />
              </label>
            </>
          )}

          {type === 'transfer' && (
            <>
              <label className="pm-field">
                <span>Banco</span>
                <input
                  type="text"
                  className="kq-input"
                  placeholder="Ej. Banrural, BAM, BI, G&T..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value.slice(0, 80))}
                />
              </label>
              <label className="pm-field">
                <span>Tipo de cuenta</span>
                <select
                  className="kq-input"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as 'ahorro' | 'monetario')}
                >
                  <option value="ahorro">Ahorro</option>
                  <option value="monetario">Monetaria</option>
                </select>
              </label>
            </>
          )}

          {type === 'wallet' && (
            <>
              <label className="pm-field">
                <span>Proveedor</span>
                <select
                  className="kq-input"
                  value={walletProvider}
                  onChange={(e) => setWalletProvider(e.target.value)}
                >
                  <option value="paypal">PayPal</option>
                  <option value="tigo_money">Tigo Money</option>
                  <option value="claro_pay">Claro Pay</option>
                  <option value="otro">Otra</option>
                </select>
              </label>
              <label className="pm-field">
                <span>Identificador</span>
                <input
                  type="text"
                  className="kq-input"
                  placeholder="Email o teléfono asociado"
                  value={walletHandle}
                  onChange={(e) => setWalletHandle(e.target.value.slice(0, 100))}
                />
              </label>
            </>
          )}

          <label className="pm-ack">
            <input
              type="checkbox"
              checked={makeDefault}
              onChange={(e) => setMakeDefault(e.target.checked)}
            />
            <span>Marcar como método predeterminado para futuros cobros</span>
          </label>

          <div className="pm-modal-actions">
            <button type="button" className="kq-btn kq-btn--outline" onClick={close} disabled={addMut.isPending}>
              Cancelar
            </button>
            <button
              type="button"
              className="kq-btn kq-btn--action"
              onClick={submit}
              disabled={addMut.isPending}
            >
              {addMut.isPending ? 'Guardando…' : 'Guardar método'}
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .pm-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .pm-head h4 {
          margin: 0 0 4px;
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: var(--fg-strong);
        }
        .pm-head p {
          margin: 0;
          font-size: 13.5px;
          color: var(--fg-muted);
        }
        .pm-empty {
          padding: 50px 20px;
          text-align: center;
          background: var(--surface-sunk);
          border: 1px dashed var(--border-strong);
          border-radius: var(--r-lg);
          color: var(--fg-muted);
        }
        .pm-empty :global(i) {
          font-size: 40px;
          color: var(--fg-subtle);
          margin-bottom: 14px;
        }
        .pm-empty p {
          margin: 0 0 18px;
          color: var(--fg-muted);
        }
        .pm-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pm-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          box-shadow: var(--shadow-xs);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .pm-card.is-default {
          border: 1.5px solid var(--lav-500);
          box-shadow: 0 0 0 1px var(--lav-300);
        }
        .pm-card-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--r-sm);
          background: var(--surface-sunk);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .pm-card-info {
          flex: 1;
          min-width: 0;
        }
        .pm-card-title {
          margin: 0 0 4px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14.5px;
          color: var(--fg-strong);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pm-default-badge {
          font-size: 10.5px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .pm-card-detail {
          margin: 0;
          font-size: 13px;
          color: var(--fg-muted);
        }
        .pm-card-actions {
          display: flex;
          gap: 6px;
        }
        .pm-action-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--r-sm);
          border: 1.5px solid var(--border-strong);
          background: var(--surface);
          cursor: pointer;
          color: var(--fg-muted);
          font-size: 13px;
          transition: all 0.15s;
        }
        .pm-action-primary:hover {
          border-color: var(--lav-500);
          color: var(--lav-700);
          background: var(--lav-100);
        }
        .pm-action-danger:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: var(--danger-bg);
        }
        .pm-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pm-modal h4 {
          margin: 0 0 18px;
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: var(--fg-strong);
        }
        .pm-type-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .pm-type-chip {
          flex: 1;
          min-width: 0;
          padding: 10px 14px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--r-sm);
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 600;
          color: var(--fg-strong);
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .pm-type-chip:hover {
          border-color: var(--lav-500);
        }
        .pm-type-chip.is-active {
          border-color: var(--lav-500);
          background: var(--lav-200);
          color: var(--lav-700);
        }
        .pm-field {
          display: block;
          margin-bottom: 14px;
        }
        .pm-field > span {
          display: block;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--fg-strong);
          margin-bottom: 6px;
        }
        .pm-note {
          display: block;
          font-size: 11.5px;
          color: var(--fg-subtle);
          margin-top: 5px;
          line-height: 1.4;
        }
        .pm-row {
          display: flex;
          gap: 10px;
        }
        .pm-row .pm-field {
          flex: 1;
        }
        .pm-ack {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--fg);
          margin: 14px 0 18px;
          cursor: pointer;
        }
        .pm-ack :global(input) {
          accent-color: var(--lav-600);
          width: 17px;
          height: 17px;
          flex-shrink: 0;
        }
        .pm-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

export default PaymentMethodsTab;
