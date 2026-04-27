import { bidsData } from "@/data/bids-data";
import Image from "next/image";
import Link from "next/link";
import React from "react";
const TotalBids = () => { 
  return (
    <>
      <div className="bids-items-wrapper mb-30">
        <div className="placed-bids-wrapper">
          {bidsData.map((item) => (
            <div key={item.id} className="single-bid">
              <div className="creator">
                <div className="profile-img pos-rel">
                  <Link href="/creator-profile">
                    <Image
                      src={item.profilePic}
                      alt="profile-img"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Link>
                </div>
                <div className="creator-name-id">
                  <h4 className="artist-name">
                    <Link href="/creator-profile">{item.name}</Link>
                  </h4>
                  <div className="artist-id">{item.artistid}</div>
                  <div className="bid-date-time">
                    <div className="bid-date"> {item.date} </div>
                    <div className="bid-time">{item.time}</div>
                  </div>
                </div>
              </div>
              <div className="bid-items-and-price">
                <div className="bid-items">
                  {/* loop  */}
                  {item.bidsItem.map((itm, index) => (
                    <div key={index} className="art-item-single">
                      <div className="art-item-wraper">
                        <div className="art-item-inner">
                          <div className="art-item-img pos-rel">
                            <Link href="/explore-arts">
                              <Image
                                width={50}
                                height={50}
                                style={{ width: "100%", height: "auto" }}
                                src={itm.img}
                                alt="art-img"
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bid-pricing">
                  <div className="bid-status">
                    Status : <span className={item.status === "Pending"? "pending" :"accepted"} >{item.status}</span>
                  </div>
                  <div className="bid-price">{item.price}</div>
                  <div className="bid-price-dollar">{item.oldPrice}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TotalBids;
