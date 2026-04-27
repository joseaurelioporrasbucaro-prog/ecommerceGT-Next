import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import ContactFormSection from "@/form/ContactFormSection";
import ContactMap from "./ContactMap";

const ContactMain = () => {
  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Contact" breadcrumbSubTitle="Contact" />
      <section className="contact-area pt-120 pb-90">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8">
                            <ContactFormSection />
                        </div>
                        <div className="col-lg-4">
                            <ContactMap />
                        </div>
                    </div>
                </div>
            </section>
    </>
  );
};

export default ContactMain;
