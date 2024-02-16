import { NextApiRequest, NextApiResponse } from "next";
import { AddTierDistribution } from "../../../utils/firebase.util";
import { FeatureInterface } from "../../../interfaces/api.interface";

// Updates tier distributions by list of features provided
// Add only 1 to the distribution counter
// Disabled feature if it reaches the limit minted
export async function PostApiHandler(req: NextApiRequest, res: NextApiResponse) {
    const { campaign, features } = req.body

    // Add +1 to the counter
    const updates = features.map((feat: FeatureInterface) => {
        return AddTierDistribution(campaign, feat)
    })
    
    // Wait until everything is ok
    await Promise.all(updates)

    return res.json({
        message: "tier distribution updated",
        success: true,
        data: {}
    })
}
