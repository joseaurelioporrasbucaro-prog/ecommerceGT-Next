import { categoryNavData } from "@/data/forum-data";
import React from "react";

interface propsType{
    itemId:number;
    setItemId:React.Dispatch<React.SetStateAction<number>>;
}

const CategoryNav = ({itemId,setItemId}:propsType) => {
  return (
    <>
      <nav>
        <div className="nav nav-tabs" id="nav-tab" role="tablist">
          {categoryNavData.map((item) => (
            <button
              onClick={()=>setItemId(item.id)}
              key={item.id}
              className={`nav-link ${item.id === itemId ? "active" : ""}`}
              id={item.navId}
              data-bs-toggle="tab"
              data-bs-target={`#${item.tabId}`}
              type="button"
              role="tab"
              aria-selected={item.id === itemId}
            >
              <span className="sidebar-nav-link">
                <i className="flaticon-home"></i>{item.title}
                <span className="inner-item-number">{item.itemNumber}</span>
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default CategoryNav;
