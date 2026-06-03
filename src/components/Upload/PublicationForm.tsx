"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DragDropSection from './DragDropSection';
import DragDropSectionGlb from './DragDropSectionGlb';
import {
  useCities,
  useCountries,
  useMunicipalities,
  usePublicationCategories,
  usePublicationTransactions,
} from '@/hooks/api/useCatalogs';
import { useMySubscription } from '@/hooks/api/useSubscription';
import type { UploadedImage } from '@/types/api';

export const PUBGEN_CASA = 1;
export const PUBGEN_APTO = 2;
export const PUBGEN_TERRENO = 3;

export interface PublicationFormValues {
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

export const EMPTY_FORM_VALUES: PublicationFormValues = {
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
  return `${intFormatted}.${decPart}`;
}

/**
 * Parsea el display "250,000.50" → "250000.50" (crudo). Quita comas y cualquier
 * caracter no numérico salvo el primer punto decimal.
 */
function parsePriceInput(input: string): string {
  const cleaned = input.replace(/[^0-9.]/g, '');
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

export interface PublicationFormProps {
  /** Valores iniciales. Si no se pasan, todos vacíos (modo crear). */
  initialValues?: PublicationFormValues;
  /** Imágenes ya cargadas (modo editar). */
  initialImages?: UploadedImage[];
  initialImagesGlb?: UploadedImage[];
  /** Texto del botón principal cuando no está enviando. */
  submitLabel: string;
  /** Texto del botón principal mientras envía. */
  submittingLabel: string;
  /** Ruta a la que va el botón Cancelar. */
  cancelHref: string;
  /**
   * Handler genérico de submit. Recibe valores ya validados + imágenes.
   * Debe retornar Promise para que el form sepa cuándo termina.
   */
  onSubmit: (values: PublicationFormValues, images: UploadedImage[], imagesglb: UploadedImage[]) => Promise<void>;
  /** Si true, oculta el botón cancelar. */
  hideCancel?: boolean;
}

/**
 * Form de publicación reusable para crear y editar. Maneja toda la lógica de
 * formik + cascadas (categoría → transacción, país → ciudad → municipio) +
 * dropzone de imágenes. El parent decide qué hacer al submit.
 */
const PublicationForm: React.FC<PublicationFormProps> = ({
  initialValues = EMPTY_FORM_VALUES,
  initialImages = [],
  initialImagesGlb = [],
  submitLabel,
  submittingLabel,
  cancelHref,
  onSubmit,
  hideCancel = false,
}) => {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  // Fix post-merge: antes era initialImages (typo) — al editar arrancaba con las
  // imágenes JPG como si fueran GLB, lo que ensuciaba el upload.
  const [imagesGlb, setImagesGlb] = useState<UploadedImage[]>(initialImagesGlb);
  const [imagesError, setImagesError] = useState<string | null>(null);
  // No sync con initialImages — el componente se monta UNA vez con los datos
  // del backend (gracias al key={publicationId} del padre). El usuario gestiona
  // sus cambios desde acá sin que se pisen por refetch.

  const handleAddImage = useCallback((image: UploadedImage) => {
    setImages((prev) => [...prev, image]);
    setImagesError(null);
  }, []);
  const handleRemoveImage = useCallback((imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  const handleAddImageGlb = useCallback((image: UploadedImage) => {
    setImagesGlb((prev) => [...prev, image]);
  }, []);

  const handleRemoveImageGlb = useCallback((imageId: string) => {
    setImagesGlb((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  const categoriesQuery = usePublicationCategories();
  const countriesQuery = useCountries();

  // IMPORTANTE: NO usamos enableReinitialize. El padre (EditPublicationMain)
  // pasa `key={publicationId}` para que el form se re-monte fresco al cambiar
  // de publicación. Mientras el usuario edita, formik mantiene sus cambios
  // sin riesgo de que un refetch del backend pise lo que escribió.
  const formik = useFormik<PublicationFormValues>({
    initialValues,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema,
    onSubmit: async (values) => {
      if (images.length === 0) {
        setImagesError('Sube al menos una imagen.');
        return;
      }
      setImagesError(null);
      await onSubmit(values, images, imagesGlb);
    },
  });

  const propertieNum = formik.values.propertie ? Number(formik.values.propertie) : null;
  const transactionsQuery = usePublicationTransactions(propertieNum);
  const countryNum = formik.values.country ? Number(formik.values.country) : null;
  const citiesQuery = useCities(countryNum);
  const cityNum = formik.values.city ? Number(formik.values.city) : null;
  const municipalitiesQuery = useMunicipalities(cityNum);

  // Cascadas: cada vez que el usuario cambia la propiedad/país/ciudad,
  // limpiamos los campos dependientes. Como el form se monta UNA vez con los
  // datos del backend (no usamos enableReinitialize), el primer render NO
  // dispara estos resets — propertieNum/countryNum/cityNum ya tienen el valor
  // correcto desde el inicio, así que useEffect no detecta cambio.
  // Usamos un ref para skip-ear el primer mount por las dudas.
  const cascadeFirstMount = useRef(true);

  // Re-evaluar errors cuando cambia el tipo de propiedad (campos requeridos cambian).
  useEffect(() => {
    if (cascadeFirstMount.current) return;
    formik.setFormikState((prev) => ({ ...prev, errors: {} }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertieNum]);

  useEffect(() => {
    if (cascadeFirstMount.current) return;
    formik.setFieldValue('transaction', '', false);
    formik.setFieldValue('noRooms', '', false);
    formik.setFieldValue('noBathrooms', '', false);
    formik.setFieldValue('noParking', '', false);
    formik.setFieldValue('nlevel', '', false);
    formik.setFieldValue('size', '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertieNum]);

  useEffect(() => {
    if (cascadeFirstMount.current) return;
    formik.setFieldValue('city', '', false);
    formik.setFieldValue('municipality', '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryNum]);

  useEffect(() => {
    if (cascadeFirstMount.current) return;
    formik.setFieldValue('municipality', '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityNum]);

  // Bajar el flag DESPUÉS del primer render — los efectos de arriba ya corrieron
  // (por el primer mount, con cascadeFirstMount.current=true → todos retornaron),
  // así que a partir del próximo cambio sí ejecutarán las cascadas.
  useEffect(() => {
    cascadeFirstMount.current = false;
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // "WaitFor" — re-asserts cada valor de select cuando su query de catálogo
  // termina de cargar.
  //
  // Por qué: React tiene un quirk con <select controlled value="X"> cuando la
  // <option value="X"> aparece DESPUÉS del primer render. A veces no
  // sincroniza el value visualmente y el select se queda mostrando el
  // placeholder. Este patrón fuerza un setFieldValue (con el mismo valor)
  // cuando el catálogo llega, lo cual triggea un re-render donde React ya
  // tiene la option en el DOM y la sincronización funciona.
  // ────────────────────────────────────────────────────────────────────────
  const reassertedFields = useRef({
    propertie: false,
    transaction: false,
    country: false,
    city: false,
    municipality: false,
  });

  useEffect(() => {
    if (reassertedFields.current.propertie) return;
    if (!categoriesQuery.data || !initialValues.propertie) return;
    formik.setFieldValue('propertie', initialValues.propertie, false);
    reassertedFields.current.propertie = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (reassertedFields.current.transaction) return;
    if (!transactionsQuery.data || !initialValues.transaction) return;
    formik.setFieldValue('transaction', initialValues.transaction, false);
    reassertedFields.current.transaction = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsQuery.data]);

  useEffect(() => {
    if (reassertedFields.current.country) return;
    if (!countriesQuery.data || !initialValues.country) return;
    formik.setFieldValue('country', initialValues.country, false);
    reassertedFields.current.country = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countriesQuery.data]);

  useEffect(() => {
    if (reassertedFields.current.city) return;
    if (!citiesQuery.data || !initialValues.city) return;
    formik.setFieldValue('city', initialValues.city, false);
    reassertedFields.current.city = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citiesQuery.data]);

  useEffect(() => {
    if (reassertedFields.current.municipality) return;
    if (!municipalitiesQuery.data || !initialValues.municipality) return;
    formik.setFieldValue('municipality', initialValues.municipality, false);
    reassertedFields.current.municipality = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipalitiesQuery.data]);

  const showHouseFields = propertieNum === PUBGEN_CASA || propertieNum === PUBGEN_APTO;
  const showLevelField = propertieNum === PUBGEN_APTO;
  const showSizeField = propertieNum === PUBGEN_TERRENO;

  const submitting = formik.isSubmitting;

  // Gate del visor 3D (GLB) por plan: solo planes pagos pueden subir GLB.
  // - Mientras carga la suscripción → asumimos free (no mostramos el dropzone)
  //   para evitar que el usuario suba y luego le falle el submit.
  // - Si el usuario YA tiene GLB cargados (modo editar, lo subió cuando estaba
  //   en plan pago y luego degradó), igual le dejamos verlos/quitarlos.
  const mySubQuery = useMySubscription();
  const isPaidPlan = (mySubQuery.data?.price ?? 0) > 0;
  const glbEnabled = isPaidPlan || imagesGlb.length > 0;

  return (
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
                  {/*
                   * key cambia al llegar las opciones para forzar re-mount del
                   * <select> y que React sincronice el value precargado por
                   * formik con la <option> recién agregada (workaround a un
                   * quirk de React donde un select controlled no se re-sync
                   * cuando aparece la option después del primer render).
                   */}
                  <select
                    id="propertie"
                    key={`propertie-${categoriesQuery.data?.length ?? 0}`}
                    className="upload-select"
                    {...formik.getFieldProps('propertie')}
                  >
                    <option value="">Selecciona…</option>
                    {(categoriesQuery.data ?? []).map((c) => (
                      <option key={c.pubgen_id} value={String(c.pubgen_id)}>
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
                    key={`transaction-${propertieNum ?? 'none'}-${transactionsQuery.data?.length ?? 0}`}
                    className="upload-select"
                    disabled={!propertieNum || transactionsQuery.isLoading}
                    {...formik.getFieldProps('transaction')}
                  >
                    <option value="">{propertieNum ? 'Selecciona…' : 'Elige la propiedad primero'}</option>
                    {(transactionsQuery.data ?? []).map((t) => (
                      <option key={t.pubtraid} value={String(t.pubtraidaux)}>
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
                    key={`country-${countriesQuery.data?.length ?? 0}`}
                    className="upload-select"
                    disabled={countriesQuery.isLoading}
                    {...formik.getFieldProps('country')}
                  >
                    <option value="">Selecciona…</option>
                    {(countriesQuery.data ?? []).map((c) => (
                      <option key={c.country} value={String(c.country)}>
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
                    key={`city-${countryNum ?? 'none'}-${citiesQuery.data?.length ?? 0}`}
                    className="upload-select"
                    disabled={!countryNum || citiesQuery.isLoading}
                    {...formik.getFieldProps('city')}
                  >
                    <option value="">{countryNum ? 'Selecciona…' : 'Elige país primero'}</option>
                    {(citiesQuery.data ?? []).map((c) => (
                      <option key={c.city} value={String(c.city)}>
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
                    key={`muni-${cityNum ?? 'none'}-${municipalitiesQuery.data?.length ?? 0}`}
                    className="upload-select"
                    disabled={!cityNum || municipalitiesQuery.isLoading}
                    {...formik.getFieldProps('municipality')}
                  >
                    <option value="">{cityNum ? 'Selecciona…' : 'Elige ciudad primero'}</option>
                    {(municipalitiesQuery.data ?? []).map((m) => (
                      <option key={m.municipality} value={String(m.municipality)}>
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
                {submitting ? submittingLabel : submitLabel}
              </button>
              {!hideCancel && (
                <Link href={cancelHref} className="fill-btn-orange">
                  Cancelar
                </Link>
              )}
            </div>
          </div>


          <div className="col-lg-4">
            {/* Orden (2026-06-02): imágenes ARRIBA, GLB ABAJO — son la materia
                principal de la publicación; el GLB es opcional y solo lo usan
                cuentas pagas. */}
            <div>
              <DragDropSection
                uploaded={images}
                onAdd={handleAddImage}
                onRemove={handleRemoveImage}
                disabled={submitting}
              />
              {imagesError && <p className="field-error">{imagesError}</p>}
            </div>

            <div className='pt-3'>
              {glbEnabled ? (
                <DragDropSectionGlb
                  uploadedGlb={imagesGlb}
                  onAdd={handleAddImageGlb}
                  onRemove={handleRemoveImageGlb}
                  disabled={submitting}
                />
              ) : (
                <div className="glb-upgrade-card">
                  <div className="glb-upgrade-icon">
                    <i className="fas fa-cube" />
                  </div>
                  <h4 className="glb-upgrade-title">Archivos 3D (GLB)</h4>
                  <p className="glb-upgrade-text">
                    Subir modelos 3D para el visor interactivo está disponible
                    en los planes pagos. Mejora tu plan para destacar tu
                    publicación con un recorrido 3D.
                  </p>
                  <Link href="/pricing-plan" className="fill-btn glb-upgrade-cta">
                    Ver planes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

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
        /* Upgrade card cuando el usuario está en plan free — sustituye al
           dropzone GLB y explica la limitación con un CTA a /pricing-plan. */
        :global(.upload-form .glb-upgrade-card) {
          border: 1.5px dashed rgba(108, 92, 231, 0.45);
          background: rgba(108, 92, 231, 0.06);
          border-radius: 12px;
          padding: 22px 18px;
          text-align: center;
        }
        :global(.upload-form .glb-upgrade-icon) {
          font-size: 32px;
          color: var(--clr-theme-1, #6c5ce7);
          margin-bottom: 6px;
        }
        :global(.upload-form .glb-upgrade-title) {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 700;
          color: var(--clr-common-heading, #181818);
        }
        :global(.upload-form .glb-upgrade-text) {
          margin: 0 0 14px;
          font-size: 12.5px;
          line-height: 1.5;
          opacity: 0.8;
        }
        :global(.upload-form .glb-upgrade-cta) {
          display: inline-block;
          padding: 8px 22px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default PublicationForm;