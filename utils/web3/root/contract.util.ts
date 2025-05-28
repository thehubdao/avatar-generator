import { ApiPromise } from '@polkadot/api';
import { getApiOptions } from "@therootnetwork/api";
import { MINT_AMOUNT, NFT_COLLECTION_ID, PROVIDER } from '../../../constants/root/contract.constant';
import { TransactionBuilder } from '@futureverse/transact';
import { Signer } from '@futureverse/signer';
import { Result } from '../../../types/common.type';
import { CommonErrorCode, Module } from '../../../enums/common.enum';
import { LogError } from '../../common.util';
import '@therootnetwork/api-types';

let api: ApiPromise;
let signer: Signer;
let signerEoa: string;


export async function InitializeApi(_signer: Signer, _signerEoa: string) {
  api = await ApiPromise.create({ ...getApiOptions(), provider: PROVIDER });
  signer = _signer;
  signerEoa = _signerEoa;
}

export async function GetRootAssets(address: string): Promise<Result<any>> {
  try {
    const ownedTokens = await api.rpc.nft.ownedTokens(NFT_COLLECTION_ID, address, 0, 1000);

    const jsonResponse = ownedTokens.toJSON();
    const tokenIds = jsonResponse[2];

    return { success: true, value: tokenIds };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on getting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}

export async function MintRootAsset(
  address: string,
): Promise<Result<boolean>> {
  try {
    const mintBuilder = TransactionBuilder.nft(api, signer, address, Number(NFT_COLLECTION_ID)).mint({ quantity: MINT_AMOUNT, walletAddress: address });
    const tx = await mintBuilder.signAndSend();

    return { success: true, value: true };
  } catch (error) {
    const e = error as Error;
    LogError(Module.RootContractUtil, 'Error on minting Root Asset');
    return { success: false, errMessage: e.message, errCode: CommonErrorCode.InternalError };
  }
}