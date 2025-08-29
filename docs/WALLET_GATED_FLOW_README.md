# Wallet-Gated Flow Implementation

## Overview

The GreyGuard Trials application now implements a wallet-gated user experience where users must connect their Plug wallet (Internet Computer Protocol wallet) before accessing the main application functionality.

## User Flow

### 1. Landing Page (Initial State)
- Users first see a beautiful landing page with:
  - Hero section explaining the platform
  - Feature highlights
  - Two main action buttons:
    - **"Connect Plug Wallet"** - Primary action
    - **"Launch App"** - Secondary action (also triggers wallet connection)

### 2. Wallet Connection
- When either button is clicked, the app attempts to connect to the user's Plug wallet
- If Plug is not installed, users are prompted to install it
- Connection requires user approval in the Plug wallet extension
- Successful connection shows a success toast notification

### 3. Main Application (Post-Connection)
- After successful wallet connection, users see the full application interface
- The header displays:
  - Connected wallet principal (shortened format)
  - Disconnect button
  - ICP blockchain status indicators
- All tabs and functionality are now accessible:
  - Home
  - Clinical Trials
  - Agent Platform
  - Decentralized Features
  - Demo Conversations
  - Pricing

### 4. Disconnection
- Users can disconnect their wallet using the disconnect button
- Upon disconnection, they are returned to the landing page
- A toast notification confirms the disconnection

## Technical Implementation

### Components

#### `LandingPage.tsx`
- Beautiful, modern landing page design
- Gradient backgrounds and professional styling
- Two main action buttons for wallet connection
- Feature highlights and trust indicators
- Responsive design for all screen sizes

#### `MainApp.tsx`
- Contains all the existing application functionality
- Modified header to show connected wallet information
- Removed the old wallet connection component
- Added disconnect functionality

#### `Index.tsx` (Modified)
- Main routing logic for wallet-gated flow
- State management for wallet connection status
- Conditional rendering between landing page and main app
- Wallet connection and disconnection handlers

### State Management

The application uses React state to manage:
- `walletInfo`: Current wallet connection information
- `isConnecting`: Connection attempt status
- `showLanding`: Whether to show landing page or main app

### Wallet Service Integration

Uses the existing `icpWalletService` for:
- Checking wallet installation
- Connecting to Plug wallet
- Getting wallet information
- Disconnecting from wallet

## Benefits

1. **Security**: Ensures only authenticated users access the application
2. **User Experience**: Clear onboarding flow with beautiful landing page
3. **Blockchain Integration**: Seamless ICP wallet integration
4. **Professional Appearance**: Modern, polished interface
5. **Flexibility**: Users can choose between "Connect Wallet" or "Launch App"

## Future Enhancements

- Add wallet connection persistence across browser sessions
- Implement role-based access control based on wallet holdings
- Add wallet switching capabilities
- Enhanced error handling for connection failures
- Analytics tracking for wallet connection events

## Testing

To test the wallet-gated flow:

1. Start the development server: `npm run dev`
2. Open the application in a browser
3. You should see the landing page first
4. Click either "Connect Plug Wallet" or "Launch App"
5. Connect your Plug wallet
6. Verify you can access the main application
7. Test the disconnect functionality

## Dependencies

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- Existing ICP wallet service
