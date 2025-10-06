import { CommonErrorCode, Module } from "../../../enums/common.enum";
import { FeatureClaimableDrop } from "../../../interfaces/citizens.interface";
import { Result } from "../../../types/common.type";
import { LogError } from "../../common.util";
import { GetClaimableDrops } from "../../firebase.util";
import { GetUserWearableClaimedAmount } from "./contract.util";
import { LuksoCampaignConstant } from "../../../constants/campaign.constant";
import { LuksoCampaign } from "../../../types/citizens.type";

export async function GetLuksoClaimableDrops(walletAddress: string): Promise<Result<Record<LuksoCampaign, FeatureClaimableDrop[]>>> {
    try {
        const claimableDropsMap: Record<LuksoCampaign, FeatureClaimableDrop[]> = {
            [LuksoCampaignConstant.Citizens]: [],
            [LuksoCampaignConstant.Creators]: []
        };
        const campaigns = Object.values(LuksoCampaignConstant);

        const claimableDropsCampaignsPromises = campaigns.map(async (campaign) => {
            const drops = await GetClaimableDrops(campaign);
            if (drops.success) {
                const dropswithClaimAmountPromises = drops.value.map(async drop => {
                    const claimedAmount = await GetUserWearableClaimedAmount(walletAddress, drop);
                    const claimed = claimedAmount.success ? claimedAmount.value : 0;
                    const isLimitReached  = claimed >= drop.claimLimit;

                    const newDrop: FeatureClaimableDrop = {
                        ...drop,
                        claimedAmount: claimed,
                        isLimitReached ,
                    };

                    return newDrop;
                });
                const dropsWithClaimAmount = await Promise.all(dropswithClaimAmountPromises);
                claimableDropsMap[campaign] = dropsWithClaimAmount;
            }
            else void LogError(Module.LuksoUtil, `Error fetching claimable drops: ${drops.errMessage}`);
        });
        await Promise.all(claimableDropsCampaignsPromises);
        return { success: true, value: claimableDropsMap };
    } catch (error) {
        void LogError(Module.LuksoUtil, `Error fetching claimable drops: ${error}`);
        return { success: false, errMessage: "Error fetching claimable drops", errCode: CommonErrorCode.FetchError };
    }
}