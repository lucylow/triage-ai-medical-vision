import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Network,
  Key,
  Wallet,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    trialUpdates: true,
    securityAlerts: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    dataSharing: false,
    analytics: true,
    thirdParty: false
  });
  const [walletSettings, setWalletSettings] = useState({
    autoConnect: true,
    rememberWallet: true,
    showBalance: true,
    transactionHistory: true
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Lock },
    { id: 'wallet', name: 'Wallet', icon: Wallet },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'advanced', name: 'Advanced', icon: Settings }
  ];

  const handleSave = () => {
    // Mock save functionality
    console.log('Settings saved');
  };

  const handleReset = () => {
    // Mock reset functionality
    console.log('Settings reset');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
            <p className="text-xl text-slate-600">Customize your GreyGuard Trials experience</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Network className="h-3 w-3 mr-1" />
            ICP Powered
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Secure
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Privacy First
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <IconComponent className={`h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-slate-500'
                    }`} />
                    <span className={`text-xs font-medium ${
                      activeTab === tab.id ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {tab.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, State" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" placeholder="Tell us about yourself..." />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Password & Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter current password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="twoFactor" />
                <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Session Management</Label>
                  <p className="text-sm text-slate-600">Manage active sessions across devices</p>
                </div>
                <Button variant="outline" size="sm">Manage Sessions</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Login History</Label>
                  <p className="text-sm text-slate-600">View recent login attempts</p>
                </div>
                <Button variant="outline" size="sm">View History</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Communication Channels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotif">Email Notifications</Label>
                  <Switch 
                    id="emailNotif" 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotif">Push Notifications</Label>
                  <Switch 
                    id="pushNotif" 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotif">SMS Notifications</Label>
                  <Switch 
                    id="smsNotif" 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium">Notification Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trialUpdates">Trial Updates</Label>
                  <Switch 
                    id="trialUpdates" 
                    checked={notifications.trialUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, trialUpdates: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="securityAlerts">Security Alerts</Label>
                  <Switch 
                    id="securityAlerts" 
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing">Marketing Communications</Label>
                  <Switch 
                    id="marketing" 
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Settings */}
      {activeTab === 'privacy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Privacy & Data Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Profile Visibility</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="public"
                    name="visibility"
                    value="public"
                    checked={privacy.profileVisibility === 'public'}
                    onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                  />
                  <Label htmlFor="public">Public - Visible to all users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="private"
                    name="visibility"
                    value="private"
                    checked={privacy.profileVisibility === 'private'}
                    onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                  />
                  <Label htmlFor="private">Private - Only visible to you</Label>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium">Data Sharing</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing">Share data for research</Label>
                    <p className="text-sm text-slate-600">Allow anonymized data to be used for medical research</p>
                  </div>
                  <Switch 
                    id="dataSharing" 
                    checked={privacy.dataSharing}
                    onCheckedChange={(checked) => setPrivacy({...privacy, dataSharing: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics & Performance</Label>
                    <p className="text-sm text-slate-600">Help improve the platform with usage analytics</p>
                  </div>
                  <Switch 
                    id="analytics" 
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy({...privacy, analytics: checked})}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Data Export</Label>
                <p className="text-sm text-slate-600">Download your personal data</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Settings */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Wallet Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoConnect">Auto-connect on page load</Label>
                  <p className="text-sm text-slate-600">Automatically connect to your wallet when visiting the site</p>
                </div>
                <Switch 
                  id="autoConnect" 
                  checked={walletSettings.autoConnect}
                  onCheckedChange={(checked) => setWalletSettings({...walletSettings, autoConnect: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rememberWallet">Remember wallet preference</Label>
                  <p className="text-sm text-slate-600">Save your preferred wallet for future visits</p>
                </div>
                <Switch 
                  id="rememberWallet" 
                  checked={walletSettings.rememberWallet}
                  onCheckedChange={(checked) => setWalletSettings({...walletSettings, rememberWallet: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showBalance">Show wallet balance</Label>
                  <p className="text-sm text-slate-600">Display your ICP balance in the interface</p>
                </div>
                <Switch 
                  id="showBalance" 
                  checked={walletSettings.showBalance}
                  onCheckedChange={(checked) => setWalletSettings({...walletSettings, showBalance: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div>
                      <div className="font-medium">Plug Wallet</div>
                      <div className="text-sm text-slate-600">Connected</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">I</span>
                    </div>
                    <div>
                      <div className="font-medium">Internet Identity</div>
                      <div className="text-sm text-slate-600">Not connected</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Visual Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                  <div className="w-full h-8 bg-white rounded mb-2"></div>
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button className="p-4 border-2 border-slate-200 bg-slate-50 rounded-lg">
                  <div className="w-full h-8 bg-slate-800 rounded mb-2"></div>
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button className="p-4 border-2 border-slate-200 bg-slate-50 rounded-lg">
                  <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                  <span className="text-sm font-medium">Auto</span>
                </button>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium">Language</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 border-2 border-blue-500 bg-blue-50 rounded-lg">
                  <span className="font-medium">English</span>
                </button>
                <button className="p-3 border-2 border-slate-200 bg-slate-50 rounded-lg">
                  <span className="font-medium">Español</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Clear Cache</Label>
                  <p className="text-sm text-slate-600">Remove stored data and temporary files</p>
                </div>
                <Button variant="outline" size="sm">Clear Cache</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Reset Settings</Label>
                  <p className="text-sm text-slate-600">Restore all settings to default values</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Network & Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">ICP Network Status</Label>
                  <p className="text-sm text-slate-600">Check connection to Internet Computer</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Fetch.ai Agent Status</Label>
                  <p className="text-sm text-slate-600">Check AI agent connectivity</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Danger Zone</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">Delete Account</span>
                </div>
                <p className="text-sm text-red-600 mb-3">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <div className="flex space-x-3">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
