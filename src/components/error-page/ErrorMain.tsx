import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import Link from "next/link";
import errorLogo from "../../../public/assets/img/shape/error-404.png";
import Image from "next/image";

const ErrorMain = () => {
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
                      <Image
                        width={500}
                        height={500}
                        style={{ width: "auto", height: "auto" }}
                        src={errorLogo}
                        alt="error-img"
                      />
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
