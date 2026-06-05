import RegisterForm from "@/form/RegisterForm";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";
import bgImg from "../../../public/assets/img/bg/sign-up-social-bg.jpg"
import gmail from "../../../public/assets/img/svg-icon/gmail.svg"
import facebook from "../../../public/assets/img/svg-icon/facebook.svg"
import twitter from "../../../public/assets/img/svg-icon/twitter.svg"
import Image from "next/image";

const SignUpContent = () => {
  const t = useTranslations("auth");
  return (
    <>
      <section
        className="sign-up-area pt-130 pb-90"
        style={{ background: "url(assets/img/bg/sign-up-bg.jpg)" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="sign-up-wrapper pos-rel mb-40 wow fadeInUp">
                <div className="sign-up-inner">
                  <div className="sign-up-content">
                    <h4>{t("register.title")}</h4>
                    <p className="mb-35">
                      {t("register.subtitle")}
                    </p>
                    <RegisterForm/>
                  </div>
                </div>
                <div className="sign-up-with-social">
                  <div
                    className="sign-up-with-social-bg"
                    style={{ backgroundImage: `url(${bgImg.src})`}}
                  ></div>
                  <div className="sign-up-with-social-content">
                    <div className="text-or">{t("register.or")}</div>
                    <div className="sign-up-media">
                      <a href="#" className="sign-up-media-single">
                        <Image
                          src={gmail}
                          alt="media-img"
                          style={{ width: "auto", height: "auto" }}
                        />{" "}
                        {t("register.signupEmail")}
                      </a>
                      <a href="#" className="sign-up-media-single">
                        <Image
                          src={facebook}
                          alt="media-img"
                          style={{ width: "auto", height: "auto" }}
                        />{" "}
                        {t("register.signupFacebook")}
                      </a>
                      <a href="#" className="sign-up-media-single">
                        <Image
                        style={{ width: "auto", height: "auto" }}
                          src={twitter}
                          alt="media-img"
                        />{" "}
                        {t("register.signupTwitter")}
                      </a>
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

export default SignUpContent;
