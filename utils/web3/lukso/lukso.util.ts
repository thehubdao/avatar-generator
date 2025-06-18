import { Campaign, LuksoCampaign } from "../../../enums/citizens/common.enum";
import { CommonErrorCode, Module } from "../../../enums/common.enum";
import { ClaimableDrop } from "../../../interfaces/citizens.interface";
import { Result } from "../../../types/common.type";
import { LogError } from "../../common.util";
import { GetClaimableDrops } from "../../firebase.util";

export async function GetLuksoClaimableDrops(): Promise<Result<Record<LuksoCampaign, ClaimableDrop[]>>> {
    try {
        const claimableDropsMap: Record<LuksoCampaign, ClaimableDrop[]> = {
            [LuksoCampaign.Citizens]: [],
            [LuksoCampaign.Creators]: []
        };
        const campaigns = Object.values(LuksoCampaign);

        const claimableDropsCampaignsPromises = campaigns.map(async (campaign) => {
            const drops = await GetClaimableDrops(campaign as unknown as Campaign);
            if (drops.success) claimableDropsMap[campaign] = drops.value;
            else void LogError(Module.LuksoUtil, `Error fetching claimable drops: ${drops.errMessage}`);
        });
        await Promise.all(claimableDropsCampaignsPromises);

        return { success: true, value: claimableDropsMap };
    } catch (error) {
        void LogError(Module.LuksoUtil, `Error fetching claimable drops: ${error}`);
        return { success: false, errMessage: "Error fetching claimable drops", errCode: CommonErrorCode.FetchError };
    }
}