import { FaqData } from "@/data/faq-data";
import Link from "next/link";
import React from "react";

const FAQContent = () => {
    
  return (
    <>
      <section className="about-info-area pt-130 pb-90">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 order-2 order-lg-1">
              <div className="faq-tab-contents mb-0 wow fadeInUp">
                <div className="tab-content" id="nav-tabContent">
                  {FaqData.map((item, index) => (
                    <div
                      key={item.id}
                      className={`tab-pane fade ${
                        index === 0 ? "active show" : ""
                      }`}
                      id={item.tabId}
                      role="tabpanel"
                      aria-labelledby={item.tabId}
                    >
                      <div className="about-info-wrapper mb-30">
                        <div
                          className="accordion accordion-general"
                          id={item.AccordionId}
                        >
                          {item.accordion.map((itm, index) => (
                            <div key={index} className="accordion-item">
                              <h2
                                className="accordion-header"
                                id={itm.accordingId}
                              >
                                <button
                                  className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#${itm.collpseId}`}
                                  aria-expanded={index === 0 ? "true" :"false"}
                                  aria-controls={itm.collpseId}
                                >
                                  {itm.faqTitle}
                                </button>
                              </h2>
                              <div
                                id={itm.collpseId}
                                className={`accordion-collapse ${index === 0 ? "collapse show" : "collapse"}`}
                                aria-labelledby={itm.accordingId}
                                data-bs-parent={`#${item.AccordionId}`}
                              >
                                <div className="accordion-body">
                                  {itm.faqDetails}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-4 order-1 order-lg-2">
              <div className="page-sidebar">
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-12">
                    <div className="sidebar-tab-nav sidebar-widget-single mb-30 wow fadeInUp">
                      <nav>
                        <div
                          className="nav nav-tabs"
                          id="nav-tab"
                          role="tablist"
                        >
                          <button
                            className="nav-link active"
                            id="nav-tab1"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav1"
                            type="button"
                            role="tab"
                            aria-selected="true"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-home"></i>General
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-tab2"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav2"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-account"></i>Account
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-tab3"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav3"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-image"></i>Upload Artwork
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-tab4"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav4"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-wallet-2"></i>Wallet
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-tab5"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav5"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-transaction"></i>
                              Transaction
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-tab6"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav6"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-shopping-cart"></i>Purchase
                              & Sale
                            </span>
                          </button>
                          <button
                            className="nav-link"
                            id="nav-tab7"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-nav7"
                            type="button"
                            role="tab"
                            aria-selected="false"
                          >
                            <span className="sidebar-nav-link">
                              <i className="flaticon-support"></i>Contact &
                              Support
                            </span>
                          </button>
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="faq-note text-center mt-10 mb-30 wow fadeInUp">
            <div className="note">
              These information are not helping you?{" "}
              <Link className="text-btn" href="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQContent;
