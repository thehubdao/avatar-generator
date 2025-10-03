import { CampaignConstant } from "./campaign.constant";
import { MintingUiData } from "../interfaces/citizens.interface";
import { Campaign } from "../types/citizens.type";

export const MINTING_UI_DATA: Record<Campaign, MintingUiData | undefined> = {
    [CampaignConstant.Kumi]: {
        imgUrl: '/resources/images/campaings/kumi_collection.jpg',
        avatarDescription: '"Kum Kum" inspired the nickname of the football legend Kun Agüero. Today, we honor his nickname and celebrate his career by presenting "KUMI", 3D interoperable avatar that showcases the future of Web3 gaming and the internet',
        campaignName: 'KUMI CITIZENS',
        campaignDescription: 'Minting a KUMI unlocks the gateway to the Fitchin Universe. It’s your chance to own a unique visual identity that’s truly yours. Dive in, create epic content, flex your avatar, climb the leaderboard, and snag exclusive wearables to stand out in style.',
    },
    [CampaignConstant.Citizens]: undefined,
    [CampaignConstant.Creators]: undefined,
    [CampaignConstant.Polygon]: {
        imgUrl: '/resources/images/campaings/polygon-creators-collection.jpg',
        avatarDescription: 'In a chain full of plush mascots and meme skins, Polygon Citizens show up to cut the fluff and run the game. Mint your Citizen, claim wearables from your onchain record, then raid LP farm and flip until your wardrobe is proof and your crew takes the map with pure degen intent.',
        campaignName: 'POLYGON CITIZENS',
        campaignDescription: 'Mint a Polygon Citizen and step into rebel mode in the Polygon ecosystem. Your avatar signals you are here to flip the meta, claim wearables from your onchain record, and turn play and DeFi into a single grind. Queue for raids, stake and LP for yield, craft and trade assets, and squad up with a community that lives for high conviction moves and clean degen fun.',
    },
    [CampaignConstant.Based]: {
        imgUrl: '/resources/images/campaings/based_collection.jpg',
        avatarDescription: "In a world dominated by adorable animals and quirky characters, Root Citizens emerge as the rebels who dare to be different. They are here to challenge the status quo, bullying the funny-looking creatures and taking over their realm through degenerate tactics.",
        campaignName: 'ROOT CITIZENS',
        campaignDescription: "Mint a Root Citizen and step into a new standard of digital identity, one that travels with you wherever you go. Your avatar is a symbol of your commitment to challenging the norm. Built using the Universal Base Framework (UBF), each Root Citizen is game-engine ready and fully portable across 200+ virtual environments like GTA V, Nifty Island, VRChat, and more. Mint your Citizen. Export your identity. Equip your future. Rebel to the status quo!",
    }
}