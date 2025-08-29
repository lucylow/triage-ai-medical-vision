import { ICPWallet } from '../components/WalletSelector';

export interface WalletConnectionResult {
  success: boolean;
  walletInfo?: {
    principal: string;
    accountId: string;
    isConnected: boolean;
    balance?: string;
    walletName: string;
  };
  error?: string;
}

export class MultiWalletService {
  private static instance: MultiWalletService;
  private currentWallet: string | null = null;

  public static getInstance(): MultiWalletService {
    if (!MultiWalletService.instance) {
      MultiWalletService.instance = new MultiWalletService();
    }
    return MultiWalletService.instance;
  }

  // Get all supported ICP wallets with proper detection
  public getSupportedWallets(): ICPWallet[] {
    return [
      {
        id: 'plug',
        name: 'Plug Wallet',
        description: 'Popular browser extension wallet for ICP',
        icon: 'https://plugwallet.ooo/assets/images/plug-logo.svg',
        url: 'https://plugwallet.ooo/',
        isInstalled: this.isPlugInstalled(),
        isConnected: this.isPlugConnected()
      },
      {
        id: 'internet-identity',
        name: 'Internet Identity',
        description: 'Official ICP authentication system',
        icon: 'https://internetcomputer.org/img/IC_logo_horizontal.svg',
        url: 'https://internetcomputer.org/internet-identity',
        isInstalled: this.isInternetIdentityAvailable(),
        isConnected: this.isInternetIdentityConnected()
      },
      {
        id: 'astrox',
        name: 'AstroX ME',
        description: 'Mobile-first ICP wallet',
        icon: 'https://astrox.me/assets/images/logo.svg',
        url: 'https://astrox.me/',
        isInstalled: this.isAstroXAvailable(),
        isConnected: this.isAstroXConnected()
      },
      {
        id: 'stoic',
        name: 'Stoic Wallet',
        description: 'Web-based ICP wallet',
        icon: 'https://www.stoicwallet.com/favicon.ico',
        url: 'https://www.stoicwallet.com/',
        isInstalled: this.isStoicAvailable(),
        isConnected: this.isStoicConnected()
      }
    ];
  }

  // Check if Plug wallet is installed - improved detection
  private isPlugInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check multiple ways Plug might be available
    const hasPlug = !!(window as any).ic?.plug || 
                   !!(window as any).ic?.plugWallet ||
                   !!(window as any).plug ||
                   !!(window as any).PlugWallet;
    
    console.log('Plug wallet detection:', {
      'window.ic.plug': !!(window as any).ic?.plug,
      'window.ic.plugWallet': !!(window as any).ic?.plugWallet,
      'window.plug': !!(window as any).plug,
      'window.PlugWallet': !!(window as any).PlugWallet,
      'final result': hasPlug
    });
    
