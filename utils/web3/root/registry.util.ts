import { Operation } from "@futureverse/artm";
import { CHAIN_ID, DOMAIN, ORIGIN, ROOT_GQL_API_URL, ROOT_NETWORK_WS_URL } from "../../../constants/root/contract.constant";
import { CampaignParameterName, CommonErrorCode, Module } from "../../../enums/common.enum";
import { Result } from "../../../types/common.type";
import { AssetLink, LinkableToken, RootDrop } from "../../../interfaces/citizens.interface";
import { Campaign } from "../../../enums/citizens/common.enum";
import { GetCampaignDrops } from "../citizens.util";
import { GetRootAssetMetadata } from "./contract.util";
import { GetParameter, StoreAssetData } from "../../firebase.util";
import { FeatureBasic } from "../../../interfaces/common.interface";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import { createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { GetImageUrl } from "../../metadata.util";
import { AssetData } from "../../../interfaces/firebase.interface";
import { LogError } from "../../common.util";
import { AssetRegistryAction } from "../../../enums/root/common.enum";

export function CreateAssetLinkOperationMessage(schemaPart: string, parent_collection_id: string, parent_token_id: string, child_collection_id: string, child_token_id: string): Result<Operation> {

    if (!schemaPart || !parent_collection_id || !parent_token_id || !child_collection_id || !child_token_id) {
        return { success: false, errMessage: 'Missing information to create "create" asset link operation', errCode: CommonErrorCode.MissingInfo };
    }

    const createAssetLinkOperation: Operation = {
        type: 'asset-link',
        action: AssetRegistryAction.Create,
        args: [
            `equippedWith_${schemaPart}`,
            `did:fv-asset:${CHAIN_ID}:root:${parent_collection_id}:${parent_token_id}`,
            `did:fv-asset:${CHAIN_ID}:root:${child_collection_id}:${child_token_id}`,
        ],
    }

    return { success: true, value: createAssetLinkOperation };
}

export function DeleteAssetLinkOperationMessage(schemaPart: string, parent_collection_id: string, parent_token_id: string, child_collection_id: string, child_token_id: string): Result<Operation> {

    if (!schemaPart || !parent_collection_id || !parent_token_id || !child_collection_id || !child_token_id) {
        return { success: false, errMessage: 'Missing information to create "delete" asset link operation', errCode: CommonErrorCode.MissingInfo };
    }

    const createAssetLinkOperation: Operation = {
        type: 'asset-link',
        action: AssetRegistryAction.Delete,
        args: [
            `equippedWith_${schemaPart}`,
            `did:fv-asset:${CHAIN_ID}:root:${parent_collection_id}:${parent_token_id}`,
            `did:fv-asset:${CHAIN_ID}:root:${child_collection_id}:${child_token_id}`,
        ],
    }

    return { success: true, value: createAssetLinkOperation };
}

export async function GetSFTAssetLinks(collection_id: string, token_id: string, walletAddress: string): Promise<Result<LinkableToken[]>> {
    try {
        const graphqlLinksQuery = JSON.stringify({
            query: "query Asset($tokenId: String!, $collectionId: CollectionId!, $addresses: [ChainAddress!]!) {\r\n  asset(tokenId: $tokenId, collectionId: $collectionId) {\r\n    links {\r\n      ... on SFTAssetLink {\r\n        parentLinks(addresses: $addresses) {\r\n          tokenId\r\n        }\r\n      }\r\n    }\r\n  }\r\n}",
            variables: { "tokenId": token_id, "collectionId": `${CHAIN_ID}:root:${collection_id}`, "addresses": [walletAddress] }
        });

        const result = await fetch(ROOT_GQL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: graphqlLinksQuery,
        });
        const resultText = await result.text();
        const resultJson = JSON.parse(resultText);
        const links = resultJson.data.asset.links.parentLinks.map(link => ({
            tokenId: token_id,
            parentTokenId: link.tokenId,
            parentCollectionId: collection_id
        })) as LinkableToken[];

        return { success: true, value: links };
    } catch (error) {
        const e = error as Error;
        LogError(Module.RootRegistryUtil, 'Error on getting SFT asset links');
        return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
    }
}


