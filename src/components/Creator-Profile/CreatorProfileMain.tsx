"use client"
import React from 'react';
import ThemeChanger from '../home/ThemeChanger';
import ProfileBreadCamb from './ProfileBreadCamb';
import CreatorDetails from './CreatorDetails';
import { IdType } from '@/interFace/interFace';
import { creatorData } from '@/data/creator-data';



const CreatorProfileMain = ({id}:IdType) => {
    const singleCreator = creatorData.find(item=> item.id == id)
    console.log(singleCreator)
    return (
        <>
            <ThemeChanger />
            <ProfileBreadCamb singleCreator={singleCreator}/>
            <CreatorDetails singleCreator={singleCreator}/>

        </>
    );
};

export default CreatorProfileMain;