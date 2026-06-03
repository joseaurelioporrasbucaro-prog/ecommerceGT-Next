"use client";
import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import Link from "next/link";
import staticErrorLogo from "../../../public/assets/img/shape/error-404.png";
import Image from "next/image";
import { useSiteAsset, resolveAssetUrl } from "@/hooks/api/useSiteAssets";

// Fase 15: la imagen 404 ahora puede cambiarse desde /admin/imagenes sin
// redeploy. Si la query falla o el asset no está, cae al asset estático
// del template como fallback.
const ErrorMain = () => {
  const asset = useSiteAsset('error_404');
  const dynamicUrl = asset ? resolveAssetUrl(asset.url) : null;

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Página no encontrada" breadcrumbSubTitle="404" />
      <section className="error-404-area pt-100 pb-90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="error-404-content text-center">
                <div className="error-404-img mb-30">
                  {dynamicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dynamicUrl}
                      alt="Página no encontrada"
                      width={asset?.width ?? 500}
                      height={asset?.height ?? 500}
                      style={{ maxWidth: '100%', height: 'auto', maxHeight: 320 }}
                    />
                  ) : (
                    <Image
                      width={500}
                      height={500}
                      style={{ width: "auto", height: "auto", maxHeight: 320 }}
                      src={staticErrorLogo}
                      alt="Página no encontrada"
                    />
                  )}
                </div>
                <h4>Esta página no existe (o ya no existe)</h4>
                <p className="mb-30">
                  La propiedad o sección que buscás puede haberse retirado, vendido
                  o nunca haber estado en KIOSQUI. Probá con alguna de estas opciones:
                </p>
                <div className="error-404-btn">
                  <Link className="fill-btn" href="/">
                    <i className="fas fa-home" style={{ marginRight: 7 }} />
                    Volver al inicio
                  </Link>
                  <Link className="border-btn" href="/publications" style={{ marginLeft: 14 }}>
                    <i className="fas fa-search" style={{ marginRight: 7 }} />
                    Buscar propiedades
                  </Link>
                </div>

                {/* Rescate SEO + UX: 3 atajos por categoría. Si el usuario llegó
                    acá por un link viejo, le damos opciones tangibles. */}
                <div className="error-404-shortcuts">
                  <p className="error-404-shortcuts-title">O explorá por tipo:</p>
                  <div className="error-404-chips">
                    <Link href="/publications?propertie=1" className="error-chip">
                      <i className="fas fa-home" /> Casas
                    </Link>
                    <Link href="/publications?propertie=2" className="error-chip">
                      <i className="fas fa-building" /> Apartamentos
                    </Link>
                    <Link href="/publications?propertie=3" className="error-chip">
                      <i className="fas fa-map" /> Terrenos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .error-404-area :global(.error-404-btn) {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 14px;
            margin-bottom: 50px;
          }
          .error-404-area :global(.error-404-btn .border-btn) {
            margin-left: 0 !important;
          }
          .error-404-shortcuts {
            padding-top: 30px;
            border-top: 1px solid var(--clr-common-border, #e0e2e5);
          }
          .error-404-shortcuts-title {
            font-size: 14px;
            color: var(--clr-common-body-text);
            margin: 0 0 14px;
          }
          .error-404-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
          }
          .error-404-area :global(.error-chip) {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 16px;
            background: var(--clr-bg-white, #fff);
            border: 1px solid var(--clr-common-border, #e0e2e5);
            border-radius: 30px;
            font-size: 13.5px;
            font-weight: 600;
            color: var(--clr-common-heading);
            text-decoration: none;
            transition: border-color 0.15s, color 0.15s, transform 0.15s;
          }
          .error-404-area :global(.error-chip:hover) {
            border-color: var(--clr-theme-1, #2785ff);
            color: var(--clr-theme-1, #2785ff);
            transform: translateY(-1px);
          }
          .error-404-area :global(.error-chip i) {
            font-size: 12px;
            opacity: 0.7;
          }
        `}</style>
      </section>
    </>
  );
};

export default ErrorMain;