export async function GetAssetLinks(collection_id: string, token_id: string): Promise<Result<AssetLink[]>> {
    try {
        console.log(collection_id, token_id, CHAIN_ID)
        const graphqlLinksQuery = JSON.stringify({
            query: "query Asset($tokenId: String!, $collectionId: CollectionId! ) {\n  asset(tokenId: $tokenId, collectionId: $collectionId) {\n    links {\n      ... on NFTAssetLink {\n        childLinks {\n          asset {\n            tokenId\n            collectionId\n            schema {\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            variables: { "tokenId": token_id, "collectionId": `${CHAIN_ID}:root:${collection_id}` }
        });

        const result = await fetch(ROOT_GQL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: graphqlLinksQuery,
        });
        const resultText = await result.text();
        const resultJson = JSON.parse(resultText);
        console.log(resultJson)
        const links = resultJson.data.asset.links.childLinks as AssetLink[];

        return { success: true, value: links };
    } catch (error) {
        const e = error as Error;
        LogError(Module.RootRegistryUtil, 'Error on getting asset links');
        console.log(e)
        return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
    }
}

export async function GetLinkableTokenId(collectionId: string, tokenId: string): Promise<Result<LinkableToken>> {
    try {
        const graphqlParentLinkQuery = JSON.stringify({
            query: "query Query($tokenId: String!, $collectionId: CollectionId!) {\n  asset(tokenId: $tokenId, collectionId: $collectionId) {\n    links {\n      ... on NFTAssetLink {\n        id\n        parentLink {\n          id\n          collectionId\n          tokenId\n        }\n      }\n    }\n  }\n}",
            variables: { "tokenId": tokenId, "collectionId": `${CHAIN_ID}:root:${collectionId}` }
        });

        const result = await fetch(ROOT_GQL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: graphqlParentLinkQuery,
        });
        const resultText = await result.text();
        const resultJson = JSON.parse(resultText);
        const parentLink = resultJson.data.asset.links.parentLink;
        const linkableTokenId = parentLink === null ? { tokenId, isLinkable: true } : { tokenId, parentTokenId: parentLink.tokenId, parentCollectionId: parentLink.collectionId, isLinkable: false };

        return { success: true, value: linkableTokenId };
    } catch (error) {
        const e = error as Error;
        return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
    }
}

export async function GetRootAssetNewCombination(assetLinks: AssetLink[], currentCombination: string, campaignFeatures: FeatureBasic[], rootDrops: RootDrop[]): Promise<Result<string>> {
    try {
        const assetCurrentCombinationArray = currentCombination.split('-');
        const newCombinationArray = assetCurrentCombinationArray.map((_, featureTypeIndex) => {
            const featureType = campaignFeatures[featureTypeIndex];
            const link = assetLinks.find(link => link.asset.schema.name === featureType.meshName); //Find if there's a link for the specfic body part type
            if (!link) return 0; // If there's no link, use base feature

            const dropCollectionId = link.asset.collectionId.split(':')[2]; //If there's a link, get the collection id of the link
            const newIndex = rootDrops.find(drop => drop.type === link.asset.schema.name && drop.collectionId === dropCollectionId); //Get the index of the new feature from drops array

            if (!newIndex) return 0;
            return newIndex.index;
        });

        const newCombination = newCombinationArray.join('-'); //Join the new combination array to get the new combination

        return { success: true, value: newCombination };
    } catch (error) {
        const e = error as Error;
        LogError(Module.RootRegistryUtil, 'Error on getting root asset new combination');
        return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
    }
}

export async function GetRootRegistryAuthToken(PK: string): Promise<Result<string>> {
    try {
        const walletClient = createWalletClient({
            account: privateKeyToAccount(`0x${PK}`),
            transport: http(ROOT_NETWORK_WS_URL)
        });

        const message = createSiweMessage({
            version: "1",
            nonce: generateSiweNonce(),
            address: getAddress(walletClient.account.address),
            uri: ORIGIN,
            domain: DOMAIN,
            issuedAt: new Date(),
            expirationTime: new Date(Date.now() + 1000 * 60 * 60),
            chainId: Number(CHAIN_ID),
            statement: ""
        });

        const signature = await walletClient.signMessage({
            message: message,
        });

        const base64Message = Buffer.from(message).toString('base64');
        const base64Signature = Buffer.from(signature).toString('base64');

        const token = `${base64Message}.${base64Signature}`;

        return { success: true, value: token };
    } catch (error) {
        const Error = error as Error;
        LogError(Module.RootRegistryUtil, 'Error on getting root registry auth token');
        return { success: false, errMessage: Error.message, errCode: CommonErrorCode.InternalError };
    }
}


