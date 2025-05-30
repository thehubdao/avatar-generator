import { Campaign } from "../enums/citizens/common.enum";
import { MintingUiData } from "../interfaces/citizens.interface";

export const MINTING_UI_DATA: Record<Campaign, MintingUiData | undefined> = {
    [Campaign.Kumi]: {
        imgUrl: '/resources/images/campaings/kumi_collection.jpg',
        avatarDescription: '"Kum Kum" inspired the nickname of the football legend Kun Agüero. Today, we honor his nickname and celebrate his career by presenting "KUMI", 3D interoperable avatar that showcases the future of Web3 gaming and the internet',
        campaignName: 'KUMI CITIZENS',
        campaignDescription: 'Minting a KUMI unlocks the gateway to the Fitchin Universe. It’s your chance to own a unique visual identity that’s truly yours. Dive in, create epic content, flex your avatar, climb the leaderboard, and snag exclusive wearables to stand out in style.',
    },
    [Campaign.Citizens]: undefined,
    [Campaign.Creators]: undefined,
    [Campaign.Based]: {
        imgUrl: '/resources/images/campaings/based_collection.jpg',
        avatarDescription: "In a world dominated by adorable animals and quirky characters, Root Citizens emerge as the rebels who dare to be different. They are here to challenge the status quo, bullying the funny-looking creatures and taking over their realm through cunning scams and degenerate tactics.",
        campaignName: 'BASED CITIZENS',
        campaignDescription: "Mint a Root Citizen and step into the shoes of a rebel in Futureverse. Your avatar is a symbol of your commitment to challenging the norm. With Root Citizen, you can engage in competitive gaming, create and trade unique assets using The Root Network's advanced features, and connect with a community that values risk-taking and degen activities",
    }
}