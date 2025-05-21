import { Campaign } from "../enums/citizens/common.enum";
import { MintingUiData } from "../interfaces/citizens.interface";

export const MINTING_UI_DATA: Record<Campaign, MintingUiData | undefined> = {
    [Campaign.Kumi]: {
        imgUrl: '/resources/images/campaings/kumi_collection.jpg',
        avatarDescription: '"Kum Kum" inspired the nickname of the football legend Kun Agüero. Today, we honor his nickname and celebrate his career by presenting "KUMI," a FREE-to-claim, 3D interoperable avatar that showcases the future of Web3 gaming and the internet',
        campaignName: 'KUMI CITIZENS',
        campaignDescription: 'Minting a KUMI unlocks the gateway to the Fitchin Universe. It’s your chance to own a unique visual identity that’s truly yours. Dive in, create epic content, flex your avatar, climb the leaderboard, and snag exclusive wearables to stand out in style.',
    },
    [Campaign.Citizens]: undefined,
    [Campaign.Creators]: undefined,
    [Campaign.Based]: undefined
}