export async function SetRootAssetImageUrl(imageUrl: string, collection_id: string, token_id: string, authToken: string): Promise<Result<boolean>> {
    try {
        const graphqlRegisterAssetImageMutation = JSON.stringify({
            query: "mutation RegisterAssetImage($registerAssetImageInput2: RegisterAssetImageInput!) {\n  registerAssetImage(input: $registerAssetImageInput2) {\n    assetImage {\n      id\n      collectionId\n      tokenId\n      url\n      version\n    }\n  }\n}",
            variables: { "registerAssetImageInput2": { "url": imageUrl, "collectionId": `${CHAIN_ID}:root:${collection_id}`, "tokenId": token_id } }
        })

        const result = await fetch(ROOT_GQL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: graphqlRegisterAssetImageMutation,
        });
        const resultText = await result.text();
        const resultJson = JSON.parse(resultText);
        if (resultJson.errors)
            return { success: false, errMessage: resultJson.errors[0].message, errCode: CommonErrorCode.InternalError };

        return { success: true, value: true };
    } catch (error) {
        const Error = error as Error;
        LogError(Module.RootRegistryUtil, 'Error on setting root asset image url');
        return { success: false, errMessage: Error.message, errCode: CommonErrorCode.InternalError };
    }
}

export async function UpdateRootAsset(collection_id: string, token_id: string, authToken: string): Promise<Result<boolean>> {
    const assetCurrentCombinationResult = await GetRootAssetMetadata(token_id);
    if (!assetCurrentCombinationResult.success) return { success: false, errMessage: assetCurrentCombinationResult.errMessage, errCode: assetCurrentCombinationResult.errCode };
    const assetCurrentCombination = assetCurrentCombinationResult.value.combination;

    const campaignFeaturesResult = await GetParameter<FeatureBasic[]>(Campaign.Based, CampaignParameterName.Features);

    if (!campaignFeaturesResult.success) return { success: false, errMessage: campaignFeaturesResult.errMessage, errCode: campaignFeaturesResult.errCode };
    const campaignFeatures = campaignFeaturesResult.value;

    const rootDrops = await GetCampaignDrops<RootDrop>(Campaign.Based);

    if (!rootDrops.success) return { success: false, errMessage: rootDrops.errMessage, errCode: rootDrops.errCode };
    const rootDropsArray = rootDrops.value;

    const assetLinksResult = await GetAssetLinks(collection_id, token_id);

    if (!assetLinksResult.success) return { success: false, errMessage: assetLinksResult.errMessage, errCode: assetLinksResult.errCode };
    const assetLinks = assetLinksResult.value;

    const newCombinationResult = await GetRootAssetNewCombination(assetLinks, assetCurrentCombination, campaignFeatures, rootDropsArray);

    if (!newCombinationResult.success) return { success: false, errMessage: newCombinationResult.errMessage, errCode: newCombinationResult.errCode };
    const newCombination = newCombinationResult.value;

    const imageUrl = await GetImageUrl(Campaign.Based, newCombination);
    const setRootAssetImageUrlResult = await SetRootAssetImageUrl(imageUrl, collection_id, token_id, authToken);
    if (!setRootAssetImageUrlResult.success) return { success: false, errMessage: setRootAssetImageUrlResult.errMessage, errCode: setRootAssetImageUrlResult.errCode };

    const combinationArray = newCombination.split('-');
    console.log(rootDropsArray);
    const attributes = combinationArray.map((attributeIndex, typeIndex) => {
        console.log(attributeIndex, typeIndex)
        const attribute = rootDropsArray.find(drop => drop.index.toString() === attributeIndex && drop.typeIndex.toString() === typeIndex.toString());
        if (!attribute) throw new Error(`Attribute not found for index: ${attributeIndex}, typeIndex: ${typeIndex}`);
        return {
            collectionId: attribute.collectionId,
            name: attribute.name,
            schemaPart: attribute.schemaPart,
            type: attribute.type,
            index: attribute.index,
        };
    });

    const setRootAssetMetadataResult = await StoreAssetData({
        campaign: Campaign.Based,
        tokenId: token_id,
        collectionId: collection_id,
        combination: newCombination,
        imageUrl: imageUrl,
        attributes
    } as AssetData);

    if (!setRootAssetMetadataResult.success) return { success: false, errMessage: setRootAssetMetadataResult.errMessage, errCode: setRootAssetMetadataResult.errCode };

    return { success: true, value: true };
}