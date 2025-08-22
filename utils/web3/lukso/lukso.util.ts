import { Campaign, LuksoCampaign } from "../../../enums/citizens/common.enum";
import { CommonErrorCode, Module } from "../../../enums/common.enum";
import { ClaimableDrop } from "../../../interfaces/citizens.interface";
import { Result } from "../../../types/common.type";
import { LogError } from "../../common.util";
import { GetClaimableDrops } from "../../firebase.util";
import { GetUserWearableClaimedAmount } from "./contract.util";

export async function GetLuksoClaimableDrops(walletAddress: string): Promise<Result<Record<LuksoCampaign, ClaimableDrop[]>>> {
    try {
        const claimableDropsMap: Record<LuksoCampaign, ClaimableDrop[]> = {
            [LuksoCampaign.Citizens]: [],
            [LuksoCampaign.Creators]: []
        };
        const campaigns = Object.values(LuksoCampaign);

        const claimableDropsCampaignsPromises = campaigns.map(async (campaign) => {
            const drops = await GetClaimableDrops(campaign as unknown as Campaign);
            if (drops.success) {
                const dropswithClaimAmountPromises = drops.value.map(async drop => {
                    const claimedAmount = await GetUserWearableClaimedAmount(walletAddress, drop);

                    if (!claimedAmount.success) return drop;

                    if (claimedAmount.value >= drop.claimLimit) drop.isClaimable = false;
                    else drop.isClaimable = true;

                    drop.claimedAmount = claimedAmount.value;

                    return drop;
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