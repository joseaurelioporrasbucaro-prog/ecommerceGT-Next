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
  const initialImagesGlb: UploadedImage[] = editQuery.data?.imagesglb ?? [];

  const handleSubmit = async (values: PublicationFormValues, images: UploadedImage[], imagesglb: UploadedImage[]) => {
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
        imagesglb,
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

          {editQuery.data && (
            <PublicationForm
              // key fuerza el mount fresh con datos del backend. Sin reinit
              // formik mantiene los cambios del usuario hasta que cambia el id.
              key={publicationId}
              initialValues={initialValues}
              initialImages={initialImages}
              initialImagesGlb={initialImagesGlb}
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
