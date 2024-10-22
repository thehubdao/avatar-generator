export interface Drop {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredXP: number;
  paymentType: 'LYX' | 'TOKEN';
  price?: number;
  requiredToken?: string;
  contractAddress: string;
}
