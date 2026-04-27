"use client";
import { AllArtworks, Auction } from "@/data/nice-select-data";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import useGlobalContext from "@/hooks/use-context";
import React from "react";

const ExploreArtsBar = () => {


  const {inputValue, setInputValue} = useGlobalContext()
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputValue(inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
   
  const selectHandler = () => {};
  return (
    <div className="row wow fadeInUp">
      <div className="col-lg-12">
        <form onSubmit={handleSubmit} className="art-filter-row">
          <div className="filter-by-search mb-30">
            <div className="">
              <NiceSelect
                options={AllArtworks}
                defaultCurrent={0}
                onChange={selectHandler}
                name=""
                className="item-category-select"
              />
            </div>
            <div className="filter-search-input">
              <input onChange={handleChange} type="text" placeholder="Search keyword" />
              <button>
                <i className="fal fa-search"></i>
              </button>
            </div>
          </div>
          <div className="filter-by-sale d-flex filter-oction">
            <div className="select-category-title">
              <i className="flaticon-filter"></i> Filters by
            </div>
            <div className="">
              <NiceSelect
                options={Auction}
                defaultCurrent={0}
                onChange={selectHandler}
                name=""
                className="sale-category-select"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExploreArtsBar;
