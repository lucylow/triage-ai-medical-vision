export interface ICPWalletInfo {
  principal: string;
  accountId: string;
  isConnected: boolean;
  balance?: string;
  walletName: string;
}

export interface ICPWalletService {
  connect(): Promise<ICPWalletInfo | null>;
  disconnect(): Promise<void>;
  getWalletInfo(): Promise<ICPWalletInfo | null>;
  isPlugInstalled(): boolean;
  requestInstall(): void;
}

class PlugWalletService implements ICPWalletService {
  private walletInfo: ICPWalletInfo | null = null;

  async connect(): Promise<ICPWalletInfo | null> {
    try {
      // Check if Plug is installed
      if (!this.isPlugInstalled()) {
        this.requestInstall();
        return null;
      }

      // Check if already connected first
      const isConnected = await (window as any).ic?.plug?.isConnected();
      if (isConnected) {
        console.log('Already connected to Plug wallet');
        return await this.getWalletInfo();
      }

      // Request connection to Plug wallet with proper parameters
      console.log('Requesting connection to Plug wallet...');
      const connected = await (window as any).ic?.plug?.requestConnect({
        whitelist: [],
        host: 'https://icp0.io'
      });

      console.log('Connection response:', connected);

      if (connected) {
        // Wait a bit for the connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify connection status
        const connectionStatus = await (window as any).ic?.plug?.isConnected();
        console.log('Connection status after connect:', connectionStatus);
        
        if (!connectionStatus) {
          console.error('Connection failed - not connected after request');
          return null;
        }

        // Get wallet information
        const principal = await (window as any).ic?.plug?.getPrincipal();
        const accountId = await (window as any).ic?.plug?.getAccountId();
        
        console.log('Principal:', principal);
        console.log('Account ID:', accountId);
        
        if (!principal) {
          console.error('Failed to get principal from Plug wallet');
          return null;
        }
        
        this.walletInfo = {
          principal: principal.toString(),
          accountId: accountId || '',
          isConnected: true,
          walletName: 'Plug Wallet'
        };

        // Listen for wallet events
        this.setupEventListeners();
        
        console.log('Successfully connected to Plug wallet:', this.walletInfo);
        return this.walletInfo;
      }
      
      console.log('Connection request returned false');
      return null;
    } catch (error) {
      console.error('Failed to connect to Plug wallet:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isPlugInstalled()) {
        await (window as any).ic?.plug?.disconnect();
      }
      this.walletInfo = null;
    } catch (error) {
      console.error('Failed to disconnect from Plug wallet:', error);
    }
  }

  async getWalletInfo(): Promise<ICPWalletInfo | null> {
    try {
      if (!this.isPlugInstalled()) {
        return null;
      }

      const isConnected = await (window as any).ic?.plug?.isConnected();
      
      if (isConnected && !this.walletInfo) {
        // Reconnect if we have no wallet info but are connected
        return await this.connect();
      }

      return this.walletInfo;
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      return null;
    }
  }

  isPlugInstalled(): boolean {
    return !!(window as any).ic?.plug;
  }

  requestInstall(): void {
    window.open('https://plugwallet.ooo/', '_blank');
  }

  private setupEventListeners(): void {
    if (!this.isPlugInstalled()) return;

    // Listen for account changes
    (window as any).ic?.plug?.on('accountChanged', async () => {
      console.log('Account changed, updating wallet info...');
      await this.updateWalletInfo();
    });

    // Listen for connection changes
    (window as any).ic?.plug?.on('connect', async () => {
      console.log('Wallet connected');
      await this.updateWalletInfo();
    });

    // Listen for disconnection
    (window as any).ic?.plug?.on('disconnect', () => {
      console.log('Wallet disconnected');
      this.walletInfo = null;
    });
  }

  private async updateWalletInfo(): Promise<void> {
    try {
      if (this.isPlugInstalled()) {
        const principal = await (window as any).ic?.plug?.getPrincipal();
        const accountId = await (window as any).ic?.plug?.getAccountId();
        
        if (this.walletInfo) {
          this.walletInfo.principal = principal?.toString() || '';
          this.walletInfo.accountId = accountId || '';
        }
      }
    } catch (error) {
      console.error('Failed to update wallet info:', error);
    }
  }

  // Get ICP balance
  async getBalance(): Promise<string | null> {
    try {
      if (!this.isPlugInstalled() || !this.walletInfo?.isConnected) {
        return null;
      }

      // This would typically involve calling the ledger canister
      // For now, return a placeholder
      return '0.0';
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  // Sign a message (useful for authentication)
  async signMessage(message: string): Promise<ArrayBuffer | null> {
    try {
      if (!this.isPlugInstalled() || !this.walletInfo?.isConnected) {
        return null;
      }

      // Request signature from Plug wallet
      const signature = await (window as any).ic?.plug?.requestSign({
        message: new TextEncoder().encode(message)
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const icpWalletService = new PlugWalletService();

