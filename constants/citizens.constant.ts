import { Blockchain } from "../enums/blockchain/common.enum";
import { BackedByLinks, Campaign } from "../enums/citizens/common.enum";
import { CitizensCollection } from "../interfaces/citizens.interface";

export const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
export const IPFS_GATEWAY_API_KEY = process.env.NEXT_PUBLIC_IPFS_GATEWAY_API_KEY;
export const LSP26_ADDRESS = '0xf01103E5a9909Fc0DBe8166dA7085e0285daDDcA';

export const LSP26_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'followerCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'followingCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'follow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'unfollow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }, { internalType: 'address', name: 'addr', type: 'address' }],
    name: 'isFollowing',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  }
];

export const LOGIN_COLLECTIONS: CitizensCollection[] = [
  {
    name: 'Lukso Citizens',
    image: '/resources/images/campaings/citizens_collection.jpg',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    name: 'Lukso Creators',
    image: '/resources/images/campaings/creators_collection.jpg',
    campaign: Campaign.Creators,
    blockChain: Blockchain.Ethereum
  },
  {
    name: 'Kumi',
    image: '/resources/images/campaings/kumi_collection.jpg',
    campaign: Campaign.Kumi,
    blockChain: Blockchain.Solana
  }
];

export const LOGIN_NEWS = [
  {
    img: 'news-01',
    link: ''
  },
  {
    img: 'news-02',
    link: ''
  },
  {
    img: 'news-03',
    link: ''
  }
];

export const LOGIN_FRESHDROPS = [
  {
    img: '01',
    text: 'Lukso Citizen #1218',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    img: '02',
    text: 'Lukso Citizen #1218',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    img: '03',
    text: 'Lukso Citizen #1218',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    img: '04',
    text: 'Lukso Citizen #1218',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    img: '05',
    text: 'Lukso Citizen #1218',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  },
  {
    img: '06',
    text: 'Lukso Citizen #1218',
    campaign: Campaign.Citizens,
    blockChain: Blockchain.Ethereum
  }
];

export const LOGIN_COMMUNITY = [
  {
    img: 'content-01',
    link: ''
  },
  {
    img: 'content-02',
    link: ''
  },
  {
    img: 'content-03',
    link: ''
  },
  {
    img: 'content-04',
    link: ''
  },
]

export const LOGIN_BACKEDBY = [
  {
    img: 'polygon',
    link: BackedByLinks.Polygon
  },
  {
    img: 'sandbox',
    link: BackedByLinks.Sandbox
  },
  {
    img: 'decentraland',
    link: BackedByLinks.Decentraland
  },
  {
    img: 'brinc',
    link: BackedByLinks.Brinc
  },
  {
    img: 'ocean',
    link: BackedByLinks.Ocean
  },
  {
    img: 'chainlink',
    link: BackedByLinks.Chainlink
  }
];