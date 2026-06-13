"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import ThemeChanger from '../home/ThemeChanger';
import Breadcrumbs from '@/utils/Breadcrumbs';
import PublicationForm, {
  PUBGEN_APTO,
  PUBGEN_CASA,
  PUBGEN_TERRENO,
  mapPricesToPayload,
  type PublicationFormValues,
} from './PublicationForm';
import { ApiError } from '@/utils/Api';
import { useCheckerPublications } from '@/hooks/api/useCheckerPublications';
import { useCreatePublication } from '@/hooks/api/useCreatePublication';
import type { UploadedImage } from '@/types/api';

const UploadMain: React.FC = () => {
  const router = useRouter();
  const checkerQuery = useCheckerPublications();
  const createMutation = useCreatePublication();

  const handleSubmit = async (values: PublicationFormValues, images: UploadedImage[], imagesglb: UploadedImage[]) => {
    const propertieNum = Number(values.propertie);
    const isCasa = propertieNum === PUBGEN_CASA;
    const isApto = propertieNum === PUBGEN_APTO;
    const isTerreno = propertieNum === PUBGEN_TERRENO;

    const prices = mapPricesToPayload(values);

    try {
      const response = await createMutation.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        address: values.address.trim(),
        propertie: propertieNum,
        transaction: Number(values.transaction),
        price: prices.price,
        currency: prices.currency,
        priceAlt: prices.priceAlt,
        currencyAlt: prices.currencyAlt,
        country: Number(values.country),
        city: Number(values.city),
        municipality: Number(values.municipality),
        noRooms: isCasa || isApto ? Number(values.noRooms) : null,
        noBathrooms: isCasa || isApto ? Number(values.noBathrooms) : null,
        noParking: isCasa || isApto ? Number(values.noParking) : null,
        // Fase 19.5: nlevel ahora también aplica a casa (niveles totales).
        nlevel: (isApto || isCasa) && values.nlevel ? Number(values.nlevel) : null,
        size: isTerreno ? Number(values.size) : null,
        // Fase 19.5: frente y fondo solo para terreno; opcionales.
        frente: isTerreno && values.frente ? Number(values.frente) : null,
        fondo: isTerreno && values.fondo ? Number(values.fondo) : null,
        images,
        imagesglb,
        amenities: values.amenities ?? [],
      });
      toast.success('Publicación creada correctamente.');
      router.push(`/publications/${response.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo crear la publicación.';
      toast.error(message);
    }
  };

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
            <PublicationForm
              submitLabel="Publicar"
              submittingLabel="Publicando…"
              cancelHref="/my-publications"
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UploadMain;
