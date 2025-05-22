import { BrowserProvider, ethers, JsonRpcProvider } from "ethers";
import LSP3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import { LeaderboardEntry } from "../../types/leaderboard.type";
import { CitizenMetadata, FollowUserData, LuksoMetadata } from "../../interfaces/citizens.interface";
import { Result } from '../../types/common.type';
import { CommonErrorCode, Module } from "../../enums/common.enum";
import { LogError } from "../common.util";
import { IPFS_GATEWAY_API_KEY, IPFS_GATEWAY_URL, LSP26_ABI, LSP26_ADDRESS } from "../../constants/citizens.constant";

export async function GetLuksoIPFSData(cid: string): Promise<Result<LuksoMetadata>> {
  try {
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?pinataGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`;
    const ipfsRequest = await fetch(ipfsHTTPUrl);
    const ipfsData = await ipfsRequest.json() as { 'LSP4Metadata': LuksoMetadata };

    return { success: true, value: ipfsData.LSP4Metadata };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, err.message, err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}

export async function GetSolanaIPFSData(cid: string): Promise<Result<CitizenMetadata>> {
  try {
    const ipfsHTTPUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?pinataGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`;
    const ipfsRequest = await fetch(ipfsHTTPUrl);
    const ipfsData = await ipfsRequest.json();
    const ipfsDataResult = ipfsData as CitizenMetadata;
    ipfsDataResult.imageUrl = ipfsData.image;

    return { success: true, value: ipfsData };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on getting token metadata', err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}

export function GetLuksoImageUrl(metadata: CitizenMetadata): Result<string> {
  try {
    const luksoMetadata = metadata.rawMetadata as LuksoMetadata;
    const ipfsUrl = luksoMetadata.images[0][0].url
    const cid = ipfsUrl.split('//')[1]

    const imageUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?pinataGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`;
    return { success: true, value: imageUrl };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on getting Ethereum image url', err.stack);
    return { success: false, errMessage: err.message, errCode: ''};
  }
}

export function GetSolanaImageUrl(metadata: CitizenMetadata): Result<string> {
  try {
    const cid = metadata.imageUrl.split('//')[1];
    const imageUrl = `${IPFS_GATEWAY_URL}/${cid}${IPFS_GATEWAY_API_KEY ? '?pinataGatewayToken=' + IPFS_GATEWAY_API_KEY : ''}`;
    
    return { success: true, value: imageUrl };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on getting Solana image url', err.stack);
    return { success: false, errMessage: err.message, errCode: '' };
  }
}

export async function GetFollowerCounts(address: string): Promise<Result<FollowUserData>> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);

    const followerCount = await lsp26Contract.followerCount(address);
    const followingCount = await lsp26Contract.followingCount(address);

    return { success: true, value: { followerCount: Number(followerCount), followingCount: Number(followingCount) } };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on getting follower counts', err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}

export async function GetUniversalProfileData(address: string): Promise<Result<{ name: string, profileImage: string }>> {
  try {
    const erc725js = new ERC725(
      LSP3ProfileSchema as ERC725JSONSchema[],
      address,
      process.env.NEXT_PUBLIC_RPC_URL,
      {
        ipfsGateway: 'https://api.universalprofile.cloud/ipfs'
      }
    );
    const profileData = await erc725js.fetchData('LSP3Profile');
    if (!profileData?.value || typeof profileData.value === 'string' || !('LSP3Profile' in profileData.value)) {
      return { success: false, errMessage: 'Invalid profile data', errCode: '' };
    }

    let imageUrl = '';
    if (profileData.value.LSP3Profile.profileImage?.[0]) {
      const url = profileData.value.LSP3Profile.profileImage[0].url;
      if (url.startsWith('ipfs://')) {
        const cid = url.replace('ipfs://', '');
        imageUrl = `https://api.universalprofile.cloud/ipfs/${cid}`;
      } else {
        imageUrl = url;
      }
    }
    return { success: true, value: { name: profileData.value.LSP3Profile.name || '', profileImage: imageUrl } };

  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on getting universal profile data', err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}

export async function FollowUser(addressToFollow: string, provider: BrowserProvider): Promise<Result<boolean>> {
  try {
    const signer = await provider.getSigner();
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, signer);

    const tx = await lsp26Contract.follow(addressToFollow);
    await tx.wait();

    return { success: true, value: true };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on following user', err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}

export async function UnfollowUser(addressToUnfollow: string, provider: BrowserProvider): Promise<Result<boolean>> {
  try {
    const signer = await provider.getSigner();
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, signer);

    const tx = await lsp26Contract.unfollow(addressToUnfollow);
    await tx.wait();

    return { success: true, value: true };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on unfollowing user', err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}

export async function GetFollowStatuses(leaderboardData: LeaderboardEntry[], provider: JsonRpcProvider, walletAddress: string): Promise<Result<Record<string, boolean>>> {
  try {
    const lsp26Contract = new ethers.Contract(LSP26_ADDRESS, LSP26_ABI, provider);

    // Check follow status for each user in parallel
    const statuses = await Promise.all(
      leaderboardData.map(async (user) => {
        try {
          const isFollowing = await lsp26Contract.isFollowing(walletAddress, user.address);
          return [user.address, isFollowing];
        } catch (error) {
          return [user.address, false];
        }
      })
    );

    // Convert array of results to object
    const statusObject = Object.fromEntries(statuses);
    return { success: true, value: statusObject };
  } catch (error) {
    const err = error as Error;
    LogError(Module.Citizens, 'Error on getting follow statuses', err.stack);
    return { success: false, errMessage: err.message, errCode: CommonErrorCode.FetchError };
  }
}