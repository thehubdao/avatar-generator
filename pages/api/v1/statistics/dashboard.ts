import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { RequestResponse } from '../../../../server/api-handler/request.api-handler';
import { DefaultApiResponse } from '../../../../server/enums/api.enum';
import { FirebaseUtil } from '../../../../utils/firebase.util';
import { LogError } from '../../../../utils/common.util';
import { Module } from '../../../../enums/common.enum';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';

interface DashboardStats {
  daily: {
    campaigns: Record<string, { date: string; count: number; unique_users?: number; campaign: string }[]>;
    global: { date: string; total_sessions: number; unique_users?: number; new_users?: number }[];
  };
  historical: {
    total_sessions: number;
    total_unique_users?: number;
    total_real_users?: number;
    total_campaign_usage: Record<string, number>;
    total_campaign_unique_users?: Record<string, number>;
    lastUpdated: string;
  };
}

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DashboardStats>>
) {
  if (req.method !== 'GET') {
    return RequestResponse(res, "BadRequest", false, DefaultApiResponse.BadRequest);
  }

  try {
    const db = await FirebaseUtil.Instance().DB();
    
    // Get recent daily data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];


    // Get campaign daily stats
    const campaignStats: Record<string, any[]> = {};
    const campaignCollection = collection(db, 'statistics', 'daily_usage', 'campaigns');
    const campaignDocs = await getDocs(query(campaignCollection, limit(1000)));
    
    campaignDocs.forEach(doc => {
      const data = doc.data();
      if (data.date >= cutoffDate) {
        if (!campaignStats[data.campaign]) {
          campaignStats[data.campaign] = [];
        }
        campaignStats[data.campaign].push({
          date: data.date,
          count: data.count || 0,
          unique_users: data.unique_users || 0,
          campaign: data.campaign
        });
      }
    });

    // Get global daily stats
    const globalStats: any[] = [];
    const globalCollection = collection(db, 'statistics', 'daily_usage', 'global');
    const globalDocs = await getDocs(query(globalCollection, orderBy('date', 'desc'), limit(30)));
    
    globalDocs.forEach(doc => {
      const data = doc.data();
      globalStats.push({
        date: data.date,
        total_sessions: data.total_sessions || 0,
        unique_users: data.unique_users || 0,
        new_users: data.new_users || 0
      });
    });

    // Get historical totals
    let historicalData = {
      total_sessions: 0,
      total_unique_users: 0,
      total_real_users: 0,
      total_campaign_usage: {},
      total_campaign_unique_users: {},
      lastUpdated: new Date().toISOString()
    };

    try {
      const historicalRef = doc(db, 'statistics', 'totals');
      const historicalDoc = await getDoc(historicalRef);
      
      if (historicalDoc.exists()) {
        const data = historicalDoc.data();
        historicalData = {
          total_sessions: data.total_sessions || 0,
          total_unique_users: data.total_unique_users || 0,
          total_real_users: data.total_real_users || 0,
          total_campaign_usage: data.total_campaign_usage || {},
          total_campaign_unique_users: data.total_campaign_unique_users || {},
          lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }
    } catch (error) {
      LogError(Module.ApiUtil, 'Error fetching historical data:', error);
    }

    const dashboardStats: DashboardStats = {
      daily: {
        campaigns: campaignStats,
        global: globalStats.reverse() // Most recent first
      },
      historical: historicalData
    };

    return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess, dashboardStats);

  } catch (error) {
    LogError(Module.ApiUtil, 'Error fetching dashboard statistics:', error);
    return RequestResponse(res, "ServerError", false, DefaultApiResponse.ErrorProcessingInfo);
  }
}
