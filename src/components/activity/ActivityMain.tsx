"use client";
import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import NavContent from "./NavContent";
import Link from "next/link";
import { activityData } from "@/data/activity-data";
import Image from "next/image";
const ActivityMain = () => {
  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Activity" breadcrumbSubTitle="Activity" />
      <div className="activity-area pt-130 pb-90">
        <div className="container">
          <div className="activity-wrapper mb-40">
            <div className="activity-tab">
              <div className="activity-tab-nav wow fadeInUp">
                <NavContent />
              </div>
              <div className="activity-tab-contents mb-30 wow fadeInUp">
                <div className="tab-content" id="nav-tabContent">
                  {activityData.map((item) => (
                    <div
                      key={item.id}
                      className={`tab-pane fade ${
                        item.id === 1 ? "active show" : ""
                      }`}
                      id={item.tabId}
                      role="tabpanel"
                      aria-labelledby={item.ariaLabelledby}
                    >
                      <div className="activity-wrapper-actions activity-wrapper-all mb-30">
                        {item.activityWrapper.map((itm, num) => (
                          <div
                            key={num}
                            className="activity-wrapper-action-single pos-rel"
                          >
                            <div className="activity-3dots-menu">
                              <button className="art-3dots-icon">
                                <i className="fal fa-ellipsis-v"></i>
                              </button>
                            </div>
                            <div className="profile-img pos-rel">
                              <Link href="/creator-profile">
                                <Image
                                  src={itm.img}
                                  alt="profile-img"
                                  width={50}
                                  height={50}
                                  style={{ width: "100%", height: "auto" }}
                                />
                              </Link>
                              <div className={itm.divClass}>
                                <i className={itm.icon}></i>
                              </div>
                            </div>
                            <div className="activity-meta-text">
                              <div className="actvity-text">
                                <Link href="/creator-profile">{itm.name}</Link>{" "}
                                purchased{" "}
                                <Link href="/art-details">
                                  {itm.octionName}
                                </Link>{" "}
                                posted by{" "}
                                <Link href="/creator-profile">
                                  {itm.author}
                                </Link>
                              </div>
                              <div className="activity-time"> {itm.time} </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="more-activity-btn mb-30 text-center">
                        <button className="fill-btn">Load More</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityMain;
