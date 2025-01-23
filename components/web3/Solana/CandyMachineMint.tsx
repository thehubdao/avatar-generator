import { useEffect, useState } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  mplCandyMachine,
  mintV2,
  fetchCandyMachine,
  fetchCandyGuard,
  CandyMachine,
  CandyGuard
} from '@metaplex-foundation/mpl-candy-machine';
import {
  publicKey,
  signerIdentity,
  generateSigner,
  sol,
  Umi
} from '@metaplex-foundation/umi';
import { useSolanaWallets } from '@privy-io/react-auth';
import {
  fromWeb3JsTransaction,
  toWeb3JsTransaction
} from '@metaplex-foundation/umi-web3js-adapters';
import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';

const CANDY_MACHINE_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

export const CandyMachineMint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null);
  const [candyGuard, setCandyGuard] = useState<CandyGuard | null>(null);
  const { wallets } = useSolanaWallets();

  const initializeUmi = (): Umi | null => {
    if (!wallets[0]) return null;

    const umi = createUmi(SOLANA_RPC_URL!)
      .use(mplCandyMachine());

    umi.use(signerIdentity({
      publicKey: publicKey(wallets[0].address),
      signMessage: async (message: Uint8Array) =>
        await wallets[0].signMessage(message),
      signTransaction: async (transaction) => {
        const web3JsTransaction = toWeb3JsTransaction(transaction);
        const signedTx = await wallets[0].signTransaction(web3JsTransaction);
        return fromWeb3JsTransaction(signedTx);
      },
      signAllTransactions: async (transactions) => {
        const web3JsTransactions = transactions.map(toWeb3JsTransaction);
        const signedTxs = await Promise.all(
          web3JsTransactions.map(tx => wallets[0].signTransaction(tx))
        );
        return signedTxs.map(fromWeb3JsTransaction);
      }
    }));

    return umi;
  };

  const fetchCandyMachineState = async (): Promise<void> => {
    if (!CANDY_MACHINE_ID) return;

    try {
      const umi = initializeUmi();
      if (!umi) return;

      const cm = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
      setCandyMachine(cm);

      if (cm.mintAuthority) {
        const guard = await fetchCandyGuard(umi, cm.mintAuthority);
        setCandyGuard(guard);
        console.log('Candy Guard:', guard);
      }
    } catch (err) {
      console.error('Error fetching candy machine:', err);
      setError('Error fetching candy machine');
    }
  };

  const mint = async (): Promise<void> => {
    if (!candyMachine || !CANDY_MACHINE_ID || !wallets[0]) return;
    
    setLoading(true);
    setError(null);

    try {
      const umi = initializeUmi();
      if (!umi) return;

      const nftMint = generateSigner(umi);
      const candyMachineAddress = publicKey(CANDY_MACHINE_ID);

      const mintTx = mintV2(umi, {
        candyMachine: candyMachineAddress,
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        candyGuard: candyMachine.mintAuthority
      });

      // Agregar compute limits
      const finalTx = mintTx
      .add(setComputeUnitPrice(umi, {microLamports: 1000000}))
      .add(setComputeUnitLimit(umi, {units: Number(sol(1).basisPoints)}))

      await finalTx.sendAndConfirm(umi);
      
      console.log('Mint exitoso!');
      setLoading(false);
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al mintear el NFT');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallets[0]?.address) {
      fetchCandyMachineState();
    }
  }, [wallets[0]?.address]);

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button
        onClick={mint}
        disabled={loading || !!error}
      >
        {loading ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  );
};