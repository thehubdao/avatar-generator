import { Blockchain } from "../enums/blockchain/common.enum";
import { BackedByLinks, Campaign } from "../enums/citizens/common.enum";
import { CitizensCollection, Game } from "../interfaces/citizens.interface";

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
    blockChain: Blockchain.Ethereum,
    active: true
  },
  {
    name: 'Lukso Creators',
    image: '/resources/images/campaings/creators_collection.jpg',
    campaign: Campaign.Creators,
    blockChain: Blockchain.Ethereum,
    active: true
  },
  {
    name:'Polygon Citizens',
    image: '/resources/images/campaings/citizens_collection.jpg',
    campaign: Campaign.Polygon,
    blockChain: Blockchain.Polygon,
    active: true
  },
  {
    name: 'Kumi',
    image: '/resources/images/campaings/kumi_collection.jpg',
    campaign: Campaign.Kumi,
    blockChain: Blockchain.Solana,
    active: true
  },
  {
    name: 'Root Citizens',
    image: '/resources/images/campaings/based_collection.jpg',
    campaign: Campaign.Based,
    blockChain: Blockchain.Root,
    active: true
  }
];

export const LOGIN_NEWS = [
  {
    img: 'News_1',
    link: 'https://thehub.io/news/citizens-portal-launch'
  },
  {
    img: 'News_2',
    link: 'https://thehub.io/news/kumi-citizens-drop'
  },
  {
    img: 'News_3',
    link: 'https://thehub.io/news/root-network-integration'
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

export const GAMES: Game[] = [
  {
    name: 'NIFTY ISLAND',
    link: 'https://www.niftyisland.com/play/patabrava/0',
    bgSrc: '/resources/images/play/nifty.png',
    iconSrc: '/resources/images/play/logos/nifty.png',
    instructions: [
      'Log into your Nifty Island account',
      'Go to your profile, click on “create”',
      'Click on the upload icon in assets to upload your downloaded Citizen.',
      'Upload a cover image for your avatar and click on "Start Build"',
      'Click "Next"',
      'Click the "Creator Agreement" and click "Create"'
    ],
    guide: 'https://youtu.be/grE_znFG3-4?feature=shared'
  },
  {
    name: 'HYPERFY',
    link: 'https://hyperfy.io/thehub',
    bgSrc: '/resources/images/play/hyperfy.png',
    iconSrc: '/resources/images/play/logos/hyperfy.png',
    instructions: [
      'Log in to hyperfy_io with your preferred wallet',
      'Choose your virtual world for interactions',
      'Click on the “Avatar” icon and select the "Upload" option',
      'Click “Equip” to import your Citizen',
      'Click on “Settings” and set your avatar to “Heavy+”'
    ]
  },
  {
    name: 'DVERSO',
    link: 'https://dverso.io/',
    bgSrc: '/resources/images/play/dverso.png',
    iconSrc: '/resources/images/play/logos/dverso.png',
    instructions: [
      'Log in to Dverso using your preferred wallet ',
      'Visit your profile ',
      'Go to "Settings"',
      'Click on "Wardrobe"',
      'Click on “Upload a VRM”',
      'Upload your downloaded Citizen ',
      'Once uploaded, select your Citizen from your avatar list, and it’s ready to use!'
    ]
  },
  {
    name: 'ONCYBER',
    link: 'https://oncyber.io/',
    bgSrc: '/resources/images/play/oncyber.png',
    iconSrc: '/resources/images/play/logos/oncyber.png',
    instructions: [
      'Click on the pen (customize button), next to the profile picture',
      'Click on "Uploaded"',
      'Click on the "+" to upload your VRM',
      'Click on "create" to develop your own worlds'
    ]
  }
]

export const MINTING_TARGET_DATE = {
  [Campaign.Kumi]: new Date('2025-06-03T23:00:00.000Z'),
  [Campaign.Based]: new Date('2025-08-10T23:00:00.000Z'),
  [Campaign.Polygon]: new Date('2025-07-12T23:00:00.000Z'),
};