import { StaticImageData } from "next/image";
import React from 'react';

// context api data type
export interface AppContextType {
  sideMenuOpen: boolean;
  toggleSideMenu: () => void;
  scrollDirection: string;
  setScrollDirection: React.Dispatch<React.SetStateAction<string>> | undefined;
  inputValue:string;
  setInputValue:React.Dispatch<React.SetStateAction<string>>;
  setSideMenuOpen:React.Dispatch<React.SetStateAction<boolean>>;
  filterType:string;
  setFilterType:React.Dispatch<React.SetStateAction<string>>;
}
//home-categories type
export interface categoriesType{
  id:number;
  icon:()=> JSX.Element;
  title:string;
  description:string;
}


//counter_data type
export interface counterType{
  id?:number;
  icon?:()=> JSX.Element;
  countNum?: number;
  countPlus?:string;
  description?:string;
}



export interface ProductType {
  id?: string;
  wrapperClass?: string;
  img: StaticImageData;
  tag?: string;
  featureClass?: string;
  bid?: string;
  share?: string;
  volume?: string;
  report?: string;
  profileImage: StaticImageData;
  currentBid?: string;
  activity?: string;
  name?: string;
  count?: string;
  title?: string;
  artistId?: string;
  price: string;
  hours?: string;
  days?: string;
  bids?: string;
  coverImage?: StaticImageData;
  create?: string;
  createNumber?: string;
  follower?: string;
  followerNumber?: string;
  followed?: string;
  followedNumber?: string;
  follow?: string;
}

export interface IdType{
  id:string;
}

export interface Activity {
  img: StaticImageData;
  divClass: string;
  icon: string;
  name: string;
  octionName: string;
  author: string;
  time: string;
}

export interface ActivityDataType {
  id: number;
  tabId: string;
  ariaLabelledby: string;
  activityWrapper: Activity[];
}
export interface ActivityNavType {
  id:number;
  navId:string;
  target:string;
  button:string;
}

// 
interface Tag {
  tag: string;
}

interface ViewMember {
  img: StaticImageData;
}

interface QuestionAnswer {
  profileImg: StaticImageData;
  artistName: string;
  date: string;
  time: string;
  comment: string;
  like: number;
  likeTitle: string;
}

interface ForumPost {
  showComment: boolean;
  creatorImg: StaticImageData;
  name: string;
  date: string;
  time: string;
  postQuestion: string;
  postDetails: string;
  tags: Tag[];
  like: number;
  likeTitle: string;
  comment: number;
  commentTitle: string;
  shereTitle: string;
  shere: number;
  viewMember: ViewMember[];
  views: number;
  viewTitle: string;
  questionAnswer?: QuestionAnswer[];
}

export interface ForumDataType {
  id: number;
  tabId: string;
  navId: string;
  forumPost: ForumPost[];
}
export interface CategoryNavType {
  id: number;
  navId:string;
  tabId:string;
  title:string;
  itemNumber:string;
  icon:string;
}

export interface MobileMenuItemType {
  id:number;
  label: string;
  subMenu: boolean;
  subMenuItems?: {
    label: string;
    href: string;
  }[];
  href: string;
}
