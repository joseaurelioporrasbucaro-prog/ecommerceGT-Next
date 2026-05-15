"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import DragDropSection from './DragDropSection';
import { ApiError } from '@/utils/Api';
import {
  useCities,
  useCountries,
  useMunicipalities,
  usePublicationCategories,
  usePublicationTransactions,
} from '@/hooks/api/useCatalogs';
import { useCheckerPublications } from '@/hooks/api/useCheckerPublications';
import { useCreatePublication } from '@/hooks/api/useCreatePublication';
import type { UploadedImage } from '@/types/api';

const PUBGEN_CASA = 1;
const PUBGEN_APTO = 2;
const PUBGEN_TERRENO = 3;

interface FormValues {
  title: string;
  description: string;
  address: string;
  propertie: string;
  transaction: string;
  /** Valor numérico crudo ("250000.50") — el display con comas se maneja aparte. */
  price: string;
  currency: 'GTQ' | 'USD';
  country: string;
  city: string;
  municipality: string;
  noRooms: string;
  noBathrooms: string;
  noParking: string;
  nlevel: string;
  size: string;
}

const INITIAL_VALUES: FormValues = {
  title: '',
  description: '',
  address: '',
  propertie: '',
  transaction: '',
  price: '',
  currency: 'GTQ',
  country: '',
  city: '',
  municipality: '',
  noRooms: '',
  noBathrooms: '',
  noParking: '',
  nlevel: '',
  size: '',
};

/**
 * Formatea un string numérico crudo ("250000.5") al display "250,000.50".
 * Mantiene el punto decimal del usuario si aún está escribiendo decimales.
 */
function formatPriceDisplay(raw: string): string {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const intFormatted = intPart ? Number(intPart).toLocaleString('en-US') : '0';
  if (decPart === undefined) return intFormatted;
  // Mientras el usuario aún escribe decimales (ej. "250." o "250.5") respetamos lo que tipeó.
  return `${intFormatted}.${decPart}`;
}

/**
 * Parsea el display "250,000.50" → "250000.50" (crudo). Quita comas y cualquier
 * caracter no numérico salvo el primer punto decimal.
 */
function parsePriceInput(input: string): string {
  // Quitar comas y cualquier cosa que no sea dígito o punto.
  const cleaned = input.replace(/[^0-9.]/g, '');
  // Solo un punto decimal permitido — corta lo que venga después del segundo.
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
}

const isHouseLike = (value: unknown) => {
  const n = Number(value);
  return n === PUBGEN_CASA || n === PUBGEN_APTO;
};

const validationSchema = Yup.object({
  title: Yup.string().trim().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120').required('Título obligatorio'),
  description: Yup.string().trim().min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000').required('Descripción obligatoria'),
  address: Yup.string().trim().max(255, 'Máximo 255').required('Dirección obligatoria'),
  propertie: Yup.string().required('Selecciona el tipo de propiedad'),
  transaction: Yup.string().required('Selecciona el tipo de transacción'),
  price: Yup.number().typeError('Precio inválido').positive('Debe ser mayor a 0').required('Precio obligatorio'),
  country: Yup.string().required('Selecciona el país'),
  city: Yup.string().required('Selecciona la ciudad'),
  municipality: Yup.string().required('Selecciona el municipio'),
  noRooms: Yup.string().when('propertie', {
    is: isHouseLike,
    then: (s) => s.required('Habitaciones obligatorias').matches(/^\d+$/, 'Debe ser entero ≥ 0'),
    otherwise: (s) => s.notRequired(),
  }),
  noBathrooms: Yup.string().when('propertie', {
    is: isHouseLike,
    then: (s) => s.required('Baños obligatorios').matches(/^\d+$/, 'Debe ser entero ≥ 0'),
    otherwise: (s) => s.notRequired(),
  }),
  noParking: Yup.string().when('propertie', {
    is: isHouseLike,
    then: (s) => s.required('Parqueos obligatorios').matches(/^\d+$/, 'Debe ser entero ≥ 0'),
    otherwise: (s) => s.notRequired(),
  }),
  nlevel: Yup.string().when('propertie', {
    is: (v: unknown) => Number(v) === PUBGEN_APTO,
    then: (s) => s.required('Nivel obligatorio').matches(/^\d+$/, 'Debe ser entero ≥ 0'),
    otherwise: (s) => s.notRequired(),
  }),
  size: Yup.string().when('propertie', {
    is: (v: unknown) => Number(v) === PUBGEN_TERRENO,
    then: (s) => s.required('Tamaño obligatorio').matches(/^\d+(\.\d+)?$/, 'Número válido > 0'),
    otherwise: (s) => s.notRequired(),
  }),
});

