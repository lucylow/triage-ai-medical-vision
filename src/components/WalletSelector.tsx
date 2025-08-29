import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Wallet, 
  Download, 
  CheckCircle,
  Info
} from 'lucide-react';

export interface ICPWallet {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  isInstalled: boolean;
  isConnected: boolean;
}

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletId: string) => void;
  wallets: ICPWallet[];
  isConnecting: boolean;
  connectingWalletId?: string | null;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
  wallets,
  isConnecting,
  connectingWalletId
}) => {
  const handleWalletSelect = (walletId: string) => {
    // Always call onSelectWallet regardless of connection status
    // This ensures the connection flow is triggered even for "connected" wallets
    console.log('Wallet selected:', walletId, 'Current status:', wallets.find(w => w.id === walletId)?.isConnected);
    onSelectWallet(walletId);
  };

  const handleInstallWallet = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-orange-500" />
            <span>Connect ICP Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Choose your preferred Internet Computer Protocol wallet to connect to GreyGuard Trials
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {wallets.map((wallet) => {
            const isConnectingThisWallet = connectingWalletId === wallet.id;
            const isDisabled = isConnecting || isConnectingThisWallet;
            
            return (
              <div
                key={wallet.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  wallet.isConnected
                    ? 'border-green-500 bg-green-50 hover:border-green-600 hover:bg-green-100'
                    : wallet.isInstalled
                    ? 'border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handleWalletSelect(wallet.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <img 
                        src={wallet.icon} 
                        alt={wallet.name}
                        className="w-6 h-6"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.classList.remove('hidden');
                          }
                        }}
                      />
                      <Wallet className="w-6 h-6 text-white hidden" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                      {wallet.isConnected && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Connected - Click to continue
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {wallet.isConnected && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {!wallet.isInstalled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleInstallWallet(wallet.url);
                        }}
                        className="text-xs"
                        disabled={isDisabled}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Install
                      </Button>
                    )}
                    {wallet.isInstalled && !wallet.isConnected && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isDisabled}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                      >
                        {isConnectingThisWallet ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    )}
                    {wallet.isInstalled && wallet.isConnected && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={isDisabled}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs"
                      >
                        {isConnectingThisWallet ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                            Connecting...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Need a wallet?</p>
              <p className="text-xs mt-1">
                Install any of the supported ICP wallets above to get started with decentralized clinical trial matching.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
