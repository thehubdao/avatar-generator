import { useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl mx-4 bg-[#1B1B1D] rounded-[20px] p-8 max-h-[80vh] overflow-y-auto"
        style={{
          boxShadow: 'inset 0px -1px 0px rgba(255, 255, 255, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.1), 0px 20px 40px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
          aria-label="Close about modal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Content */}
        <div className="space-y-6">
          <h2 
            id="about-modal-title"
            className="font-monument text-2xl md:text-3xl text-white text-center"
          >
            ABOUT CITIZENS PORTAL
          </h2>
          
          <div className="space-y-4 text-white/80 font-work font-light text-base leading-relaxed">
            <p>
              Citizens Portal is a fully on-chain avatar platform that empowers users to create, 
              customize, and own their digital identities in the metaverse.
            </p>
            
            <p>
              Built on cutting-edge blockchain technology, Citizens Portal allows you to:
            </p>
            
            <ul className="space-y-2 ml-6 list-disc">
              <li>Create unique, customizable avatars with extensive personalization options</li>
              <li>Mint your avatars as NFTs with full ownership rights</li>
              <li>Participate in exclusive campaigns and community events</li>
              <li>Access your avatar wardrobe and backpack of collected items</li>
              <li>Join a vibrant community of digital creators and collectors</li>
            </ul>
            
            <p>
              Whether you're exploring virtual worlds, expressing your creativity, or building 
              your digital presence, Citizens Portal provides the tools and platform to bring 
              your vision to life.
            </p>
            
            <div className="pt-4 space-y-4">
              <div className="text-center">
                <p className="text-base text-white/90 mb-3">Learn more about THE HUB</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <a 
                    href="https://www.thehubdao.xyz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    Visit THE HUB DAO
                  </a>
                  <a 
                    href="https://docs.thehubdao.xyz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    Documentation
                  </a>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-sm text-white/60 text-center">
                  Powered by Creador Labs UG - Building the future of digital identity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 