    return hasPlug;
  }

  // Check if Plug wallet is connected - improved detection
  private isPlugConnected(): boolean {
    if (!this.isPlugInstalled()) return false;
    
    try {
      // Try multiple ways to access Plug
      const plug = (window as any).ic?.plug || 
                   (window as any).ic?.plugWallet ||
                   (window as any).plug ||
                   (window as any).PlugWallet;
      
      if (plug && typeof plug.isConnected === 'function') {
        // Only return true if we can actually get a principal
        try {
          const principal = plug.getPrincipal();
          return !!principal;
        } catch {
          return false;
        }
      }
      
      // Fallback: check if we have principal (indicates connection)
      if (plug && typeof plug.getPrincipal === 'function') {
        try {
          const principal = plug.getPrincipal();
          return !!principal;
        } catch {
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.log('Error checking Plug connection:', error);
      return false;
    }
  }

  // Check if Internet Identity is available
  private isInternetIdentityAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for Internet Identity availability
    const hasII = !!(window as any).ic?.internetIdentity ||
                  !!(window as any).InternetIdentity;
    
    console.log('Internet Identity detection:', {
      'window.ic.internetIdentity': !!(window as any).ic?.internetIdentity,
      'window.InternetIdentity': !!(window as any).InternetIdentity,
      'final result': hasII
    });
    
    return hasII;
  }

  // Check if Internet Identity is connected
  private isInternetIdentityConnected(): boolean {
    if (!this.isInternetIdentityAvailable()) return false;
    
    try {
      const ii = (window as any).ic?.internetIdentity || (window as any).InternetIdentity;
      
      if (ii && typeof ii.isConnected === 'function') {
        return ii.isConnected();
      }
      
      return false;
    } catch (error) {
      console.log('Error checking Internet Identity connection:', error);
      return false;
    }
  }

  // Check if AstroX is available
  private isAstroXAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    const hasAstroX = !!(window as any).ic?.astrox ||
                      !!(window as any).AstroX ||
                      !!(window as any).astroxWallet;
    
    console.log('AstroX detection:', {
      'window.ic.astrox': !!(window as any).ic?.astrox,
      'window.AstroX': !!(window as any).AstroX,
      'window.astroxWallet': !!(window as any).astroxWallet,
      'final result': hasAstroX
    });
    
    return hasAstroX;
  }

  // Check if AstroX is connected
  private isAstroXConnected(): boolean {
    if (!this.isAstroXAvailable()) return false;
    
    try {
      const astroX = (window as any).ic?.astrox || 
                     (window as any).AstroX ||
                     (window as any).astroxWallet;
      
      if (astroX && typeof astroX.isConnected === 'function') {
        return astroX.isConnected();
      }
      
      return false;
    } catch (error) {
      console.log('Error checking AstroX connection:', error);
      return false;
    }
  }

  // Check if Stoic is available
  private isStoicAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    const hasStoic = !!(window as any).ic?.stoic ||
                     !!(window as any).StoicWallet ||
                     !!(window as any).stoicWallet;
    
    console.log('Stoic detection:', {
      'window.ic.stoic': !!(window as any).ic?.stoic,
      'window.StoicWallet': !!(window as any).StoicWallet,
      'window.stoicWallet': !!(window as any).stoicWallet,
      'final result': hasStoic
    });
    
    return hasStoic;
  }

  // Check if Stoic is connected
  private isStoicConnected(): boolean {
    if (!this.isStoicAvailable()) return false;
    
    try {
      const stoic = (window as any).ic?.stoic || 
                    (window as any).StoicWallet ||
                    (window as any).stoicWallet;
      
      if (stoic && typeof stoic.isConnected === 'function') {
        return stoic.isConnected();
      }
      
      return false;
    } catch (error) {
      console.log('Error checking Stoic connection:', error);
      return false;
    }
  }

  // Connect to a specific wallet
  public async connectWallet(walletId: string): Promise<WalletConnectionResult> {
    console.log(`Attempting to connect to wallet: ${walletId}`);
    
    try {
      switch (walletId) {
        case 'plug':
          return await this.connectPlugWallet();
        case 'internet-identity':
          return await this.connectInternetIdentity();
        case 'astrox':
          return await this.connectAstroXWallet();
        case 'stoic':
          return await this.connectStoicWallet();
        default:
          return {
            success: false,
            error: `Unsupported wallet: ${walletId}`
          };
      }
    } catch (error) {
      console.error('Error in connectWallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Connect to Plug wallet - improved connection logic
  private async connectPlugWallet(): Promise<WalletConnectionResult> {
    console.log('=== PLUG WALLET CONNECTION START ===');
    console.log('Attempting to connect to Plug wallet...');
    
    if (!this.isPlugInstalled()) {
      console.log('❌ Plug wallet not detected as installed');
      return {
        success: false,
        error: 'Plug wallet is not installed. Please install it first.'
      };
    }

    try {
      // Try multiple ways to access Plug
      const plug = (window as any).ic?.plug || 
                   (window as any).ic?.plugWallet ||
                   (window as any).plug ||
                   (window as any).PlugWallet;
      
      console.log('🔍 Plug wallet detection results:');
      console.log('- window.ic?.plug:', !!(window as any).ic?.plug);
      console.log('- window.ic?.plugWallet:', !!(window as any).ic?.plugWallet);
      console.log('- window.plug:', !!(window as any).plug);
      console.log('- window.PlugWallet:', !!(window as any).PlugWallet);
      console.log('✅ Found Plug wallet instance:', !!plug);
      
      if (!plug) {
        console.log('❌ Plug wallet found but not accessible');
        return {
          success: false,
          error: 'Plug wallet found but not accessible'
        };
      }
      
      // Always try to get current connection status first
      let isConnected = false;
      let currentPrincipal = null;
      
      try {
        console.log('🔍 Checking current connection status...');
        if (typeof plug.isConnected === 'function') {
          console.log('Using plug.isConnected() method');
          isConnected = await plug.isConnected();
        }
        
        // Try to get principal regardless of isConnected status
        try {
          console.log('🔍 Attempting to get current principal...');
          currentPrincipal = await plug.getPrincipal();
          console.log('Current principal found:', currentPrincipal?.toString());
        } catch (error) {
          console.log('⚠️ No current principal found:', error);
        }
        
        // If we have a principal, consider it connected
        if (currentPrincipal) {
          isConnected = true;
          console.log('✅ Wallet appears to be connected with principal');
        }
        
      } catch (error) {
        console.log('⚠️ Error checking connection status:', error);
        isConnected = false;
      }
      
      console.log('📊 Plug wallet connection status:', isConnected);
      
      // If already connected and we have a principal, return success
      if (isConnected && currentPrincipal) {
        try {
          console.log('🔄 Already connected, getting wallet info...');
          const accountId = await plug.getAccountId?.() || '';
          
          console.log('✅ Already connected, got principal:', currentPrincipal.toString());
          console.log('Account ID:', accountId);
          
          this.currentWallet = 'plug';
          
          return {
            success: true,
            walletInfo: {
              principal: currentPrincipal.toString(),
              accountId: accountId || '',
              isConnected: true,
              walletName: 'Plug Wallet'
            }
          };
        } catch (error) {
          console.log('⚠️ Error getting wallet info from connected wallet:', error);
          // Continue to request connection
        }
      }

      // Request connection (either not connected or connection failed)
      console.log('🔌 Requesting connection to Plug wallet...');
      
      let connected = false;
      if (typeof plug.requestConnect === 'function') {
        console.log('Using plug.requestConnect() method');
        connected = await plug.requestConnect({
          whitelist: [],
          host: 'https://mainnet.dfinity.network'
        });
      } else if (typeof plug.connect === 'function') {
        console.log('Using plug.connect() method');
        connected = await plug.connect();
      } else {
        console.log('❌ No connection method found');
        return {
          success: false,
          error: 'Plug wallet connection method not found'
        };
      }

      console.log('📊 Connection request result:', connected);

      if (connected) {
        console.log('⏳ Connection successful, waiting for stabilization...');
        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          console.log('🔍 Getting wallet info after connection...');
          const principal = await plug.getPrincipal();
          const accountId = await plug.getAccountId?.() || '';
          
          console.log('✅ Successfully connected!');
          console.log('- Principal:', principal?.toString());
          console.log('- Account ID:', accountId);
          
          this.currentWallet = 'plug';
          
          return {
            success: true,
            walletInfo: {
              principal: principal.toString(),
              accountId: accountId || '',
              isConnected: true,
              walletName: 'Plug Wallet'
            }
          };
        } catch (error) {
          console.error('❌ Error getting principal after connection:', error);
          return {
            success: false,
            error: 'Connected but failed to get wallet info'
          };
        }
      }

      console.log('❌ Connection request failed');
      return {
        success: false,
        error: 'Failed to connect to Plug wallet'
      };
    } catch (error) {
      console.error('❌ Exception in connectPlugWallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Plug wallet'
      };
    } finally {
      console.log('=== PLUG WALLET CONNECTION END ===');
    }
  }

  // Connect to Internet Identity
  private async connectInternetIdentity(): Promise<WalletConnectionResult> {
    if (!this.isInternetIdentityAvailable()) {
      return {
        success: false,
        error: 'Internet Identity is not available'
      };
    }

    try {
      // Internet Identity connection logic would go here
      // This is a placeholder for the actual implementation
      return {
        success: false,
        error: 'Internet Identity connection not yet implemented'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Internet Identity'
      };
    }
  }

  // Connect to AstroX wallet
  private async connectAstroXWallet(): Promise<WalletConnectionResult> {
    if (!this.isAstroXAvailable()) {
      return {
        success: false,
        error: 'AstroX wallet is not available'
      };
    }

    try {
      // AstroX connection logic would go here
      // This is a placeholder for the actual implementation
      return {
        success: false,
        error: 'AstroX wallet connection not yet implemented'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to AstroX wallet'
      };
    }
  }

  // Connect to Stoic wallet
  private async connectStoicWallet(): Promise<WalletConnectionResult> {
    if (!this.isStoicAvailable()) {
      return {
        success: false,
        error: 'Stoic wallet is not available'
      };
    }

    try {
      // Stoic connection logic would go here
      // This is a placeholder for the actual implementation
      return {
        success: false,
        error: 'Stoic wallet connection not yet implemented'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Stoic wallet'
      };
    }
  }

  // Disconnect from current wallet
  public async disconnectWallet(): Promise<void> {
    if (!this.currentWallet) return;

    try {
      switch (this.currentWallet) {
        case 'plug':
          if (this.isPlugInstalled()) {
            const plug = (window as any).ic?.plug || 
                         (window as any).ic?.plugWallet ||
                         (window as any).plug ||
                         (window as any).PlugWallet;
            
            if (plug && typeof plug.disconnect === 'function') {
              await plug.disconnect();
            }
          }
          break;
        // Add other wallet disconnection logic here
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      this.currentWallet = null;
    }
  }

  // Get current wallet info
  public async getCurrentWalletInfo() {
    // First check if we have a stored current wallet
    if (this.currentWallet) {
      try {
        switch (this.currentWallet) {
          case 'plug':
            if (this.isPlugInstalled() && this.isPlugConnected()) {
              const plug = (window as any).ic?.plug || 
                           (window as any).ic?.plugWallet ||
                           (window as any).plug ||
                           (window as any).PlugWallet;
              
              const principal = await plug.getPrincipal();
              const accountId = await plug.getAccountId?.() || '';
              
              return {
                principal: principal.toString(),
                accountId: accountId || '',
                isConnected: true,
                walletName: 'Plug Wallet'
              };
            }
            break;
          // Add other wallet info retrieval logic here
        }
      } catch (error) {
        console.error('Error getting stored wallet info:', error);
      }
    }

    // If no stored wallet or stored wallet failed, check all wallets for existing connections
    console.log('🔍 Checking all wallets for existing connections...');
    
    // Check Plug wallet
    if (this.isPlugInstalled() && this.isPlugConnected()) {
      try {
        const plug = (window as any).ic?.plug || 
                     (window as any).ic?.plugWallet ||
                     (window as any).plug ||
                     (window as any).PlugWallet;
        
        const principal = await plug.getPrincipal();
        const accountId = await plug.getAccountId?.() || '';
        
        console.log('✅ Found existing Plug wallet connection');
        this.currentWallet = 'plug';
        
        return {
          principal: principal.toString(),
          accountId: accountId || '',
          isConnected: true,
          walletName: 'Plug Wallet'
        };
      } catch (error) {
        console.error('Error getting Plug wallet info:', error);
      }
    }

    // Check other wallets here as they're implemented
    // For now, just return null if no existing connections found
    console.log('❌ No existing wallet connections found');
    return null;
  }

  // Refresh wallet status - improved detection
  public refreshWalletStatus(): void {
    console.log('Refreshing wallet status...');
    
    // Force re-evaluation of wallet availability
    // This can be called to detect newly installed wallets
    console.log('Current wallet detection results:');
    console.log('- Plug Wallet:', this.isPlugInstalled());
    console.log('- Internet Identity:', this.isInternetIdentityAvailable());
    console.log('- AstroX:', this.isAstroXAvailable());
    console.log('- Stoic:', this.isStoicAvailable());
  }
}

export const multiWalletService = MultiWalletService.getInstance();
