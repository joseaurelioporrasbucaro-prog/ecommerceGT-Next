"use client";
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import PublicationForm, {
  EMPTY_FORM_VALUES,
  PUBGEN_APTO,
  PUBGEN_CASA,
  PUBGEN_TERRENO,
  type PublicationFormValues,
} from './PublicationForm';
import { ApiError } from '@/utils/Api';
import { usePublicationEdit } from '@/hooks/api/usePublicationEdit';
import { useUpdatePublication } from '@/hooks/api/useUpdatePublication';
import {
  useCities,
  useCountries,
  useMunicipalities,
  usePublicationCategories,
  usePublicationTransactions,
} from '@/hooks/api/useCatalogs';
import type { UploadedImage } from '@/types/api';

interface EditPublicationMainProps {
  publicationId: number;
}

function asString(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

const EditPublicationMain: React.FC<EditPublicationMainProps> = ({ publicationId }) => {
  const router = useRouter();
  const editQuery = usePublicationEdit(publicationId);
  const updateMutation = useUpdatePublication(publicationId);

  // Mapear datos del backend al shape de PublicationFormValues.
  const initialValues: PublicationFormValues = useMemo(() => {
    if (!editQuery.data) return EMPTY_FORM_VALUES;
    const d = editQuery.data;
    return {
      title: d.title ?? '',
      description: d.description ?? '',
      address: d.address ?? '',
      propertie: asString(d.category),
      transaction: asString(d.transaction),
      price: asString(d.price),
      currency: d.currency === 'USD' ? 'USD' : 'GTQ',
      country: asString(d.country),
      city: asString(d.city),
      municipality: asString(d.municipality),
      noRooms: asString(d.rooms),
      noBathrooms: asString(d.bathrooms),
      noParking: asString(d.parking),
      nlevel: asString(d.nlevel),
      size: asString(d.size),
    };
  }, [editQuery.data]);

  const initialImages: UploadedImage[] = editQuery.data?.images ?? [];

  // Pre-cargar TODOS los catálogos que el form va a necesitar antes de
  // renderizar PublicationForm. Si los <select> se montan con value="2" pero
  // sin las <option> correspondientes (porque el catálogo aún no terminó de
  // cargar), React queda con el placeholder "Selecciona…" y a veces no
  // re-sincroniza cuando llegan los datos. Esperar acá garantiza que las
  // opciones existan en el DOM al primer render del form.
  const categoriesQuery = usePublicationCategories();
  const countriesQuery = useCountries();
  const transactionsQuery = usePublicationTransactions(
    editQuery.data ? editQuery.data.category : null,
  );
  const citiesQuery = useCities(editQuery.data ? editQuery.data.country : null);
  const municipalitiesQuery = useMunicipalities(
    editQuery.data ? editQuery.data.city : null,
  );

  const allCatalogsReady =
    Boolean(editQuery.data) &&
    Boolean(categoriesQuery.data) &&
    Boolean(countriesQuery.data) &&
    Boolean(transactionsQuery.data) &&
    Boolean(citiesQuery.data) &&
    Boolean(municipalitiesQuery.data);

  const handleSubmit = async (values: PublicationFormValues, images: UploadedImage[]) => {
    const propertieNum = Number(values.propertie);
    const isCasa = propertieNum === PUBGEN_CASA;
    const isApto = propertieNum === PUBGEN_APTO;
    const isTerreno = propertieNum === PUBGEN_TERRENO;

    try {
      await updateMutation.mutateAsync({
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
      toast.success('Publicación actualizada correctamente.');
      router.push(`/publications/${publicationId}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar la publicación.';
      toast.error(message);
    }
  };

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Editar publicación" breadcrumbSubTitle="Editar" />

      <div className="upload-area pt-130 pb-90">
        <div className="container">
          {editQuery.isLoading && (
            <div className="alert alert-info">Cargando publicación…</div>
          )}

          {editQuery.error && (
            <div className="alert alert-danger">
              {editQuery.error instanceof ApiError
                ? editQuery.error.message
                : 'No se pudo cargar la publicación.'}
            </div>
          )}

          {editQuery.data && !allCatalogsReady && (
            <div className="alert alert-info">Cargando catálogos…</div>
          )}

          {allCatalogsReady && (
            <PublicationForm
              initialValues={initialValues}
              initialImages={initialImages}
              submitLabel="Guardar cambios"
              submittingLabel="Guardando…"
              cancelHref="/my-publications"
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EditPublicationMain;
