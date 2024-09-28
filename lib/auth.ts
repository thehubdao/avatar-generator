import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import UniversalProfileContract from '../constants/abi/UniversalProfileABI.json';
import { updateLastLoginDate } from '../utils/firebase.util';

export async function generateSessionToken(address: string, message: string, signature: string): Promise<string> {
  // Verificar la firma usando el contrato Universal Profile de LUKSO
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const universalProfileContract = new ethers.Contract(
    address,
    UniversalProfileContract,
    provider
  );

  const hashedMessage = ethers.hashMessage(message);
  const isValidSignature = await universalProfileContract.isValidSignature(hashedMessage, signature);

  if (isValidSignature !== '0x1626ba7e') {
    throw new Error('Invalid signature');
  }

  // Actualizar la última fecha de conexión en Firebase
  await updateLastLoginDate(address);

  // Generar JWT token
  const token = jwt.sign(
    { 
      address: address,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiration
    },
    process.env.JWT_SECRET as string
  );

  return token;
}