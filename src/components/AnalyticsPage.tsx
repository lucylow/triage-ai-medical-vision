import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Heart,
  Brain,
  Shield,
  Zap,
  Star,
  Award,
  Globe,
  Database,
  Network,
  Lock,
  Eye,
  FileText,
  Image,
  Microscope,
  Stethoscope,
  Pill,
  Syringe,
  Thermometer,
  Activity as ActivityIcon,
  Download,
  Settings
} from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();

  // Mock data for analytics
  const mockData = {
    overview: {
      totalUsers: 2847,
      activeTrials: 156,
      revenue: 45231,
      successRate: 94.2,
      patientMatches: 892,
      trialCompletions: 67,
      averageRecruitmentTime: 18.5,
      costSavings: 234000
    },
    performance: {
      monthlyData: [
        { month: 'Jan', users: 1200, trials: 45, matches: 180, revenue: 28000 },
        { month: 'Feb', users: 1350, trials: 52, matches: 210, revenue: 32000 },
        { month: 'Mar', users: 1480, trials: 58, matches: 235, revenue: 35000 },
        { month: 'Apr', users: 1620, trials: 65, matches: 260, revenue: 38000 },
        { month: 'May', users: 1780, trials: 72, matches: 285, revenue: 41000 },
        { month: 'Jun', users: 1950, trials: 78, matches: 310, revenue: 44000 },
        { month: 'Jul', users: 2120, trials: 85, matches: 335, revenue: 47000 },
        { month: 'Aug', users: 2300, trials: 92, matches: 360, revenue: 50000 }
      ],
      trialPhases: [
        { phase: 'Phase I', count: 28, success: 85.7, avgDuration: 12 },
        { phase: 'Phase II', count: 45, success: 78.9, avgDuration: 18 },
        { phase: 'Phase III', count: 52, success: 92.3, avgDuration: 24 },
        { phase: 'Phase IV', count: 31, success: 96.8, avgDuration: 36 }
      ],
      medicalConditions: [
        { condition: 'Diabetes', trials: 23, patients: 156, matchRate: 89.2 },
        { condition: 'Cancer', trials: 34, patients: 234, matchRate: 91.5 },
        { condition: 'Cardiovascular', trials: 28, patients: 189, matchRate: 87.3 },
        { condition: 'Neurological', trials: 31, patients: 201, matchRate: 88.9 },
        { condition: 'Autoimmune', trials: 25, patients: 167, matchRate: 86.1 },
        { condition: 'Respiratory', trials: 15, patients: 98, matchRate: 84.7 }
      ]
    },
    users: {
      demographics: {
        ageGroups: [
          { range: '18-25', count: 234, percentage: 8.2 },
          { range: '26-35', count: 456, percentage: 16.0 },
          { range: '36-45', count: 678, percentage: 23.8 },
          { range: '46-55', count: 789, percentage: 27.7 },
          { range: '56-65', count: 456, percentage: 16.0 },
          { range: '65+', count: 234, percentage: 8.2 }
        ],
        gender: [
          { gender: 'Female', count: 1567, percentage: 55.1 },
          { gender: 'Male', count: 1280, percentage: 44.9 }
        ],
        locations: [
          { state: 'California', count: 456, percentage: 16.0 },
          { state: 'Texas', count: 389, percentage: 13.7 },
          { state: 'New York', count: 345, percentage: 12.1 },
          { state: 'Florida', count: 298, percentage: 10.5 },
          { state: 'Illinois', count: 267, percentage: 9.4 },
          { state: 'Other', count: 1092, percentage: 38.3 }
        ]
      },
      engagement: {
        dailyActiveUsers: 1247,
        weeklyActiveUsers: 2156,
        monthlyActiveUsers: 2847,
        averageSessionDuration: 12.5,
        pagesPerSession: 4.8,
        bounceRate: 23.4
      },
      userJourney: [
        { stage: 'Landing Page', users: 5000, conversion: 56.9 },
        { stage: 'Registration', users: 2847, conversion: 100.0 },
        { stage: 'Profile Setup', users: 2456, conversion: 86.3 },
        { stage: 'Trial Search', users: 2189, conversion: 89.1 },
        { stage: 'Application', users: 1892, conversion: 86.4 },
        { stage: 'Enrollment', users: 1567, conversion: 82.8 }
      ]
    }
  };

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Get previous month data for comparison
  const getPreviousMonthData = () => {
    const currentMonth = mockData.performance.monthlyData[mockData.performance.monthlyData.length - 1];
    const previousMonth = mockData.performance.monthlyData[mockData.performance.monthlyData.length - 2];
    return { current: currentMonth, previous: previousMonth };
  };

  const { current, previous } = getPreviousMonthData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into your clinical trial platform</p>
        
        {/* Time Range Selector */}
        <div className="flex justify-center space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : 
               range === '30d' ? '30 Days' : 
               range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'performance', name: 'Performance', icon: TrendingUp },
            { id: 'users', name: 'Users', icon: Users },
            { id: 'monetization', name: 'Monetization', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mockData.overview.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-green-600">+{calculateGrowth(current.users, previous.users)}% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">Growing steadily</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockData.overview.activeTrials}</div>
                <p className="text-xs text-green-600">+{calculateGrowth(current.trials, previous.trials)}% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <Target className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">12 new this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">${mockData.overview.revenue.toLocaleString()}</div>
                <p className="text-xs text-green-600">+{calculateGrowth(current.revenue, previous.revenue)}% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">Strong growth</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{mockData.overview.successRate}%</div>
                <p className="text-xs text-green-600">+2.1% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">Above industry avg</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Matches</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockData.overview.patientMatches}</div>
                <p className="text-xs text-green-600">+15.3% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <Target className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">High accuracy</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Completions</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{mockData.overview.trialCompletions}</div>
                <p className="text-xs text-green-600">+8.7% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <Award className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs text-gray-600">On track</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Recruitment</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{mockData.overview.averageRecruitmentTime} days</div>
                <p className="text-xs text-green-600">-12.5% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">Faster than avg</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">${(mockData.overview.costSavings / 1000).toFixed(0)}K</div>
                <p className="text-xs text-green-600">+23.4% from last month</p>
                <div className="mt-2 flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">Significant impact</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Trial Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Trial Phase Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.performance.trialPhases.map((phase, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-red-500' : 
                          index === 1 ? 'bg-yellow-500' : 
                          index === 2 ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="font-medium text-gray-700">{phase.phase}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{phase.count} trials</div>
                        <div className="text-sm text-gray-600">{phase.success}% success</div>
                        <div className="text-xs text-gray-500">{phase.avgDuration} months avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  <span>Medical Conditions Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.performance.medicalConditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-red-500' : 
                          index === 2 ? 'bg-green-500' : 
                          index === 3 ? 'bg-purple-500' : 
                          index === 4 ? 'bg-orange-500' : 'bg-indigo-500'
                        }`}></div>
                        <span className="font-medium text-gray-700">{condition.condition}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{condition.trials} trials</div>
                        <div className="text-sm text-gray-600">{condition.patients} patients</div>
                        <div className="text-xs text-green-600">{condition.matchRate}% match rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                <span>Monthly Growth Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {['Users', 'Trials', 'Matches', 'Revenue'].map((metric, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {index === 0 ? current.users.toLocaleString() :
                         index === 1 ? current.trials :
                         index === 2 ? current.matches :
                         `$${(current.revenue / 1000).toFixed(0)}K`}
                      </div>
                      <div className="text-sm text-gray-600">{metric}</div>
                      <div className="text-xs text-green-600 mt-1">
                        +{calculateGrowth(
                          index === 0 ? current.users : 
                          index === 1 ? current.trials : 
                          index === 2 ? current.matches : 
                          current.revenue,
                          index === 0 ? previous.users : 
                          index === 1 ? previous.trials : 
                          index === 2 ? previous.matches : 
                          previous.revenue
                        )}%
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Simple Chart Visualization */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-end justify-between space-x-2 h-32">
                    {mockData.performance.monthlyData.slice(-6).map((data, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div 
                          className="w-8 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                          style={{ height: `${(data.users / 2500) * 100}px` }}
                        ></div>
                        <div className="text-xs text-gray-600">{data.month}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-2">User Growth Trend (Last 6 Months)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>User Engagement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{mockData.users.engagement.dailyActiveUsers}</div>
                  <div className="text-sm text-gray-600">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{mockData.users.engagement.weeklyActiveUsers}</div>
                  <div className="text-sm text-gray-600">Weekly Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{mockData.users.engagement.monthlyActiveUsers}</div>
                  <div className="text-sm text-gray-600">Monthly Active Users</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Session Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{mockData.users.engagement.averageSessionDuration} min</div>
                  <div className="text-sm text-gray-600">Avg Session Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{mockData.users.engagement.pagesPerSession}</div>
                  <div className="text-sm text-gray-600">Pages Per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{mockData.users.engagement.bounceRate}%</div>
                  <div className="text-sm text-gray-600">Bounce Rate</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>User Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{mockData.users.demographics.gender[0].percentage}%</div>
                  <div className="text-sm text-gray-600">Female Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{mockData.users.demographics.gender[1].percentage}%</div>
                  <div className="text-sm text-gray-600">Male Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">36-55</div>
                  <div className="text-sm text-gray-600">Primary Age Group</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demographics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Age Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.users.demographics.ageGroups.map((ageGroup, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{ageGroup.range}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${ageGroup.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {ageGroup.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>Geographic Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.users.demographics.locations.slice(0, 5).map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{location.state}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {location.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Journey Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>User Journey Funnel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.users.userJourney.map((stage, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">{stage.stage}</span>
                        <span className="text-sm text-gray-600">{stage.users.toLocaleString()} users</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${stage.conversion}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{stage.conversion}% conversion rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monetization Tab */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          {/* Revenue Model Overview */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Revenue Model & Monetization Strategy</span>
              </CardTitle>
              <p className="text-green-700 text-lg">Sustainable business model with multiple revenue streams for clinical trial sponsors and research organizations</p>
            </CardHeader>
          </Card>

          {/* Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Revenue Streams</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Subscription Plans - Tiered access for CROs & sponsors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Pay-Per-Match - Fees only on successful matches</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">API Licensing - White-label integration for hospitals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">SaaS Platform - Enterprise trial management tools</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Future: Tokenization & DAO</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Utility tokens for fee discounts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Staking rewards for sponsors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">DAO governance participation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span>Pricing Tiers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <div className="bg-white p-6 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                    <div className="text-3xl font-bold text-green-600 mb-4">$299<span className="text-sm text-gray-500">/month</span></div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Up to 10 trial listings
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Basic analytics
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-white p-6 rounded-lg border-2 border-blue-400 hover:border-blue-600 transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                  <div className="text-center">
                    <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">MOST POPULAR</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-4">$799<span className="text-sm text-gray-500">/month</span></div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Up to 50 trials
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Advanced matching
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white p-6 rounded-lg border-2 border-purple-400 hover:border-purple-600 transition-all duration-300 hover:shadow-lg">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                    <div className="text-3xl font-bold text-purple-600 mb-4">Custom<span className="text-sm text-gray-500"> pricing</span></div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Unlimited trials
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Custom integrations
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Dedicated support
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics & Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span>Success Metrics & Projections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">$2.5M</div>
                  <div className="text-lg text-green-700 font-semibold">Annual Recurring Revenue</div>
                  <div className="text-sm text-green-600 mt-2">Projected for 2025</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">85%</div>
                  <div className="text-lg text-blue-700 font-semibold">Customer Retention Rate</div>
                  <div className="text-sm text-blue-600 mt-2">Industry leading</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">3.2x</div>
                  <div className="text-lg text-purple-700 font-semibold">Customer Lifetime Value</div>
                  <div className="text-sm text-purple-600 mt-2">Strong growth</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">$150</div>
                  <div className="text-lg text-orange-700 font-semibold">Average Pay-Per-Match Fee</div>
                  <div className="text-sm text-orange-600 mt-2">Per successful match</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
