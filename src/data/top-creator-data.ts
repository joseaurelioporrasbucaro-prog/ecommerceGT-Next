import { StaticImageData } from "next/image";

import profile1 from "../../public/assets/img/profile/profile1.jpg"
import profile2 from "../../public/assets/img/profile/profile2.jpg"
import profile3 from "../../public/assets/img/profile/profile3.jpg"
import profile4 from "../../public/assets/img/profile/profile4.jpg"
import profile5 from "../../public/assets/img/profile/profile5.jpg"
import profile6 from "../../public/assets/img/profile/profile6.jpg"
import profile7 from "../../public/assets/img/profile/profile7.jpg"
import profile8 from "../../public/assets/img/profile/profile8.jpg"

interface TopCreatorType{
    TopCreatorTitle: string;
    TopCreatorImage: StaticImageData,
    TopCreatorCat: string;
    TopCreatorNumber: string;
    TopCreatorBtn: string;
}
interface TopSellerType{
    TopSellerTitle: string;
    TopSellerImage: StaticImageData,
    TopSellerCat: string;
    TopSellerNumber: string;
    TopSellerBtn: string;
}

export const  TopCreator:TopCreatorType[] = [
    {
       TopCreatorTitle: 'Stive Machman',
       TopCreatorImage: profile1,
       TopCreatorCat: '@machman',
       TopCreatorNumber: '820',
       TopCreatorBtn: 'Created',
    },
    {
       TopCreatorTitle: 'Jobanico Mina',
       TopCreatorImage: profile2,
       TopCreatorCat: '@jobanico',
       TopCreatorNumber: '80',
       TopCreatorBtn: 'Created',
    },
    {
       TopCreatorTitle: 'Walter Russell',
       TopCreatorImage: profile3,
       TopCreatorCat: '@russell',
       TopCreatorNumber: '82',
       TopCreatorBtn: 'Created',
    },
    {
       TopCreatorTitle: 'Mary Callahan',
       TopCreatorImage: profile4,
       TopCreatorCat: '@mary.hano',
       TopCreatorNumber: '720',
       TopCreatorBtn: 'Created',
    },
    {
       TopCreatorTitle: 'John Schreffler',
       TopCreatorImage: profile5,
       TopCreatorCat: '@john.874',
       TopCreatorNumber: '870',
       TopCreatorBtn: 'Created',
    },
    {
       TopCreatorTitle: 'Kenny Chess',
       TopCreatorImage: profile6,
       TopCreatorCat: '@chess.62',
       TopCreatorNumber: '80',
       TopCreatorBtn: 'Created',
    },

 ];

 export const TopSeller:TopSellerType[] = [
    {
       TopSellerTitle: 'Jeffrey Hayes',
       TopSellerImage: profile7,
       TopSellerCat: '@jerrifo',
       TopSellerNumber: '880',
       TopSellerBtn: 'Created',
    },
    {
       TopSellerTitle: 'Patricia Stephens',
       TopSellerImage: profile8,
       TopSellerCat: '@stephens',
       TopSellerNumber: '820',
       TopSellerBtn: 'Created',
    },
    {
       TopSellerTitle: 'Stive Machman',
       TopSellerImage: profile1,
       TopSellerCat: '@machman',
       TopSellerNumber: '840',
       TopSellerBtn: 'Created',
    },
    {
       TopSellerTitle: 'Jobanico Mina',
       TopSellerImage: profile2,
       TopSellerCat: '@Jobanico',
       TopSellerNumber: '420',
       TopSellerBtn: 'Created',
    },
    {
       TopSellerTitle: 'Walter Russell',
       TopSellerImage: profile3,
       TopSellerCat: '@russel',
       TopSellerNumber: '82',
       TopSellerBtn: 'Created',
    },
    {
       TopSellerTitle: 'Mary Callahan',
       TopSellerImage: profile4,
       TopSellerCat: '@mary.hano',
       TopSellerNumber: '720',
       TopSellerBtn: 'Created',
    },

 ];