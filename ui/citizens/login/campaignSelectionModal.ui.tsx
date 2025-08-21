import React from 'react';
import Image from 'next/image';
import { CitizensCollection } from '../../../interfaces/citizens.interface';
import { Blockchain } from '../../../enums/blockchain/common.enum';
import { Campaign } from '../../../enums/citizens/common.enum';

interface CampaignSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: CitizensCollection[];
  handleLogin: (blockchain: Blockchain | undefined, campaign: Campaign | undefined) => void;
}

export default function CampaignSelectionModal({ 
  isOpen, 
  onClose, 
  collections, 
  handleLogin 
}: CampaignSelectionModalProps) {
  if (!isOpen) return null;

  const getNetworkDisplayName = (blockchain: Blockchain, campaign: Campaign) => {
    if (blockchain === Blockchain.Ethereum && (campaign === Campaign.Citizens || campaign === Campaign.Creators)) {
      return 'Lukso';
    }
    return blockchain.charAt(0).toUpperCase() + blockchain.slice(1);
  };

  const handleCampaignSelect = (collection: CitizensCollection) => {
    if (collection.active) {
      handleLogin(collection.blockChain, collection.campaign);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-6 bg-gradient-to-b from-[#151515] to-[#0C0C0C] rounded-3xl border border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 z-10"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-8 pt-12">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-monument text-3xl md:text-5xl text-white mb-4">
              CHOOSE YOUR CAMPAIGN
            </h2>
            <p className="text-white/70 text-lg">
              Select a campaign to create your citizen avatar
            </p>
          </div>

          {/* Campaign Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
            {collections.map((collection, index) => (
              <div
                key={index}
                onClick={() => handleCampaignSelect(collection)}
                className={`
                  relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300
                  ${collection.active 
                    ? 'border-white/20 hover:border-white/40 hover:scale-105' 
                    : 'border-white/10 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* Campaign Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${collection.active 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }
                    `}>
                      {collection.active ? 'ACTIVE' : 'COMING SOON'}
                    </span>
                  </div>

                  {/* Campaign Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-monument text-xl text-white mb-2">
                      {collection.name.toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/60" />
                      <span className="text-white/80 text-sm">
                        {getNetworkDisplayName(collection.blockChain, collection.campaign)} Network
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                {collection.active && (
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 text-black px-6 py-2 rounded-full font-medium">
                      SELECT CAMPAIGN
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/50 text-sm">
              Each campaign uses different blockchain networks and wallet types
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 