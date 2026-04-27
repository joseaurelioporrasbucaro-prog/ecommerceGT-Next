"use client"
import React from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import { Currency, Illustration, Percentage } from "@/data/nice-select-data";
import DragDropSection from "./DragDropSection";

const UploadMain = () => {
    const selectHandler = () => {};
  return (
    <>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle="Upload Artwork"
        breadcrumbSubTitle="Upload Artwork"
      />

      <div className="upload-area pt-130 pb-90">
        <div className="container">
          <div className="upload-wrapper mb-10">
            <form action="#" className="upload-form">
              <div className="row">
                <div className="col-lg-8">
                  <div className="row wow fadeInUp">
                    <div className="col-md-6">
                      <div className="single-input-unit">
                        <label>Artwork Name</label>
                        <input type="text" placeholder="Artwork Name" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="single-input-unit">
                        <label>Category</label>
                        <div className=" w-full">
                         
                          <NiceSelect
                            options={Illustration}
                            defaultCurrent={0}
                            onChange={selectHandler}
                            name=""
                            className="art-category-select art-category-select2 w-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="sale-categoty-box">
                        <div className="sale-category-box-title">
                          <i className="flaticon-coin"></i>Fixed
                        </div>
                        <p>
                          By select this option you can set your item price
                          fixed.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="sale-categoty-box">
                        <div className="sale-category-box-title">
                          <i className="flaticon-information"></i>Open for Bid
                        </div>
                        <p>
                          By select this option you can set your item price
                          fixed.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="sale-categoty-box">
                        <div className="sale-category-box-title">
                          <i className="flaticon-clock-circular-outline"></i>
                          Auction
                        </div>
                        <p>
                          By select this option you can set your item price
                          fixed.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="single-input-unit">
                        <label>Price</label>
                        <input type="text" placeholder="Price" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="single-input-unit">
                        <label>Auction Time</label>
                        <input
                          type="text"
                          placeholder="05 / 03 / 2021 - 05 / 05 / 2021"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="single-input-unit">
                        <label>Currency</label>
                        <div className=" w-full">
                       

                          <NiceSelect
                            options={Currency}
                            defaultCurrent={0}
                            onChange={selectHandler}
                            name=""
                            className="currency-select w-full art-category-select2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="single-input-unit">
                        <label>Royalty</label>
                        <div className=" w-full">
                     
                          
                          <NiceSelect
                            options={Percentage}
                            defaultCurrent={0}
                            onChange={selectHandler}
                            name=""
                            className="royalty-select w-full art-category-select2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="single-input-unit">
                        <label>Item Description</label>
                        <textarea placeholder="Write Description"></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="upload-btn wow fadeInUp">
                    <button id="upload-btn" className="fill-btn">
                      Upload Now
                    </button>
                    <button id="preview-btn" className="fill-btn-orange">
                      Preview
                    </button>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <div className="col-lg-12 col-md-12">
                      <DragDropSection/>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadMain;
