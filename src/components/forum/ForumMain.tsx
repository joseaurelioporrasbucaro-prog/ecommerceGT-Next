"use client";
import React,{useState} from "react";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";
import NiceSelect from "@/elements/niceSelect/NiceSelect";
import { Categorys } from "@/data/nice-select-data";
import Pagination from "@/utils/Pagination";
import { forumData } from "@/data/forum-data";
import Link from "next/link";
import Image from "next/image";
import thumb from "../../../public/assets/img/profile/profile4.jpg";
import CreateQuestion from "@/form/CreateQuestion";
import CategoryNav from "./CategoryNav";
const ForumMain = () => {
   const [itemId, setItemId] = useState(1) 
  const selectHandler = () => {};
  return (
    <>
      <ThemeChanger />
      <Breadcrumbs
        breadcrumbTitle="Forum & Community"
        breadcrumbSubTitle="Forum & Community"
      />
      <section className="about-info-area pt-130 pb-90">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-12">
              <div className="forum-search-bar">
                <div className="filter-by-search mb-30">
                  <div className="">
                    <NiceSelect
                      options={Categorys}
                      defaultCurrent={0}
                      onChange={selectHandler}
                      name=""
                      className="question-category-select"
                    />
                  </div>
                  <form action="#" className="filter-search-input">
                    <input type="text" placeholder="Search keyword" />
                    <button>
                      <i className="fal fa-search"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 order-2 order-lg-1">
              <div className="forum-tab-contents mb-0 wow fadeInUp">
                <div className="tab-content" id="nav-tabContent">
                  {forumData.map((item) => (
                    <div
                      key={item.id}
                      className={`tab-pane fade ${item.id === itemId ? "active show" : ""}`}
                      id="tab-nav1"
                      role="tabpanel"
                      aria-labelledby="nav-tab1"
                    >
                      <div className="forum-post-wrapper mb-30">
                        {item.forumPost.map((post, index) => (
                          <div
                            key={index}
                            className={`q-single-wrapper mb-30 ${
                              post.showComment === true ? "comments-show" : ""
                            }`}
                          >
                            <div className="q-single-content">
                              <div className="author-name-time">
                                <div className="profile-img pos-rel">
                                  <Link href="/creator-profile">
                                    <Image
                                      src={post.creatorImg}
                                      alt="profile-img"
                                      width={50}
                                      height={50}
                                      style={{ width: "100%", height: "auto" }}
                                    />
                                  </Link>
                                </div>
                                <div className="name-post-time">
                                  <h4 className="artist-name">
                                    <Link href="/creator-profile">
                                      {" "}
                                      {post.name}{" "}
                                    </Link>
                                  </h4>
                                  <div className="post-date-time">
                                    <div className="post-date">
                                      {" "}
                                      {post.date}{" "}
                                    </div>
                                    <div className="post-time item-border-before">
                                      {" "}
                                      {post.time}{" "}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <h4 className="post-question">
                                {" "}
                                {post.postQuestion}{" "}
                              </h4>
                              <p> {post.postDetails} </p>
                              <div className="tags-list post-inner-tags">
                                {post.tags.map((tagItem, index) => (
                                  <Link key={index} href="" className="tag">
                                    #{tagItem.tag}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <div className="q-meta-content">
                              <div className="q-meta-item">
                                <div className="q-meta-icon">
                                  <i className="flaticon-heart"></i>
                                </div>
                                <div className="q-meta-likes">
                                  {" "}
                                  {post.like}{" "}
                                </div>
                                <div className="q-meta-type">
                                  {" "}
                                  {post.likeTitle}{" "}
                                </div>
                              </div>
                              <div className="q-meta-item">
                                <a href="#">
                                  <div className="q-meta-icon">
                                    <i className="flaticon-chatting"></i>
                                  </div>
                                  <div className="q-meta-comments">
                                    {" "}
                                    {post.comment}{" "}
                                  </div>
                                  <div className="q-meta-type">
                                    {" "}
                                    {post.commentTitle}{" "}
                                  </div>
                                </a>
                              </div>
                              <div className="q-meta-item">
                                <div className="q-meta-icon">
                                  <i className="flaticon-share-1"></i>
                                </div>
                                <div className="q-meta-shares">
                                  {" "}
                                  {post.shere}{" "}
                                </div>
                                <div className="q-meta-type">
                                  {" "}
                                  {post.shereTitle}{" "}
                                </div>
                              </div>
                              <div className="q-meta-item">
                                <div className="q-meta-viewed-member">
                                  {post.viewMember.map((member, index) => (
                                    <div
                                      key={index}
                                      className="profile-img pos-rel"
                                    >
                                      <Link href="/creator-profile">
                                        <Image
                                          src={member.img}
                                          alt="profile-img"
                                          width={35}
                                          height={35}
                                          style={{
                                            width: "100%",
                                            height: "auto",
                                          }}
                                        />
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                                <div className="q-meta-views">
                                  +{post.views}
                                </div>
                                <div className="q-meta-type">
                                  {" "}
                                  {post.viewTitle}{" "}
                                </div>
                              </div>
                            </div>
                            {post.questionAnswer?.length ? (
                              <>
                                <form
                                  action="#"
                                  className="q-write-answer mb-30"
                                >
                                  <div className="profile-img pos-rel">
                                    <Link href="/creator-profile">
                                      <Image
                                        src={thumb}
                                        width={45}
                                        height={45}
                                        style={{
                                          width: "100%",
                                          height: "auto",
                                        }}
                                        alt="profile-img"
                                      />
                                    </Link>
                                  </div>
                                  <div className="answer-submit">
                                    <textarea
                                      name="answer"
                                      placeholder="Your answer"
                                    ></textarea>
                                    <div className="answer-submit-btn">
                                      <button className="fill-btn">
                                        Answer
                                      </button>
                                    </div>
                                  </div>
                                </form>
                                <div className="q-answers mb-30">
                                  {post.questionAnswer.map(
                                    (postItem, index) => (
                                      <div
                                        key={index}
                                        className="q-single-answer"
                                      >
                                        <div className="author-name-time">
                                          <div className="profile-img pos-rel">
                                            <Link href="/creator-profile">
                                              <Image
                                                src={postItem.profileImg}
                                                alt="profile-img"
                                                width={50}
                                                height={50}
                                                style={{
                                                  width: "100%",
                                                  height: "auto",
                                                }}
                                              />
                                            </Link>
                                          </div>
                                          <div className="name-post-time">
                                            <h4 className="artist-name">
                                              <Link href="/creator-profile">
                                                {" "}
                                                {postItem.artistName}{" "}
                                              </Link>
                                            </h4>
                                            <div className="post-date-time">
                                              <div className="post-date">
                                                {" "}
                                                {postItem.date}{" "}
                                              </div>
                                              <div className="post-time item-border-before">
                                                {" "}
                                                {postItem.time}{" "}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="answer-text">
                                          {postItem.comment}
                                        </div>
                                        <div className="ans-meta-content">
                                          <div className="q-meta-item">
                                            <div className="q-meta-icon">
                                              <i className="flaticon-heart"></i>
                                            </div>
                                            <div className="q-meta-likes">
                                              {postItem.like}
                                            </div>
                                            <div className="q-meta-type">
                                              {" "}
                                              {postItem.likeTitle}{" "}
                                            </div>
                                          </div>
                                          <div className="q-meta-item">
                                            <button>
                                              <span className="q-meta-icon">
                                                <i className="flaticon-share-1"></i>
                                              </span>
                                              <span className="q-meta-type">
                                                Reply
                                              </span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="q-answers-btn">
                              <a href="#" className="border-btn">
                                <i className="flaticon-reload"></i>View More
                                Answers
                              </a>
                            </div>
                              </>
                            ) : (
                              <></>
                            )}
                           
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4 order-1 order-lg-2">
              <div className="page-sidebar">
                <div className="crate-question-wrapper mb-30">
                  <a
                    className="create-question-btn"
                    data-bs-toggle="collapse"
                    href="#collapseExample"
                    role="button"
                    aria-expanded="false"
                    aria-controls="collapseExample"
                  >
                    Create Your Question
                  </a>
                  <div className="collapse mt-30" id="collapseExample">
                    <div className="card card-body">
                      <CreateQuestion />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 col-md-6">
                    <div className="sidebar-tab-nav sidebar-widget-single mb-30 wow fadeInUp">
                      <h4 className="sidebar-widget-title">Category</h4>
                      <CategoryNav setItemId={setItemId} itemId={itemId}/>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-6">
                    {/* <PopularTagsSidebar /> */}
                  </div>
                  <div className="col-lg-12 col-md-6">
                    {/* <ForumAuctionSidebar /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row wow fadeInUp">
            <div className="col-12">
              <Pagination />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForumMain;
