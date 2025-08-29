import React, { useState, useEffect } from 'react';
import { LandingPage } from '../components/LandingPage';
import MainApp from '../components/MainApp';
import { multiWalletService } from '../services/multiWalletService';
import { toast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';

const Index = () => {
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  console.log('Index component rendered, showLanding:', showLanding, 'walletInfo:', walletInfo); // Debug log

  useEffect(() => {
    // Check if wallet is already connected on component mount
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      console.log('Checking wallet connection...');
      const info = await multiWalletService.getCurrentWalletInfo();
      console.log('Wallet info received:', info);
      console.log('Wallet info details:', {
        isConnected: info?.isConnected,
        principal: info?.principal,
        accountId: info?.accountId,
        walletName: info?.walletName
      });
      
      if (info?.isConnected) {
        console.log('✅ Wallet already connected, setting state...');
        setWalletInfo(info);
        setShowLanding(false);
        console.log('✅ State updated - showLanding: false, walletInfo set');
      } else {
        console.log('❌ Wallet not connected or connection invalid');
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleConnectWallet = async () => {
    console.log('Connect wallet button clicked - this should open wallet selector');
    // This function is now just a placeholder since the actual connection
    // happens in the LandingPage component through the wallet selector
    // The wallet selector will call onConnectWallet when connection is successful
  };

  const handleLaunchApp = async () => {
    console.log('Launch app button clicked - this should open wallet selector');
    // This function is now just a placeholder since the actual connection
    // happens in the LandingPage component through the wallet selector
    // The wallet selector will call onConnectWallet when connection is successful
  };

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting wallet...');
      await multiWalletService.disconnectWallet();
      setWalletInfo(null);
      setShowLanding(true);
      toast({
        title: "Wallet Disconnected",
        description: "You have been returned to the landing page.",
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // This function is called by the LandingPage when a wallet is successfully connected
  const handleWalletConnected = (walletInfo: any) => {
    console.log('=== WALLET CONNECTED CALLBACK IN INDEX ===');
    console.log('Received walletInfo:', walletInfo);
    console.log('Current state before update:');
    console.log('- showLanding:', showLanding);
    console.log('- walletInfo:', walletInfo);
    console.log('- isConnecting:', isConnecting);
    
    console.log('Setting new walletInfo and showLanding to false...');
    setWalletInfo(walletInfo);
    setShowLanding(false);
    
    console.log('State after update:');
    console.log('- showLanding should be false');
    console.log('- walletInfo should be:', walletInfo);
    
    console.log('Showing success toast...');
    toast({
      title: "🎉 Wallet Connected Successfully!",
      description: `Welcome to GreyGuard Trials! You can now access the full application.`,
    });
    
    console.log('✅ handleWalletConnected completed successfully');
  };

  // This function is called by the LandingPage when wallet connection is requested
  const handleWalletConnectionRequest = () => {
    console.log('Wallet connection requested - opening wallet selector');
    // The wallet selector will be opened by the LandingPage component
  };

  // Add debugging for render decisions
  console.log('=== INDEX RENDER DECISION ===');
  console.log('showLanding:', showLanding);
  console.log('walletInfo:', walletInfo);
  console.log('walletInfo?.isConnected:', walletInfo?.isConnected);
  console.log('Condition (showLanding || !walletInfo?.isConnected):', (showLanding || !walletInfo?.isConnected));

  if (showLanding || !walletInfo?.isConnected) {
    console.log('🔄 Rendering LandingPage');
    return (
      <LandingPage 
        onConnectWallet={handleWalletConnectionRequest}
        onLaunchApp={handleWalletConnectionRequest}
        isConnecting={isConnecting}
        onWalletConnected={handleWalletConnected}
      />
    );
  }

  console.log('🔄 Rendering MainApp');
  try {
    return (
      <MainApp 
        walletInfo={walletInfo}
        onDisconnect={handleDisconnect}
      />
    );
  } catch (error) {
    console.error('❌ Error rendering MainApp:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-800">Error Rendering App</h1>
          <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
    </div>
  );
  }
};

export default Index;