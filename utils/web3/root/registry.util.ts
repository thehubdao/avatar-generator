import { Operation } from "@futureverse/artm";
import { CHAIN_ID, ROOT_GQL_API_URL } from "../../../constants/root/contract.constant";
import { CampaignParameterName, CommonErrorCode } from "../../../enums/common.enum";
import { Result } from "../../../types/common.type";
import { AssetLink, RootDrop } from "../../../interfaces/citizens.interface";
import { Campaign } from "../../../enums/citizens/common.enum";
import { GetCampaignDrops } from "../citizens.util";
import { GetRootAssetMetadata } from "./contract.util";
import { GetParameter } from "../../firebase.util";
import { FeatureBasic } from "../../../interfaces/common.interface";

export function CreateAssetLinkOperationMessage(schemaPart: string, parent_collection_id: string, parent_token_id: string, child_collection_id: string, child_token_id: string): Result<Operation> {

    if (!schemaPart || !parent_collection_id || !parent_token_id || !child_collection_id || !child_token_id) {
        return { success: false, errMessage: 'Missing information to create "create" asset link operation', errCode: CommonErrorCode.MissingInfo };
    }

    const createAssetLinkOperation: Operation = {
        type: 'asset-link',
        action: 'create',
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
        action: 'delete',
        args: [
            `equippedWith_${schemaPart}`,
            `did:fv-asset:${CHAIN_ID}:root:${parent_collection_id}:${parent_token_id}`,
            `did:fv-asset:${CHAIN_ID}:root:${child_collection_id}:${child_token_id}`,
        ],
    }

    return { success: true, value: createAssetLinkOperation };
}

export async function GetAssetLinks(collection_id: string, token_id: string): Promise<Result<AssetLink[]>> {
    const graphqlLinksQuery = JSON.stringify({
        query: "query Asset($tokenId: String!, $collectionId: CollectionId! ) {\n  asset(tokenId: $tokenId, collectionId: $collectionId) {\n    links {\n      ... on NFTAssetLink {\n        childLinks {\n          asset {\n            tokenId\n            collectionId\n            schema {\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n}",
        variables: { "tokenId": token_id, "collectionId": `${CHAIN_ID}:root:${collection_id}` }
    })

    const result = await fetch(ROOT_GQL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: graphqlLinksQuery,
    });
    const resultText = await result.text();
    const resultJson = JSON.parse(resultText);
    const links = resultJson.data.asset.links.childLinks as AssetLink[];

    return { success: true, value: links };
}

export async function GetRootAssetNewCombination(collection_id: string, token_id: string): Promise<Result<string>> {
    const assetCurrentCombinationResult = await GetRootAssetMetadata(token_id);

    if (!assetCurrentCombinationResult.success) return { success: false, errMessage: assetCurrentCombinationResult.errMessage, errCode: assetCurrentCombinationResult.errCode };

    const assetCurrentCombination = assetCurrentCombinationResult.value.combination;
    const assetCurrentCombinationArray = assetCurrentCombination.split('-');

    const campaignFeaturesResult = await GetParameter<FeatureBasic[]>(Campaign.Based, CampaignParameterName.Features);

    if (!campaignFeaturesResult.success) return { success: false, errMessage: campaignFeaturesResult.errMessage, errCode: campaignFeaturesResult.errCode };
    const campaignFeatures = campaignFeaturesResult.value;

    const rootDrops = await GetCampaignDrops<RootDrop>(Campaign.Based);

    if (!rootDrops.success) return { success: false, errMessage: rootDrops.errMessage, errCode: rootDrops.errCode };
    const rootDropsArray = rootDrops.value;

    const assetLinksResult = await GetAssetLinks(collection_id, token_id);

    if (!assetLinksResult.success) return { success: false, errMessage: assetLinksResult.errMessage, errCode: assetLinksResult.errCode };
    const assetLinks = assetLinksResult.value;

    const newCombinationArray = assetCurrentCombinationArray.map((featureIndex, featureTypeIndex) => {
        const featureType = campaignFeatures[featureTypeIndex];
        const link = assetLinks.find(link => link.asset.schema.name === featureType.meshName);
        if (!link) return 0;
        const dropCollectionId = link.asset.collectionId.split(':')[2];
        const newIndex = rootDropsArray.find(drop => drop.type === link.asset.schema.name && drop.collectionId === dropCollectionId && drop.tokenId === link.asset.tokenId);

        if (!newIndex) return 0;
        return newIndex.index;
    });

    const newCombination = newCombinationArray.join('-');

    return { success: true, value: newCombination };
}

export async function UpdateRootAsset(address: string, collection_id: string, token_id: string): Promise<Result<boolean>> {
    const newCombinationResult = await GetRootAssetNewCombination(collection_id, token_id);

    if (!newCombinationResult.success) return { success: false, errMessage: newCombinationResult.errMessage, errCode: newCombinationResult.errCode };

    const newCombination = newCombinationResult.value;
    console.log(newCombination);
    return { success: true, value: true };
}

