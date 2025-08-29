import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Brain, 
  Shield,
  Activity,
  Sparkles,
  BookOpen,
  Users
} from 'lucide-react';
import ImageAgents from './ImageAgents';
import { VoiceDemo } from './VoiceDemo';

export const ResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('image-ai');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Resources</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Additional tools, information, and resources for the GreyGuard Trials platform
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="image-ai">Image AI</TabsTrigger>
        </TabsList>

        {/* Image AI Tab */}
        <TabsContent value="image-ai" className="space-y-4 sm:space-y-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    AI Image Generation
                  </CardTitle>
                  <CardDescription>
                    Create and analyze medical images using cutting-edge AI technology
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-grey-600" />
                      <span className="text-sm font-medium">DALL-E 3 Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Privacy-First Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Real-Time Processing</span>
                    </div>
                  </div>
                  
                              <div className="p-4 bg-grey-50 border border-grey-200 rounded-lg">
              <h4 className="font-semibold text-grey-800 mb-2">🎨 Image AI Features:</h4>
              <ul className="text-sm space-y-1 text-grey-700">
                      <li>• Generate medical illustrations from text descriptions</li>
                      <li>• Analyze medical images for content and objects</li>
                      <li>• Create educational materials for clinical trials</li>
                      <li>• Visualize complex medical concepts</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <ImageAgents />
            </div>
          </div>
        </TabsContent>


      </Tabs>

      {/* Resources Overview */}
              <Card className="bg-gradient-to-r from-green-50 to-grey-50 border-green-200 mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Sparkles className="h-5 w-5" />
            Platform Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Image className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-800 mb-2">AI Tools</h4>
              <p className="text-sm text-green-700">
                Image generation, analysis, and voice interfaces
              </p>
            </div>
            
            <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-grey-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-grey-600" />
            </div>
            <h4 className="font-semibold text-grey-800 mb-2">Documentation</h4>
            <p className="text-sm text-grey-700">
                Comprehensive guides and API references
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-800 mb-2">Community</h4>
              <p className="text-sm text-purple-700">
                Developer support and collaboration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
