// Codigo Aurelio - evita pagar campañas para inmuebles vendidos o pausados.
//
// El selector es la primera barrera del flujo de dinero. Usa una lista blanca
// de estado publicado para que un estado nuevo tampoco se vuelva pautable por accidente.

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import PautaMain from '@/components/pauta/PautaMain';
import { crearUsuarioDePrueba } from '../helpers/AuthProviderDePrueba';
import { renderConProviders } from '../helpers/renderConProviders';

const datos = vi.hoisted(() => ({
  publicaciones: [
    { pub_id: 1, pub_title: 'Publicación activa', pubsta_id: 2 },
    { pub_id: 2, pub_title: 'Publicación vendida', pubsta_id: 3 },
    { pub_id: 3, pub_title: 'Publicación pausada', pubsta_id: 5 },
  ],
}));

vi.mock('@/hooks/api/useMyPublications', () => ({
  useMyPublications: () => ({ data: datos.publicaciones }),
}));

vi.mock('@/hooks/api/useCampaigns', () => ({
  useMyCampaigns: () => ({ data: [] }),
  useCreateCampaign: () => ({ mutate: vi.fn(), isPending: false }),
  useSetCampaignStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useAdCredit: () => ({ data: { credit: 0 } }),
}));

vi.mock('@/hooks/api/useCatalogs', () => ({
  useCities: () => ({ data: [] }),
  useMunicipalities: () => ({ data: [] }),
}));

vi.mock('@/hooks/api/usePricingConfig', () => ({
  usePricingConfig: () => ({ adMinBudget: 10, adImpressionCost: 0.01, adClickCost: 0.5, plansCurrency: 'GTQ' }),
}));

vi.mock('@/utils/Breadcrumbs', () => ({ default: () => null }));

describe('PautaMain', () => {
  // ── EL TEST QUE IMPORTA ──────────────────────────────────────────────────
  test('el selector ofrece solo publicaciones actualmente publicadas', () => {
    renderConProviders(<PautaMain />, { user: crearUsuarioDePrueba() });

    expect(screen.getByRole('option', { name: 'Publicación activa' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Publicación vendida' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Publicación pausada' })).toBeNull();
  });
});
