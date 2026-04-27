"use client";
import { Time } from "@/data/nice-select-data";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import React from "react";

const NavContent = () => {
  const selectHandler = () => {};
  return (
    <>
      <nav>
        <div className="nav nav-tabs mb-30" id="nav-tab" role="tablist">
          <button
            className="nav-link active"
            id="nav-all-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav1"
            type="button"
            role="tab"
            aria-selected="true"
          >
            <span className="activity-nav-button">All Activities</span>
          </button>
          <button
            className="nav-link"
            id="nav-like-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav2"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Likes</span>
          </button>
          <button
            className="nav-link"
            id="nav-follow-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav3"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Follows</span>
          </button>
          <button
            className="nav-link"
            id="nav-bid-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav4"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Bids</span>
          </button>
          <button
            className="nav-link"
            id="nav-collection-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav5"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Collection</span>
          </button>
          <button
            className="nav-link"
            id="nav-purchase-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav6"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Purchase</span>
          </button>
          <button
            className="nav-link"
            id="nav-sale-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav7"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Sale</span>
          </button>
          <button
            className="nav-link"
            id="nav-comment-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab-nav8"
            type="button"
            role="tab"
            aria-selected="false"
          >
            <span className="activity-nav-button">Comment</span>
          </button>
        </div>
        <div className="filter-by-sale d-flex mb-30">
          <div className="select-category-title">
            <i className="flaticon-filter"></i> Filters by
          </div>
          <div className="">
            <NiceSelect
              options={Time}
              defaultCurrent={0}
              onChange={selectHandler}
              name=""
              className="sale-category-select"
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavContent;
