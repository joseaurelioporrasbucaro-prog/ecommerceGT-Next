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
      <Breadcrumbs breadcrumbTitle="404 Error" breadcrumbSubTitle="404 Error" />
      <section className="error-404-area pt-130 pb-90">
        <div className="container">
          <div className="row justify-content-center wow fadeInUp">
            <div className="col-lg-8">
              <div className="error-404-wrapper pos-rel mb-40">
                <div className=" error-404-inner">
                  <div className="error-404-content text-center">
                    <div className="error-404-img mb-30">
                      {dynamicUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dynamicUrl}
                          alt="error-img"
                          width={asset?.width ?? 500}
                          height={asset?.height ?? 500}
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                      ) : (
                        <Image
                          width={500}
                          height={500}
                          style={{ width: "auto", height: "auto" }}
                          src={staticErrorLogo}
                          alt="error-img"
                        />
                      )}
                    </div>
                    <h4>Ooops! Page not Found</h4>
                    <p className="mb-30">
                      Maybe this page has broken or not created. Come back to
                      the Homepage
                    </p>
                    <div className="error-404-btn">
                      <Link className="fill-btn" href="/">
                        Back to Homepage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ErrorMain;
