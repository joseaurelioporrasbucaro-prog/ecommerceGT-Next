import LoginFrom from "@/form/LoginFrom";
import React from "react";
import { useTranslations } from "next-intl";

const LoginContent = () => {
  const t = useTranslations("auth");
  return (
    <>
      <section
        className="login-area pt-130 pb-90"
        style={{ background: "url(assets/img/bg/sign-up-bg.jpg)" }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-6 col-xl-7 col-lg-8">
              <div className="login-wrapper pos-rel mb-40 wow fadeInUp">
                <div className=" login-inner">
                  <div className="login-content">
                    <h4>{t("login.title")}</h4>
                        <LoginFrom/>
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

export default LoginContent;
