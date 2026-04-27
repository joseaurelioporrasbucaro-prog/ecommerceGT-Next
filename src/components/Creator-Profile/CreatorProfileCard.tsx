
import Image from "next/image";
import React from "react";
interface singleCreatorType {
  singleCreator: any;
}
const CreatorProfileCard = ({ singleCreator }: singleCreatorType) => {
  return (
    <>
      <div className="col-xl-3 col-lg-6 col-md-8">
        <div className="creator-about mb-40 wow fadeInUp">
          <div className="profile-img pos-rel">
            <Image
              style={{ width: "100%", height: "100%" }}
              src={singleCreator?.profileImage}
              alt="img"
            />
          </div>
          <h4 className="artist-name pos-rel">
            {singleCreator?.name}
            <span className="profile-verification verified">
              <i className="fas fa-check"></i>
            </span>
          </h4>
          <div className="artist-id">{singleCreator?.artistId}</div>
          <p>
            My name is Justin Baker & change my occupation after five years of
            working in sales. I still like drawing.
          </p>
          <ul>
            <li>
              <i className="fas fa-map-marker-alt"></i>Bran Street New York, USA
            </li>
            <li>
              <i className="flaticon-link"></i>
              <a href="#">bit.ly/yte89k6</a>
            </li>
            <li>
              <i className="flaticon-calendar"></i>Joined March 2010
            </li>
          </ul>
          <div className="message-creator-btn">
            <a href="#" className="fill-btn icon-left">
              <i className="fas fa-paper-plane"></i>Message to Creator
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatorProfileCard;
