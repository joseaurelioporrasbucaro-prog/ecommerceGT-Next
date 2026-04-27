import React from "react";
import Link from "next/link";
import Image from "next/image";
interface creatorDataType {
  creator: any;
}
const CreatorSingle = ({ creator }: creatorDataType) => {
  const {
    id,
    coverImage,
    profileImage,
    name,
    artistId,
    create,
    createNumber,
    follower,
    followerNumber,
    followed,
    followedNumber,
    follow,
  } = creator;
  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
      <div className="creator-single mb-30">
        <div className="creator-wraper">
          <div className="creator-inner">
            <div className="creator-cover-img pos-rel">
              <Image width={500}
                      height={300}  style={{ width: "100%", height: "auto" }} src={coverImage} alt="cover-img" />
            </div>
            <div className="creator-content pos-rel">
              <div className="creator-info">
                <div className="profile-img pos-rel oction-creator-profile-img">
                  <Link href={`/creator-profile/${id}`}>
                    <Image
                      width={65}
                      height={65}
                      style={{ width: "auto", height: "100%" }}
                      src={profileImage}
                      alt="cover-img"
                    />
                  </Link>
                  <div className="profile-verification verified">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                <h4 className="artist-name">
                  <Link href={`/creator-profile/${id}`}>{name}</Link>
                </h4>
                <div className="artist-id">{artistId}</div>
              </div>
              <div className="artist-meta-info">
                <div className="artist-meta-item artist-meta-item-border">
                  <div className="artist-meta-type">{create}</div>
                  <div className="artist-created">{createNumber}</div>
                </div>
                <div className="artist-meta-item artist-meta-item-border">
                  <div className="artist-meta-type">{follower}</div>
                  <div className="artist-follwers">{followerNumber}</div>
                </div>
                <div className="artist-meta-item">
                  <div className="artist-meta-type">{followed}</div>
                  <div className="artist-followed">{followedNumber}</div>
                </div>
              </div>
              <div className="artist-follow-btn">
                <button className="follow-artist">{follow}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorSingle;
