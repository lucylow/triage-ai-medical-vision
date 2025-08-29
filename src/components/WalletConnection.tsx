import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Download, 
  User, 
  Coins,
  LogOut,
  Settings
} from 'lucide-react';
import { icpWalletService, ICPWalletInfo } from '../services/icpWalletService';
import { toast } from '../hooks/use-toast';

interface WalletConnectionProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function WalletConnection({ className, variant = 'default' }: WalletConnectionProps) {
  const [walletInfo, setWalletInfo] = useState<ICPWalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPlugInstalled, setIsPlugInstalled] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Plug is installed on component mount
    const checkPlugInstallation = () => {
      const installed = icpWalletService.isPlugInstalled();
      setIsPlugInstalled(installed);
      
      if (installed) {
        // Check if already connected
        checkWalletConnection();
      }
    };

    checkPlugInstallation();

    // Check periodically for Plug installation
    const interval = setInterval(checkPlugInstallation, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkWalletConnection = async () => {
    try {
      const info = await icpWalletService.getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleConnect = async () => {
    if (!isPlugInstalled) {
      icpWalletService.requestInstall();
      return;
    }

    setIsConnecting(true);
    setLastError(null);
    
    try {
      console.log('Attempting to connect to Plug wallet...');
      const info = await icpWalletService.connect();
      
      if (info) {
        console.log('Connection successful:', info);
        setWalletInfo(info);
        setLastError(null);
        setConnectionAttempts(0);
        toast({
          title: "Wallet Connected!",
          description: `Connected to ${info.walletName}`,
        });
      } else {
        console.log('Connection returned null - checking for specific errors...');
        
        // Check if there are any specific error messages from the wallet
        const walletError = await checkForWalletErrors();
        if (walletError) {
          setLastError(walletError);
          setConnectionAttempts(prev => prev + 1);
          toast({
            title: "Connection Failed",
            description: walletError,
            variant: "destructive",
          });
        } else {
          const genericError = "Failed to connect to Plug wallet. Please try again.";
          setLastError(genericError);
          setConnectionAttempts(prev => prev + 1);
          toast({
            title: "Connection Failed",
            description: genericError,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while connecting";
      setLastError(errorMessage);
      setConnectionAttempts(prev => prev + 1);
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkForWalletErrors = async (): Promise<string | null> => {
    try {
      // Check if Plug is available
      if (!(window as any).ic?.plug) {
        return "Plug wallet extension not found. Please refresh the page.";
      }

      // Check connection status
      const isConnected = await (window as any).ic?.plug?.isConnected();
      if (isConnected) {
        // Try to disconnect and reconnect automatically
        await (window as any).ic?.plug?.disconnect();
        return "Auto-disconnected. Please click 'Connect Wallet' again.";
      }

      // Check if user rejected the connection
      // This is tricky to detect, but we can provide helpful guidance
      return "Connection was rejected or failed. Please check the Plug wallet popup and ensure you clicked 'APPROVE'.";
    } catch (error) {
      console.error('Error checking for wallet errors:', error);
      return null;
    }
  };

  const handleDisconnect = async () => {
    try {
      await icpWalletService.disconnect();
      setWalletInfo(null);
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from Plug wallet",
      });
    } catch (error) {
      console.error('Disconnection error:', error);
      toast({
        title: "Disconnection Error",
        description: "An error occurred while disconnecting",
        variant: "destructive",
      });
    }
  };

  const handleInstallPlug = () => {
    icpWalletService.requestInstall();
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 10) return principal;
    return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
  };

  if (variant === 'compact') {
    if (walletInfo?.isConnected) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-green-600 text-white border-green-500 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connected
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Plug Wallet
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-mono text-xs">{walletInfo.principal}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span>Balance: {walletInfo.balance || '0.0'} ICP</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Principal: {walletInfo.principal}</p>
              <p>Account: {walletInfo.accountId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="flex flex-col space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isPlugInstalled ? (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Install Plug
            </>
          )}
        </Button>
        
        {lastError && (
          <div className="text-xs text-red-400 max-w-48">
            <div className="flex items-center justify-between">
              <span className="truncate">{lastError}</span>
              {connectionAttempts > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                  onClick={handleConnect}
                >
                  Retry
                </Button>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Attempts: {connectionAttempts}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  if (walletInfo?.isConnected) {
    return (
      <div className={`flex items-center space-x-3 ${className || ''}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-green-600 text-white border-green-500 hover:bg-green-700"
                disabled
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Connected
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Principal: {walletInfo.principal}</p>
              <p>Account: {walletInfo.accountId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-white">
            {formatPrincipal(walletInfo.principal)}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-slate-700 text-white border-slate-500 hover:bg-slate-600"
          onClick={handleDisconnect}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-3 ${className || ''}`}>
      <div className="flex items-center space-x-3">
        {!isPlugInstalled && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Download className="h-3 w-3 mr-1" />
            Plug Required
          </Badge>
        )}
        
        <Button 
          variant="outline" 
          className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
          onClick={isPlugInstalled ? handleConnect : handleInstallPlug}
          disabled={isConnecting}
        >
          {isPlugInstalled ? (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Install Plug
            </>
          )}
        </Button>
      </div>
      
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 max-w-md">
          <div className="flex items-start space-x-2">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Connection Failed</h4>
              <p className="text-sm text-red-700 mt-1">{lastError}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-red-600">Attempts: {connectionAttempts}</span>
                {connectionAttempts > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleConnect}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isPlugInstalled && !walletInfo?.isConnected && !lastError && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 max-w-md">
          <div className="flex items-start space-x-2">
            <Wallet className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800">Troubleshooting Tips</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Make sure Plug wallet is unlocked</li>
                <li>• Check that you clicked "APPROVE" in the popup</li>
                <li>• Try refreshing the page if connection fails</li>
                <li>• Ensure you're on the correct network (mainnet)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