const UploadMain: React.FC = () => {
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const checkerQuery = useCheckerPublications();
  const createMutation = useCreatePublication();

  const categoriesQuery = usePublicationCategories();
  const countriesQuery = useCountries();

  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema,
    onSubmit: async (values) => {
      if (images.length === 0) {
        setImagesError('Sube al menos una imagen.');
        return;
      }
      setImagesError(null);

      const propertieNum = Number(values.propertie);
      const isCasa = propertieNum === PUBGEN_CASA;
      const isApto = propertieNum === PUBGEN_APTO;
      const isTerreno = propertieNum === PUBGEN_TERRENO;

      try {
        const response = await createMutation.mutateAsync({
          title: values.title.trim(),
          description: values.description.trim(),
          address: values.address.trim(),
          propertie: propertieNum,
          transaction: Number(values.transaction),
          price: Number(values.price),
          currency: values.currency,
          country: Number(values.country),
          city: Number(values.city),
          municipality: Number(values.municipality),
          noRooms: isCasa || isApto ? Number(values.noRooms) : null,
          noBathrooms: isCasa || isApto ? Number(values.noBathrooms) : null,
          noParking: isCasa || isApto ? Number(values.noParking) : null,
          nlevel: isApto ? Number(values.nlevel) : null,
          size: isTerreno ? Number(values.size) : null,
          images,
        });
        toast.success('Publicación creada correctamente.');
        router.push(`/publications/${response.id}`);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudo crear la publicación.';
        toast.error(message);
      }
    },
  });

  const propertieNum = formik.values.propertie ? Number(formik.values.propertie) : null;
  const transactionsQuery = usePublicationTransactions(propertieNum);
  const countryNum = formik.values.country ? Number(formik.values.country) : null;
  const citiesQuery = useCities(countryNum);
  const cityNum = formik.values.city ? Number(formik.values.city) : null;
  const municipalitiesQuery = useMunicipalities(cityNum);

  // Re-evaluar validation schema cuando cambia el tipo de propiedad para que
  // los campos requeridos cambien en consecuencia.
  useEffect(() => {
    formik.setFormikState((prev) => ({ ...prev, errors: {} }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertieNum]);

  // Reset cascada: al cambiar país limpiar ciudad+municipio; al cambiar ciudad limpiar municipio.
  useEffect(() => {
    formik.setFieldValue('city', '', false);
    formik.setFieldValue('municipality', '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryNum]);
  useEffect(() => {
    formik.setFieldValue('municipality', '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityNum]);

  // Reset cascada: al cambiar propiedad limpiar transacción + campos específicos.
  useEffect(() => {
    formik.setFieldValue('transaction', '', false);
    formik.setFieldValue('noRooms', '', false);
    formik.setFieldValue('noBathrooms', '', false);
    formik.setFieldValue('noParking', '', false);
    formik.setFieldValue('nlevel', '', false);
    formik.setFieldValue('size', '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertieNum]);

  const showHouseFields = propertieNum === PUBGEN_CASA || propertieNum === PUBGEN_APTO;
  const showLevelField = propertieNum === PUBGEN_APTO;
  const showSizeField = propertieNum === PUBGEN_TERRENO;

  const submitting = createMutation.isPending || formik.isSubmitting;
  const quotaBlocked = checkerQuery.data?.create === false;

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Crear publicación" breadcrumbSubTitle="Publicar" />

      <div className="upload-area pt-130 pb-90">
        <div className="container">
          {checkerQuery.isLoading && (
            <div className="alert alert-info">Verificando tu plan…</div>
          )}

          {quotaBlocked && (
            <div className="alert alert-warning">
              {checkerQuery.data?.message || 'Has alcanzado el límite de publicaciones de tu plan.'}{' '}
              <Link href="/pricing-plan">Ver planes disponibles</Link>
            </div>
          )}

          {!quotaBlocked && !checkerQuery.isLoading && (
            <div className="upload-wrapper mb-10">
              <form onSubmit={formik.handleSubmit} className="upload-form" noValidate>
                <div className="row">
                  <div className="col-lg-8">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="single-input-unit">
                          <label htmlFor="title">Título</label>
                          <input
                            id="title"
                            type="text"
                            placeholder="Ej. Casa amplia en zona 15"
                            {...formik.getFieldProps('title')}
                          />
                          {formik.touched.title && formik.errors.title && (
                            <p className="field-error">{formik.errors.title}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="single-input-unit">
                          <label htmlFor="propertie">Tipo de propiedad</label>
                          <select
                            id="propertie"
                            className="upload-select"
                            {...formik.getFieldProps('propertie')}
                          >
                            <option value="">Selecciona…</option>
                            {(categoriesQuery.data ?? []).map((c) => (
                              <option key={c.pubgen_id} value={c.pubgen_id}>
                                {c.pubgen_description}
                              </option>
                            ))}
                          </select>
                          {formik.touched.propertie && formik.errors.propertie && (
                            <p className="field-error">{formik.errors.propertie}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="single-input-unit">
                          <label htmlFor="transaction">Tipo de transacción</label>
                          <select
                            id="transaction"
                            className="upload-select"
                            disabled={!propertieNum || transactionsQuery.isLoading}
                            {...formik.getFieldProps('transaction')}
                          >
                            <option value="">{propertieNum ? 'Selecciona…' : 'Elige la propiedad primero'}</option>
                            {(transactionsQuery.data ?? []).map((t) => (
                              <option key={t.pubtraid} value={t.pubtraidaux}>
                                {t.description}
                              </option>
                            ))}
                          </select>
                          {formik.touched.transaction && formik.errors.transaction && (
                            <p className="field-error">{formik.errors.transaction}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="single-input-unit">
                          <label htmlFor="price">
                            Precio ({formik.values.currency === 'USD' ? '$' : 'Q'})
                          </label>
                          <div className="price-input-row">
                            <input
                              id="price"
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              placeholder={formik.values.currency === 'USD' ? 'Ej. 110,500.00' : 'Ej. 850,000.00'}
                              value={formatPriceDisplay(formik.values.price)}
                              onChange={(e) => formik.setFieldValue('price', parsePriceInput(e.target.value))}
                              onBlur={formik.handleBlur}
                              name="price"
                            />
                            <div className="currency-toggle" role="group" aria-label="Moneda">
                              <button
                                type="button"
                                className={`currency-toggle-btn ${formik.values.currency === 'GTQ' ? 'is-active' : ''}`}
                                onClick={() => formik.setFieldValue('currency', 'GTQ')}
                                aria-pressed={formik.values.currency === 'GTQ'}
                              >
                                Q · GTQ
                              </button>
                              <button
                                type="button"
                                className={`currency-toggle-btn ${formik.values.currency === 'USD' ? 'is-active' : ''}`}
                                onClick={() => formik.setFieldValue('currency', 'USD')}
                                aria-pressed={formik.values.currency === 'USD'}
                              >
                                $ · USD
                              </button>
                            </div>
                          </div>
                          {formik.touched.price && formik.errors.price && (
                            <p className="field-error">{formik.errors.price}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="single-input-unit">
                          <label htmlFor="country">País</label>
                          <select
                            id="country"
                            className="upload-select"
                            disabled={countriesQuery.isLoading}
                            {...formik.getFieldProps('country')}
                          >
                            <option value="">Selecciona…</option>
                            {(countriesQuery.data ?? []).map((c) => (
                              <option key={c.country} value={c.country}>
                                {c.description}
                              </option>
                            ))}
                          </select>
                          {formik.touched.country && formik.errors.country && (
                            <p className="field-error">{formik.errors.country}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="single-input-unit">
                          <label htmlFor="city">Ciudad</label>
                          <select
                            id="city"
                            className="upload-select"
                            disabled={!countryNum || citiesQuery.isLoading}
                            {...formik.getFieldProps('city')}
                          >
                            <option value="">{countryNum ? 'Selecciona…' : 'Elige país primero'}</option>
                            {(citiesQuery.data ?? []).map((c) => (
                              <option key={c.city} value={c.city}>
                                {c.description}
                              </option>
                            ))}
                          </select>
                          {formik.touched.city && formik.errors.city && (
                            <p className="field-error">{formik.errors.city}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="single-input-unit">
                          <label htmlFor="municipality">Municipio</label>
                          <select
                            id="municipality"
                            className="upload-select"
                            disabled={!cityNum || municipalitiesQuery.isLoading}
                            {...formik.getFieldProps('municipality')}
                          >
                            <option value="">{cityNum ? 'Selecciona…' : 'Elige ciudad primero'}</option>
                            {(municipalitiesQuery.data ?? []).map((m) => (
                              <option key={m.municipality} value={m.municipality}>
                                {m.description}
                              </option>
                            ))}
                          </select>
                          {formik.touched.municipality && formik.errors.municipality && (
                            <p className="field-error">{formik.errors.municipality}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="single-input-unit">
                          <label htmlFor="address">Dirección</label>
                          <input
                            id="address"
                            type="text"
                            placeholder="Ej. 5a avenida 10-23 zona 15, Edificio Vista Hermosa"
                            {...formik.getFieldProps('address')}
                          />
                          {formik.touched.address && formik.errors.address && (
                            <p className="field-error">{formik.errors.address}</p>
                          )}
                        </div>
                      </div>

                      {showHouseFields && (
                        <>
                          <div className="col-md-3">
                            <div className="single-input-unit">
                              <label htmlFor="noRooms">Habitaciones</label>
                              <input
                                id="noRooms"
                                type="number"
                                min={0}
                                {...formik.getFieldProps('noRooms')}
                              />
                              {formik.touched.noRooms && formik.errors.noRooms && (
                                <p className="field-error">{formik.errors.noRooms}</p>
                              )}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="single-input-unit">
                              <label htmlFor="noBathrooms">Baños</label>
                              <input
                                id="noBathrooms"
                                type="number"
                                min={0}
                                {...formik.getFieldProps('noBathrooms')}
                              />
                              {formik.touched.noBathrooms && formik.errors.noBathrooms && (
                                <p className="field-error">{formik.errors.noBathrooms}</p>
                              )}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="single-input-unit">
                              <label htmlFor="noParking">Parqueos</label>
                              <input
                                id="noParking"
                                type="number"
                                min={0}
                                {...formik.getFieldProps('noParking')}
                              />
                              {formik.touched.noParking && formik.errors.noParking && (
                                <p className="field-error">{formik.errors.noParking}</p>
                              )}
                            </div>
                          </div>
                          {showLevelField && (
                            <div className="col-md-3">
                              <div className="single-input-unit">
                                <label htmlFor="nlevel">Nivel</label>
                                <input
                                  id="nlevel"
                                  type="number"
                                  min={0}
                                  {...formik.getFieldProps('nlevel')}
                                />
                                {formik.touched.nlevel && formik.errors.nlevel && (
                                  <p className="field-error">{formik.errors.nlevel}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {showSizeField && (
                        <div className="col-md-6">
                          <div className="single-input-unit">
                            <label htmlFor="size">Tamaño del terreno (m²)</label>
                            <input
                              id="size"
                              type="number"
                              min={0}
                              {...formik.getFieldProps('size')}
                            />
                            {formik.touched.size && formik.errors.size && (
                              <p className="field-error">{formik.errors.size}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="col-md-12">
                        <div className="single-input-unit">
                          <label htmlFor="description">Descripción</label>
                          <textarea
                            id="description"
                            rows={5}
                            placeholder="Cuenta los detalles que enamoran del inmueble: acabados, vecindario, vistas, accesos…"
                            {...formik.getFieldProps('description')}
                          />
                          {formik.touched.description && formik.errors.description && (
                            <p className="field-error">{formik.errors.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="upload-btn">
                      <button
                        type="submit"
                        className="fill-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Publicando…' : 'Publicar'}
                      </button>
                      <Link href="/my-publications" className="fill-btn-orange">
                        Cancelar
                      </Link>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <DragDropSection
                      uploaded={images}
                      onUploadedChange={(next) => {
                        setImages(next);
                        if (next.length > 0) setImagesError(null);
                      }}
                      disabled={submitting}
                    />
                    {imagesError && <p className="field-error">{imagesError}</p>}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.upload-form .single-input-unit) {
          margin-bottom: 22px;
        }
        :global(.upload-form .single-input-unit label) {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--clr-common-heading, #181818);
        }
        :global(.upload-form .upload-select) {
          width: 100%;
          height: 50px;
          padding: 0 14px;
          border: 1px solid var(--clr-common-border, #e0e2e5);
          border-radius: 6px;
          background: var(--clr-bg-white, #fff);
          color: var(--clr-common-heading, #181818);
          font-size: 14px;
          appearance: auto;
        }
        :global(.upload-form .upload-select:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
        :global(.upload-form .field-error) {
          margin: 6px 0 0;
          color: #ef4444;
          font-size: 13px;
        }
        :global(.upload-form input[type="number"]::-webkit-outer-spin-button),
        :global(.upload-form input[type="number"]::-webkit-inner-spin-button) {
          -webkit-appearance: none;
          margin: 0;
        }
        :global(.upload-form input[type="number"]) {
          -moz-appearance: textfield;
        }
        :global(.upload-form .upload-btn .fill-btn-orange) {
          margin-left: 14px;
        }
        :global(.upload-form .price-input-row) {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }
        :global(.upload-form .price-input-row input) {
          flex: 1;
          min-width: 0;
        }
        :global(.upload-form .currency-toggle) {
          display: inline-flex;
          border: 1px solid var(--clr-bg-white, #fff);
          border-radius: 6px;
          overflow: hidden;
          height: 50px;
          flex-shrink: 0;
        }
        :global(.upload-form .currency-toggle-btn) {
          padding: 0 14px;
          background: var(--clr-bg-white, #fff);
          color: var(--clr-common-heading, #181818);
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        :global(.upload-form .currency-toggle-btn + .currency-toggle-btn) {
          border-left: 1px solid var(--clr-common-border, rgba(128, 128, 128, 0.25));
        }
        :global(.upload-form .currency-toggle-btn.is-active) {
          background: var(--clr-theme-1, #6c5ce7);
          color: #fff;
        }
        :global(.upload-form .currency-toggle-btn:hover:not(.is-active)) {
          background: rgba(108, 92, 231, 0.08);
        }
      `}</style>
    </>
  );
};

export default UploadMain;
