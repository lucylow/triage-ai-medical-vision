import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Send, 
  Lightbulb, 
  BookOpen, 
  Zap,
  MessageSquare,
  Settings,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import NLPService, { PromptTemplate, IntentClassification } from '../services/nlpService';

interface CustomPrompt {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  isCustom: boolean;
  usageCount: number;
  lastUsed?: string;
}

const PromptManager: React.FC = () => {
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<CustomPrompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    description: '',
    template: '',
    variables: '',
    category: 'trial_matching'
  });

  const [testInput, setTestInput] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const nlpService = NLPService.getInstance();
  const builtInTemplates = nlpService.getPromptTemplates();

  useEffect(() => {
    loadCustomPrompts();
  }, []);

  const loadCustomPrompts = () => {
    const saved = localStorage.getItem('customPrompts');
    if (saved) {
      setCustomPrompts(JSON.parse(saved));
    }
  };

  const saveCustomPrompts = (prompts: CustomPrompt[]) => {
    localStorage.setItem('customPrompts', JSON.stringify(prompts));
    setCustomPrompts(prompts);
  };

  const handleCreatePrompt = () => {
    if (!newPrompt.name || !newPrompt.template) {
      toast({
        title: "Missing Information",
        description: "Please fill in the name and template fields",
        variant: "destructive",
      });
      return;
    }

    const variables = newPrompt.variables
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const prompt: CustomPrompt = {
      id: `custom_${Date.now()}`,
      name: newPrompt.name,
      description: newPrompt.description,
      template: newPrompt.template,
      variables,
      category: newPrompt.category,
      isCustom: true,
      usageCount: 0
    };

    const updatedPrompts = [...customPrompts, prompt];
    saveCustomPrompts(updatedPrompts);

    // Reset form
    setNewPrompt({
      name: '',
      description: '',
      template: '',
      variables: '',
      category: 'trial_matching'
    });

    toast({
      title: "Prompt Created",
      description: "Your custom prompt has been saved successfully",
    });
  };

  const handleEditPrompt = (prompt: CustomPrompt) => {
    setSelectedPrompt(prompt);
    setNewPrompt({
      name: prompt.name,
      description: prompt.description,
      template: prompt.template,
      variables: prompt.variables.join(', '),
      category: prompt.category
    });
    setIsEditing(true);
  };

  const handleUpdatePrompt = () => {
    if (!selectedPrompt) return;

    const variables = newPrompt.variables
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const updatedPrompt: CustomPrompt = {
      ...selectedPrompt,
      name: newPrompt.name,
      description: newPrompt.description,
      template: newPrompt.template,
      variables,
      category: newPrompt.category
    };

    const updatedPrompts = customPrompts.map(p => 
      p.id === selectedPrompt.id ? updatedPrompt : p
    );
    saveCustomPrompts(updatedPrompts);

    setIsEditing(false);
    setSelectedPrompt(null);
    setNewPrompt({
      name: '',
      description: '',
      template: '',
      variables: '',
      category: 'trial_matching'
    });

    toast({
      title: "Prompt Updated",
      description: "Your custom prompt has been updated successfully",
    });
  };

  const handleDeletePrompt = (promptId: string) => {
    const updatedPrompts = customPrompts.filter(p => p.id !== promptId);
    saveCustomPrompts(updatedPrompts);
    toast({
      title: "Prompt Deleted",
      description: "Your custom prompt has been removed",
    });
  };

  const handleUsePrompt = (prompt: CustomPrompt) => {
    // Increment usage count
    const updatedPrompts = customPrompts.map(p => 
      p.id === prompt.id 
        ? { ...p, usageCount: p.usageCount + 1, lastUsed: new Date().toISOString() }
        : p
    );
    saveCustomPrompts(updatedPrompts);

    // Set up test variables
    const variables: Record<string, string> = {};
    prompt.variables.forEach(variable => {
      variables[variable] = '';
    });
    setTestVariables(variables);
    setSelectedPrompt(prompt);
    setActiveTab('test');
  };

  const generateTestPrompt = () => {
    if (!selectedPrompt) return;

    let prompt = selectedPrompt.template;
    Object.entries(testVariables).forEach(([variable, value]) => {
      if (value.trim()) {
        prompt = prompt.replace(`{${variable}}`, value);
      } else {
        prompt = prompt.replace(`{${variable}}`, `[${variable}]`);
      }
    });

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
              'trial_matching': 'bg-grey-100 text-grey-800',
      'profile_management': 'bg-green-100 text-green-800',
      'consent_control': 'bg-purple-100 text-purple-800',
      'general_support': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderPromptCard = (prompt: CustomPrompt) => (
    <Card key={prompt.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{prompt.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{prompt.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getCategoryColor(prompt.category)}>
                {prompt.category.replace('_', ' ')}
              </Badge>
              {prompt.isCustom && (
                <Badge variant="outline" className="text-xs">
                  Custom
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {prompt.variables.length} variables
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUsePrompt(prompt)}
            >
              <Send className="h-4 w-4 mr-1" />
              Use
            </Button>
            {prompt.isCustom && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPrompt(prompt)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-muted/50 rounded p-3 mb-3">
          <p className="text-sm font-mono">{prompt.template}</p>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Used {prompt.usageCount} times</span>
          {prompt.lastUsed && (
            <span>Last used: {new Date(prompt.lastUsed).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Manager</h2>
          <p className="text-muted-foreground">
            Create, customize, and manage natural language prompts for your AI agent
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Built-in Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Prompts</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="test">Test Prompts</TabsTrigger>
        </TabsList>

        {/* Built-in Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {builtInTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUsePrompt({
                        ...template,
                        isCustom: false,
                        usageCount: 0
                      })}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                  </div>
                  
                  <div className="bg-muted/50 rounded p-3 mb-3">
                    <p className="text-sm font-mono">{template.template}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                    {template.examples.map((example, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {example}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Prompts */}
        <TabsContent value="custom" className="space-y-4">
          {customPrompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Custom Prompts Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first custom prompt to get started
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customPrompts.map(renderPromptCard)}
            </div>
          )}
        </TabsContent>

        {/* Create New Prompt */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Custom Prompt</span>
              </CardTitle>
              <CardDescription>
                Design a natural language prompt template with variables for dynamic content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-name">Prompt Name</Label>
                  <Input
                    id="prompt-name"
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Advanced Trial Search"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt-category">Category</Label>
                  <Select
                    value={newPrompt.category}
                    onValueChange={(value) => setNewPrompt(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial_matching">Trial Matching</SelectItem>
                      <SelectItem value="profile_management">Profile Management</SelectItem>
                      <SelectItem value="consent_control">Consent Control</SelectItem>
                      <SelectItem value="general_support">General Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt-description">Description</Label>
                <Input
                  id="prompt-description"
                  value={newPrompt.description}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this prompt does"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt-template">Prompt Template</Label>
                <Textarea
                  id="prompt-template"
                  value={newPrompt.template}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Enter your prompt template with {variables} in curly braces"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use curly braces for variables: {'{condition}'}, {'{age}'}, {'{location}'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt-variables">Variables (comma-separated)</Label>
                <Input
                  id="prompt-variables"
                  value={newPrompt.variables}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, variables: e.target.value }))}
                  placeholder="condition, age, location, preferences"
                />
                <p className="text-xs text-muted-foreground">
                  List all variables used in your template
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCreatePrompt} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prompt
                </Button>
                {isEditing && (
                  <Button onClick={handleUpdatePrompt} variant="outline" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Prompt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Prompts */}
        <TabsContent value="test" className="space-y-4">
          {selectedPrompt ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Test Prompt: {selectedPrompt.name}</span>
                </CardTitle>
                <CardDescription>
                  Fill in the variables to see how your prompt will look
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-sm font-mono">{selectedPrompt.template}</p>
                </div>
                
                <div className="space-y-3">
                  <Label>Fill in Variables:</Label>
                  {selectedPrompt.variables.map(variable => (
                    <div key={variable} className="space-y-2">
                      <Label htmlFor={`var-${variable}`} className="text-sm">
                        {variable}:
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        value={testVariables[variable] || ''}
                        onChange={(e) => setTestVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        placeholder={`Enter ${variable}`}
                      />
                    </div>
                  ))}
                </div>
                
                <Button onClick={generateTestPrompt} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Prompt
                </Button>
                
                {generatedPrompt && (
                  <div className="space-y-3">
                    <Label>Generated Prompt:</Label>
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-sm">{generatedPrompt}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(generatedPrompt)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={() => {
                          setTestInput(generatedPrompt);
                          setActiveTab('chat');
                        }}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Use in Chat
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Select a Prompt to Test</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a prompt template or custom prompt to test with variables
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptManager;
