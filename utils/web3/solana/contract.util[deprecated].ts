import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import solanaIdl from '../../../constants/idl/solanaIdl.json';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { publicKey } from '@metaplex-foundation/umi'
import { fetchAssetsByOwner, fetchCollection } from '@metaplex-foundation/mpl-core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'

const PROGRAM_ID = new PublicKey('Bit5BcAGufekdsZoVVGyt81dFXURadnZBGB5PU5U5Ru4');
const MPL_CORE_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
const COLLECTION_ID = new PublicKey('GbwhRDb6Xwe1ZMG6Ei6ttPpCqe3JKkuv7a1zViuxz9RR');

// Define the RPC connection
const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '', 
  'confirmed'
);

interface CreateAssetArgs {
  name: string;
  uri: string;
  plugins: any[];
}

const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '');

export const createAsset = async (
  wallet: ConnectedSolanaWallet,
  args: CreateAssetArgs
) => {
    console.log(process.env.NEXT_PUBLIC_SOLANA_PK, args.uri)
  const asset = Keypair.generate() as Keypair;
  const decodedKey = new Uint8Array([252,200,135,134,209,2,78,248,180,140,150,138,5,93,86,86,187,20,28,210,7,52,183,111,70,204,137,232,37,255,148,61,87,219,2,72,4,206,150,168,51,246,5,243,138,213,78,109,235,232,106,70,69,153,218,130,167,54,98,178,66,203,153,242]);
  const payer = Keypair.fromSecretKey(decodedKey);

  // Inicializar el provider
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: new PublicKey(wallet.address),
      signTransaction: wallet.signTransaction,
      signAllTransactions: async (transactions) => {
        const signedTxs = await Promise.all(
          transactions.map(tx => wallet.signTransaction(tx))
        );
        return signedTxs;
      }
    },
    { commitment: 'confirmed' }
  );
  anchor.setProvider(provider);

  // Cargar el programa
  const program = new Program(solanaIdl as anchor.Idl, provider);

  // Crear la transacción usando Anchor
  const tx = await program.methods
    .createV1({
      name: args.name,
      uri: args.uri,
      plugins: []
    })
    .accounts({
      asset: asset.publicKey,
      collection: COLLECTION_ID,
      authority: payer.publicKey,
      payer: payer.publicKey,
      owner: new PublicKey(wallet.address),
      updateAuthority: null as any,
      systemProgram: SystemProgram.programId,
      logWrapper: NOOP_PROGRAM_ID,
      mplCore: MPL_CORE_ID,
    })
    .signers([asset, payer])
    .rpc();

  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: tx,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
  return asset.publicKey.toString();
};

export const transferAsset = async (
  connection: Connection,
  asset: PublicKey,
  owner: PublicKey,
  newOwner: PublicKey,
  collection?: PublicKey,
) => {
  const keys = [
    { pubkey: asset, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: true, isWritable: true },
    { pubkey: newOwner, isSigner: false, isWritable: false },
    { pubkey: MPL_CORE_ID, isSigner: false, isWritable: false },
  ];

  if (collection) {
    keys.splice(1, 0, { pubkey: collection, isSigner: false, isWritable: true });
  }

  const transferIx = {
    programId: PROGRAM_ID,
    keys,
    data: Buffer.from([
      219, 95, 64, 10, 55, 137, 133, 109, // Discriminator
    ]),
  };

  return new Transaction().add(transferIx);
};

const NOOP_PROGRAM_ID = new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV');

export const getAssetsByOwner = async (walletAddress: string) => {
  try {
    const ownerPublicKey = publicKey(walletAddress);
    
    const assets = await fetchAssetsByOwner(umi, ownerPublicKey);
    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

export const getCollectionAssetByOwner= async (walletAddress: string, collectionId: PublicKey = COLLECTION_ID) => {
  const assets = await getAssetsByOwner(walletAddress);
  const collectionAsset = assets.find(asset => asset.updateAuthority.address === collectionId.toString());
  return collectionAsset;
}

export const getCollectionAssets = async (wallet: ConnectedSolanaWallet, collectionId: PublicKey = COLLECTION_ID) => {
  const assets = await fetchCollection(umi, collectionId.toString());
  return assets;
}

export const getCollectionSupply = async (wallet: ConnectedSolanaWallet, collectionId: PublicKey = COLLECTION_ID) => {
  const assets = await getCollectionAssets(wallet, collectionId);
  return assets.numMinted;
}
/* export const saveCombination = async (
  connection: Connection,
  program: Program,
  walletAddress: PublicKey,
  combination: string
) => {
  // TODO: Implementar lógica de guardado usando Umi
  const umiWallet = keypairIdentity(umi,  keypair );
}; */