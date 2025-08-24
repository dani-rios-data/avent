import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCSVData } from "@/hooks/useCSVData";
import { AlertCircle, Instagram, Heart, MessageCircle, Users, Eye, Share2, TrendingUp, Video, FileText, Loader2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatNumber } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multi-select";


// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

interface InstagramDataRow {
  published_date: string;
  published_time: string;
  report_generated_at: string;
  captured_at: string;
  company: string;
  presence_handle: string;
  message: string;
  post_link: string;
  link: string;
  link_title: string;
  link_description: string;
  image: string;
  post_type: string;
  posted_domain: string;
  posted_url: string;
  engagement_total: number;
  likes: number;
  comments: number;
  followers: number;
  engagement_rate_by_follower: number;
  engagement_rate_lift: number;
  estimated_impressions: number;
  engagement_rate_by_estimated_impression: number;
  post_tag_ugc: number;
  post_tag_contests: number;
}

interface TikTokDataRow {
  published_date: string;
  published_time: string;
  report_generated_at: string;
  captured_at: string;
  company: string;
  presence_handle: string;
  message: string;
  post_link: string;
  link: string;
  link_title: string;
  link_description: string;
  image: string;
  post_type: string;
  posted_domain: string;
  posted_url: string;
  engagement_total: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
  engagement_rate_by_follower: number;
  engagement_rate_by_view: number;
  engagement_rate_lift: number;
  views: number;
  post_tag_ugc: number;
  post_tag_contests: number;
}

const SocialMedia = () => {
  const [activeTab, setActiveTab] = useState("instagram");
  const [tiktokMetricsSelectedCompanies, setTiktokMetricsSelectedCompanies] = useState<string[]>([]);
  const [tiktokSelectedCompanies, setTiktokSelectedCompanies] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  const { 
    data: instagramData, 
    loading: instagramLoading, 
    error: instagramError 
  } = useCSVData("/SM_IG_Breast_Pump_Brands.csv");
  
  const { 
    data: tiktokData, 
    loading: tiktokLoading, 
    error: tiktokError 
  } = useCSVData("/SM_TikTok_Breast_Pump_Brands.csv");

  const { years, months } = useMemo(() => {
    const igData = (instagramData as InstagramDataRow[]) || [];
    const ttData = (tiktokData as TikTokDataRow[]) || [];
    const combined = [...igData, ...ttData];

    const yearsSet = new Set<string>();
    combined.forEach(row => {
      const [, , year] = row.published_date.split("/");
      if (year) yearsSet.add(year);
    });

    const dataForMonths = selectedYears.length > 0
      ? combined.filter(row => {
          const [, , year] = row.published_date.split("/");
          return selectedYears.includes(year);
        })
      : combined;

    const monthsSet = new Set<string>();
    dataForMonths.forEach(row => {
      const [month] = row.published_date.split("/");
      if (month) monthsSet.add(month);
    });

    return {
      years: Array.from(yearsSet).sort(),
      months: Array.from(monthsSet).sort((a, b) => Number(a) - Number(b))
    };
  }, [instagramData, tiktokData, selectedYears]);

  const filteredInstagramData = useMemo(() => {
    const igData = (instagramData as InstagramDataRow[]) || [];
    return igData.filter(row => {
      const [month, , year] = row.published_date.split("/");
      return (
        (selectedYears.length === 0 || selectedYears.includes(year)) &&
        (selectedMonths.length === 0 || selectedMonths.includes(month))
      );
    });
  }, [instagramData, selectedYears, selectedMonths]);

  const filteredTikTokData = useMemo(() => {
    const ttData = (tiktokData as TikTokDataRow[]) || [];
    return ttData.filter(row => {
      const [month, , year] = row.published_date.split("/");
      return (
        (selectedYears.length === 0 || selectedYears.includes(year)) &&
        (selectedMonths.length === 0 || selectedMonths.includes(month))
      );
    });
  }, [tiktokData, selectedYears, selectedMonths]);

  const tiktokUniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    filteredTikTokData.forEach(row => {
      if (row.company) {
        companies.add(row.company);
      }
    });
    return Array.from(companies).sort();
  }, [filteredTikTokData]);

  if (instagramLoading || tiktokLoading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-gentle rounded-2xl">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-foreground font-medium">Loading social media data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (instagramError || tiktokError) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading social media data: {instagramError || tiktokError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const InstagramSection = () => {
    const igData = filteredInstagramData;
    const [metricsCompanies, setMetricsCompanies] = useState<string[]>([]);
    const [postTypeCompanies, setPostTypeCompanies] = useState<string[]>([]);
    const [postsCompanies, setPostsCompanies] = useState<string[]>([]);

    const instagramCompanies = useMemo(() => {
      const companies = new Set<string>();
      igData.forEach(row => {
        if (row.company) {
          companies.add(row.company);
        }
      });
      return Array.from(companies).sort();
    }, [igData]);

    const igMetricsData =
      metricsCompanies.length === 0
        ? igData
        : igData.filter(row => metricsCompanies.includes(row.company));

    // Calculate improved metrics with proper number parsing
    const totalEngagement = igMetricsData.reduce((sum, row) => sum + (Number(row.engagement_total) || 0), 0);
    const totalLikes = igMetricsData.reduce((sum, row) => sum + (Number(row.likes) || 0), 0);
    const totalComments = igMetricsData.reduce((sum, row) => sum + (Number(row.comments) || 0), 0);
    const totalImpressions = igMetricsData.reduce((sum, row) => sum + (Number(row.estimated_impressions) || 0), 0);
    const avgEngagementRate = igMetricsData.length > 0
      ? igMetricsData.reduce((sum, row) => sum + (Number(row.engagement_rate_by_follower) || 0), 0) / igMetricsData.length
      : 0;
    const uniqueCompanies = new Set(igMetricsData.map(row => row.company)).size;

    return (
      <div className="space-y-6">
        {/* Metrics Section with Company Filter */}
        <div className="bg-soft-rose border border-border shadow-soft rounded-2xl p-6 space-y-6">
          {/* Metrics Company Filter */}
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs font-medium text-foreground">Company</label>
              <MultiSelect
                options={instagramCompanies}
                selected={metricsCompanies}
                onChange={setMetricsCompanies}
                placeholder="All Companies"
                className="w-full"
              />
            </div>
          </div>

          {/* Top Row - 4 metrics centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-pink-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-600 capitalize tracking-wide">Posts</p>
                    <p className="text-2xl font-bold text-pink-800 tracking-tight">{igMetricsData.length.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-200 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-pink-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-red-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 capitalize tracking-wide">Likes</p>
                    <p className="text-2xl font-bold text-red-800 tracking-tight">{formatNumber(totalLikes)}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 capitalize tracking-wide">Comments</p>
                    <p className="text-2xl font-bold text-blue-800 tracking-tight">{formatNumber(totalComments)}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 capitalize tracking-wide">Impressions</p>
                    <p className="text-2xl font-bold text-green-800 tracking-tight">{formatNumber(totalImpressions)}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - 4 metrics centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-purple-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 capitalize tracking-wide">Avg Engagement Rate</p>
                    <p className="text-2xl font-bold text-purple-800 tracking-tight">{(avgEngagementRate * 100).toFixed(2)}%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-indigo-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 capitalize tracking-wide">Engagement</p>
                    <p className="text-2xl font-bold text-indigo-800 tracking-tight">{(totalEngagement / 1000000).toFixed(2)}M</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 capitalize tracking-wide">Unique Brands</p>
                    <p className="text-2xl font-bold text-orange-800 tracking-tight">{uniqueCompanies}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-teal-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600 capitalize tracking-wide">Post Types</p>
                    <p className="text-2xl font-bold text-teal-800 tracking-tight">{new Set(igMetricsData.map(row => row.post_type)).size}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-200 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-teal-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Ranking - Horizontal Bar Chart */}
          <Card className="shadow-soft rounded-2xl border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-600" />
                Top Companies by Engagement Rate by Follower
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">Companies ranked by average engagement rate by follower</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="max-h-80 overflow-y-auto overflow-x-visible relative">
                {(() => {
                  if (!igData || igData.length === 0) return <div className="text-center text-gray-500 py-8">No data available</div>;
                  
                  const companyEngagementRate = igData.reduce((acc, row) => {
                    const company = row.company;
                    const engagementRate = Number(row.engagement_rate_by_follower) || 0;
                    const followers = Number(row.followers) || 0;
                    
                    if (!company || engagementRate === 0) return acc;
                    
                    if (!acc[company]) {
                      acc[company] = { 
                        totalRate: 0, 
                        count: 0, 
                        followers: followers // Use most recent followers count
                      };
                    }
                    acc[company].totalRate += engagementRate;
                    acc[company].count += 1;
                    if (followers > 0) {
                      acc[company].followers = followers; // Update with latest non-zero follower count
                    }
                    
                    return acc;
                  }, {} as Record<string, { totalRate: number; count: number; followers: number }>);

                  const sortedCompanies = Object.entries(companyEngagementRate)
                    .map(([company, data]) => [
                      company, 
                      data.totalRate / data.count, 
                      data.count, 
                      data.followers
                    ] as [string, number, number, number])
                    .filter(([company, avgRate]) => avgRate > 0)
                    .sort((a, b) => b[1] - a[1]);

                  const maxEngagementRate = sortedCompanies[0]?.[1] || 1;

                  return (
                    <div className="space-y-3 pt-12">
                      {sortedCompanies.map(([company, engagementRate, postCount, followers], index) => (
                        <div key={company} className="flex items-center gap-3 group">
                          <div className="w-6 text-xs font-medium text-gray-500 text-right">
                            #{index + 1}
                          </div>
                          <div className="flex-1 relative">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                {company}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(engagementRate * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div 
                              className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative"
                              onMouseEnter={(e) => {
                                const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                                if (tooltip) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  tooltip.style.display = 'block';
                                  tooltip.style.left = `${rect.left + rect.width / 2}px`;
                                  tooltip.style.top = `${rect.top}px`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                                if (tooltip) tooltip.style.display = 'none';
                              }}
                            >
                              <div 
                                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(engagementRate / maxEngagementRate) * 100}%` }}
                              />
                              <div 
                                className="custom-tooltip fixed bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none"
                                style={{ 
                                  display: 'none', 
                                  zIndex: 99999,
                                  transform: 'translate(-50%, -100%)',
                                  marginTop: '-8px'
                                }}
                              >
                                <div className="font-semibold">{company}</div>
                                <div className="text-gray-300">Avg Engagement Rate: {(engagementRate * 100).toFixed(2)}%</div>
                                <div className="text-gray-300">Total Posts: {postCount.toLocaleString()}</div>
                                <div className="text-gray-300">Followers: {followers.toLocaleString()}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Post Type Distribution - Donut Chart */}
          <Card className="shadow-soft rounded-2xl border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Video className="w-5 h-5 text-teal-600" />
                    Post Type Distribution
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">Distribution of content types</CardDescription>
                </div>
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <label className="text-xs font-medium text-gray-600 opacity-80">Company</label>
                  <MultiSelect
                    options={instagramCompanies}
                    selected={postTypeCompanies}
                    onChange={setPostTypeCompanies}
                    placeholder="All Companies"
                    className="w-full text-xs bg-white/80 border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        // Filter data by selected brands
                        const filteredData = postTypeCompanies.length === 0
                          ? igData
                          : igData.filter(row => postTypeCompanies.includes(row.company));

                        const postTypeCount = filteredData.reduce((acc, row) => {
                          const postType = row.post_type || 'Unknown';
                          acc[postType] = (acc[postType] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        const total = Object.values(postTypeCount).reduce((sum, count) => sum + count, 0);

                        return Object.entries(postTypeCount)
                          .map(([type, count]) => ({
                            name: type,
                            value: count,
                            percentage: ((count / total) * 100).toFixed(1)
                          }))
                          .sort((a, b) => b.value - a.value);
                      })()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(() => {
                        const colors = ['#f472b6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                        
                        // Filter data by selected brands (same logic as above)
                        const filteredData = postTypeCompanies.length === 0
                          ? igData
                          : igData.filter(row => postTypeCompanies.includes(row.company));

                        const postTypeCount = filteredData.reduce((acc, row) => {
                          const postType = row.post_type || 'Unknown';
                          acc[postType] = (acc[postType] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        return Object.keys(postTypeCount).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ));
                      })()}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          
                          // Get the correct color based on the data index
                          const colors = ['#f472b6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                          
                          // Filter data to get the same order as the chart
                          const filteredData = postTypeCompanies.length === 0
                            ? igData
                            : igData.filter(row => postTypeCompanies.includes(row.company));

                          const postTypeCount = filteredData.reduce((acc, row) => {
                            const postType = row.post_type || 'Unknown';
                            acc[postType] = (acc[postType] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);

                          const total = Object.values(postTypeCount).reduce((sum, count) => sum + count, 0);
                          const sortedTypes = Object.entries(postTypeCount)
                            .map(([type, count]) => ({ name: type, value: count }))
                            .sort((a, b) => b.value - a.value);
                          
                          const currentIndex = sortedTypes.findIndex(item => item.name === data.name);
                          const segmentColor = colors[currentIndex % colors.length];
                          
                          return (
                            <div className="relative bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-lg border border-gray-200/60 rounded-2xl shadow-2xl p-5 min-w-[180px] max-w-[220px] transform transition-all duration-300 ease-out">
                              {/* Subtle inner glow */}
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                              
                              {/* Header with icon and title */}
                              <div className="relative flex items-center gap-3 mb-3">
                                <div className="relative">
                                  <div 
                                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white/80"
                                    style={{ backgroundColor: segmentColor }}
                                  />
                                  <div 
                                    className="absolute inset-0 w-4 h-4 rounded-full opacity-30 animate-pulse"
                                    style={{ backgroundColor: segmentColor }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800 text-sm leading-tight">{data.name}</p>
                                  <p className="text-gray-500 text-xs font-medium">Post Type</p>
                                </div>
                              </div>
                              
                              {/* Divider */}
                              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3" />
                              
                              {/* Metrics */}
                              <div className="relative space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 text-xs font-medium">Posts Count</span>
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-1.5 h-1.5 rounded-full" 
                                      style={{ backgroundColor: segmentColor }}
                                    />
                                    <span className="font-bold text-gray-800 text-sm">{data.value.toLocaleString()}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 text-xs font-medium">Percentage</span>
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-1.5 h-1.5 rounded-full" 
                                      style={{ backgroundColor: segmentColor }}
                                    />
                                    <span 
                                      className="font-bold text-sm"
                                      style={{ color: segmentColor }}
                                    >
                                      {data.percentage}%
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="mt-3">
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500 ease-out"
                                      style={{ 
                                        backgroundColor: segmentColor,
                                        width: `${data.percentage}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bottom accent */}
                              <div 
                                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-60"
                                style={{ backgroundColor: segmentColor }}
                              />
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => (
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft rounded-2xl border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-600" />
              Instagram Posts Performance
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Recent posts and their engagement metrics</CardDescription>
            <br />

            {/* Company Selector */}
            <div className="mt-4 flex flex-col gap-1 max-w-xs">
              <label className="text-xs font-medium text-foreground">Company</label>
              <MultiSelect
                options={instagramCompanies}
                selected={postsCompanies}
                onChange={setPostsCompanies}
                placeholder="All Companies"
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Ranking Label */}
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 text-sm font-semibold px-4 py-2 rounded-full border border-pink-200">
                <Heart className="w-4 h-4" />
                Ranked by Likes
              </span>
            </div>

            <br />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
              {(igData || [])
                .filter(row => row && (postsCompanies.length === 0 || postsCompanies.includes(row.company)))
                .sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0))
                .slice(0, 9)
                .map((post, index) => (
                <div key={index} className="space-y-2">
                  {/* Company Tag Outside */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-sm text-pink-800">{post.company || 'Unknown'}</span>
                      <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full font-medium">
                        @{post.presence_handle || 'unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-pink-600 font-medium">{post.published_date || 'Unknown date'}</span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    {/* Post Embed */}
                    <div className="relative aspect-square bg-gradient-to-br from-pink-100 to-rose-200 rounded-t-xl overflow-hidden">
                      {post.post_link ? (
                        <iframe
                          src={`${post.post_link}embed/`}
                          className="w-full h-full border-0"
                          style={{ border: 0 }}
                          scrolling="no"
                          title={`Instagram post by ${post.presence_handle}`}
                          onError={() => {
                            // Silently handle embed failures
                            console.log(`Instagram embed failed for post: ${post.post_link}`);
                          }}
                          onLoad={() => {
                            // Optional: Handle successful loads
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
                          <div className="text-center">
                            <Instagram className="w-12 h-12 text-pink-400 mx-auto mb-2" />
                            <p className="text-pink-600 text-sm font-medium">Post not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    {/* Message */}
                    <div className="mb-2">
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{post.message || 'No message available'}</p>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3 text-rose-600" />
                        <span className="text-rose-700 font-medium">{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 font-medium">{formatNumber(post.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Eye className="w-3 h-3 text-purple-600" />
                        <span className="text-purple-700 font-medium">{formatNumber(post.estimated_impressions)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-indigo-600" />
                        <span className="text-indigo-700 font-medium">{formatNumber(post.engagement_total)}</span>
                      </div>
                    </div>
                    
                    {/* Footer metrics */}
                    <div className="flex items-center justify-between pt-2 border-t border-pink-200/50">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{formatNumber(post.followers)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-pink-600">
                        <span className="font-bold">{(post.engagement_rate_by_follower * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {/* Link to Instagram */}
                    {post.post_link && (
                      <div className="mt-2">
                        <a 
                          href={post.post_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-800 font-medium transition-colors duration-200"
                        >
                          <span>View on Instagram</span>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  const TikTokSection = () => {
    const ttData = filteredTikTokData;
    const ttMetricsData =
      tiktokMetricsSelectedCompanies.length === 0
        ? ttData
        : ttData.filter(row => tiktokMetricsSelectedCompanies.includes(row.company));

    // Calculate improved metrics with proper number parsing
    const totalEngagement = ttMetricsData.reduce((sum, row) => sum + (Number(row.engagement_total) || 0), 0);
    const totalViews = ttMetricsData.reduce((sum, row) => sum + (Number(row.views) || 0), 0);
    const totalLikes = ttMetricsData.reduce((sum, row) => sum + (Number(row.likes) || 0), 0);
    const totalComments = ttMetricsData.reduce((sum, row) => sum + (Number(row.comments) || 0), 0);
    const totalShares = ttMetricsData.reduce((sum, row) => sum + (Number(row.shares) || 0), 0);
    const avgEngagementRate = ttMetricsData.length > 0
      ? ttMetricsData.reduce((sum, row) => sum + (Number(row.engagement_rate_by_view) || 0), 0) / ttMetricsData.length
      : 0;
    const uniqueCompanies = new Set(ttMetricsData.map(row => row.company)).size;

    return (
      <div className="space-y-6">
        {/* TikTok Metrics Container */}
        <div className="bg-soft-rose border border-border shadow-soft rounded-2xl p-6 space-y-6">
          {/* Metrics Company Filter */}
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs font-medium text-foreground">Company</label>
              <MultiSelect
                options={tiktokUniqueCompanies}
                selected={tiktokMetricsSelectedCompanies}
                onChange={setTiktokMetricsSelectedCompanies}
                placeholder="All Companies"
                className="w-full"
              />
            </div>
          </div>

          {/* Top Row - 4 metrics centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-[#ff0050]/30 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#ff0050] capitalize tracking-wide">Videos</p>
                    <p className="text-2xl font-bold text-[#ff0050] tracking-tight">{ttMetricsData.length.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-[#ff0050]/10 rounded-xl flex items-center justify-center">
                    <TikTokIcon className="w-5 h-5 text-[#ff0050]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#00f2ea]/30 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#00f2ea] capitalize tracking-wide">Views</p>
                    <p className="text-2xl font-bold text-[#00f2ea] tracking-tight">{formatNumber(totalViews)}</p>
                  </div>
                  <div className="w-10 h-10 bg-[#00f2ea]/10 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#00f2ea]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-rose-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600 capitalize tracking-wide">Likes</p>
                    <p className="text-2xl font-bold text-rose-800 tracking-tight">{formatNumber(totalLikes)}</p>
                  </div>
                  <div className="w-10 h-10 bg-rose-200 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-indigo-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 capitalize tracking-wide">Comments</p>
                    <p className="text-2xl font-bold text-indigo-800 tracking-tight">{formatNumber(totalComments)}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-200 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-indigo-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - 4 metrics centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-emerald-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 capitalize tracking-wide">Shares</p>
                    <p className="text-2xl font-bold text-emerald-800 tracking-tight">{formatNumber(totalShares)}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-200 rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-amber-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 capitalize tracking-wide">Avg Engagement Rate</p>
                    <p className="text-2xl font-bold text-amber-800 tracking-tight">{(avgEngagementRate * 100).toFixed(2)}%</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 capitalize tracking-wide">Engagement</p>
                    <p className="text-2xl font-bold text-purple-800 tracking-tight">{(totalEngagement / 1000000).toFixed(2)}M</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-teal-200 shadow-soft rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600 capitalize tracking-wide">Unique Brands</p>
                    <p className="text-2xl font-bold text-teal-800 tracking-tight">{uniqueCompanies}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-200 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Ranking - Horizontal Bar Chart */}
          <Card className="shadow-soft rounded-2xl border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00f2ea]" />
                Top Companies by Views
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">Companies ranked by total views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto">
                {(() => {
                  if (!ttData || ttData.length === 0) return <div className="text-center text-gray-500 py-8">No data available</div>;
                  
                  const companyViews = ttData.reduce((acc, row) => {
                    const company = row.company;
                    const views = Number(row.views) || 0;
                    
                    if (!company || views === 0) return acc;
                    
                    acc[company] = (acc[company] || 0) + views;
                    return acc;
                  }, {} as Record<string, number>);

                  const sortedCompanies = Object.entries(companyViews)
                    .filter(([company, views]) => views > 0)
                    .sort((a, b) => b[1] - a[1]);

                  const maxViews = sortedCompanies[0]?.[1] || 1;

                  return (
                    <div className="space-y-3 pt-12">
                      {sortedCompanies.map(([company, views], index) => {
                        const videoCount = ttData.filter(row => row.company === company).length;
                        const totalLikes = ttData.filter(row => row.company === company).reduce((sum, row) => sum + (Number(row.likes) || 0), 0);
                        
                        return (
                          <div key={company} className="flex items-center gap-3 group">
                            <div className="w-6 text-xs font-medium text-gray-500 text-right">
                              #{index + 1}
                            </div>
                            <div className="flex-1 relative">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                  {company}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatNumber(views)}
                                </span>
                              </div>
                              <div 
                                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative"
                                onMouseEnter={(e) => {
                                  const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                                  if (tooltip) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    tooltip.style.display = 'block';
                                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                                    tooltip.style.top = `${rect.top}px`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                                  if (tooltip) tooltip.style.display = 'none';
                                }}
                              >
                                <div
                                  className="bg-[#00f2ea] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(views / maxViews) * 100}%` }}
                                />
                                <div 
                                  className="custom-tooltip fixed bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-lg border border-gray-200/60 rounded-2xl shadow-2xl p-5 min-w-[200px] max-w-[250px] transform transition-all duration-300 ease-out pointer-events-none"
                                  style={{ 
                                    display: 'none', 
                                    zIndex: 99999,
                                    transform: 'translate(-50%, -100%)',
                                    marginTop: '-8px'
                                  }}
                                >
                                  {/* Subtle inner glow */}
                                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                                  
                                  {/* Header with icon and title */}
                                  <div className="relative flex items-center gap-3 mb-3">
                                    <div className="relative">
                                      <div className="w-4 h-4 rounded-full bg-[#00f2ea] shadow-sm ring-2 ring-white/80" />
                                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#00f2ea] opacity-30 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-gray-800 text-sm leading-tight">{company}</p>
                                      <p className="text-gray-500 text-xs font-medium">TikTok Brand</p>
                                    </div>
                                  </div>
                                  
                                  {/* Divider */}
                                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3" />
                                  
                                  {/* Metrics */}
                                  <div className="relative space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-xs font-medium">Total Views</span>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ea]" />
                                        <span className="font-bold text-gray-800 text-sm">{formatNumber(views)}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-xs font-medium">Total Videos</span>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff0050]" />
                                        <span className="font-bold text-[#ff0050] text-sm">{videoCount.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-xs font-medium">Total Likes</span>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <span className="font-bold text-rose-600 text-sm">{formatNumber(totalLikes)}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Progress bar */}
                                    <div className="mt-3">
                                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-[#00f2ea] transition-all duration-500 ease-out"
                                          style={{ width: `${(views / maxViews) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Bottom accent */}
                                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#00f2ea]/20 to-transparent rounded-full" />
                                  
                                  {/* Arrow */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Top Companies by Engagement Rate by Follower - Horizontal Bar Chart */}
          <Card className="shadow-soft rounded-2xl border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#ff0050]" />
                Top Companies by Engagement Rate by Follower
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">Companies ranked by average engagement rate by follower</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="max-h-80 overflow-y-auto overflow-x-visible relative">
                {(() => {
                  if (!ttData || ttData.length === 0) return <div className="text-center text-gray-500 py-8">No data available</div>;
                  
                  const companyEngagementRate = ttData.reduce((acc, row) => {
                    const company = row.company;
                    const engagementRate = Number(row.engagement_rate_by_follower) || 0;
                    const followers = Number(row.followers) || 0;
                    
                    if (!company || engagementRate === 0) return acc;
                    
                    if (!acc[company]) {
                      acc[company] = { 
                        totalRate: 0, 
                        count: 0, 
                        followers: followers
                      };
                    }
                    acc[company].totalRate += engagementRate;
                    acc[company].count += 1;
                    if (followers > 0) {
                      acc[company].followers = followers;
                    }
                    
                    return acc;
                  }, {} as Record<string, { totalRate: number; count: number; followers: number }>);

                  const sortedCompanies = Object.entries(companyEngagementRate)
                    .map(([company, data]) => [
                      company, 
                      data.totalRate / data.count, 
                      data.count, 
                      data.followers
                    ] as [string, number, number, number])
                    .filter(([company, avgRate]) => avgRate > 0)
                    .sort((a, b) => b[1] - a[1]);

                  const maxEngagementRate = sortedCompanies[0]?.[1] || 1;

                  return (
                    <div className="space-y-3 pt-12">
                      {sortedCompanies.map(([company, engagementRate, videoCount, followers], index) => (
                        <div key={company} className="flex items-center gap-3 group">
                          <div className="w-6 text-xs font-medium text-gray-500 text-right">
                            #{index + 1}
                          </div>
                          <div className="flex-1 relative">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                {company}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(engagementRate * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div 
                              className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative"
                              onMouseEnter={(e) => {
                                const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                                if (tooltip) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  tooltip.style.display = 'block';
                                  tooltip.style.left = `${rect.left + rect.width / 2}px`;
                                  tooltip.style.top = `${rect.top}px`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                const tooltip = e.currentTarget.querySelector('.custom-tooltip') as HTMLElement;
                                if (tooltip) tooltip.style.display = 'none';
                              }}
                            >
                                <div
                                    className="bg-[#ff0050] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(engagementRate / maxEngagementRate) * 100}%` }}
                                />
                              <div 
                                className="custom-tooltip fixed bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-lg border border-gray-200/60 rounded-2xl shadow-2xl p-5 min-w-[240px] max-w-[300px] transform transition-all duration-300 ease-out pointer-events-none"
                                style={{ 
                                  display: 'none', 
                                  zIndex: 99999,
                                  transform: 'translate(-50%, -100%)',
                                  marginTop: '-8px'
                                }}
                              >
                                {/* Subtle inner glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                                
                                {/* Header with icon and title */}
                                <div className="relative flex items-center gap-3 mb-3">
                                  <div className="relative">
                                      <div className="w-4 h-4 rounded-full bg-[#ff0050] shadow-sm ring-2 ring-white/80" />
                                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#ff0050] opacity-30 animate-pulse" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm leading-tight">{company}</p>
                                    <p className="text-gray-500 text-xs font-medium">TikTok Brand</p>
                                  </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3" />
                                
                                {/* Metrics */}
                                <div className="relative space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-xs font-medium">Avg Engagement Rate</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff0050]" />
                                      <span className="font-bold text-gray-800 text-sm">{(engagementRate * 100).toFixed(2)}%</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-xs font-medium">Total Videos</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff0050]" />
                                        <span className="font-bold text-[#ff0050] text-sm">{videoCount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-xs font-medium">Followers</span>
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      <span className="font-bold text-emerald-600 text-sm">{followers.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Progress bar */}
                                  <div className="mt-3">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                          className="h-full rounded-full bg-[#ff0050] transition-all duration-500 ease-out"
                                        style={{ width: `${(engagementRate / maxEngagementRate) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Bottom accent */}
                                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#ff0050]/20 to-transparent rounded-full" />
                                
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft rounded-2xl border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TikTokIcon className="w-5 h-5 text-[#ff0050]" />
              TikTok Videos Performance
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Recent videos and their engagement metrics</CardDescription>
            <br />

            {/* Company Selector */}
            <div className="mt-4 flex flex-col gap-1 max-w-xs">
              <label className="text-xs font-medium text-foreground">Company</label>
              <MultiSelect
                options={tiktokUniqueCompanies}
                selected={tiktokSelectedCompanies}
                onChange={setTiktokSelectedCompanies}
                placeholder="All Companies"
                className="w-full"
              />
            </div>
          </CardHeader>
            <CardContent>
            {/* Ranking Label */}
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-2 bg-[#00f2ea]/10 text-[#00f2ea] text-sm font-semibold px-4 py-2 rounded-full">
                  <Eye className="w-4 h-4 text-[#00f2ea]" />
                  Ranked by Views
                </span>
              </div>

              <br />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                {(ttData || [])
                  .filter(row => row && (tiktokSelectedCompanies.length === 0 || tiktokSelectedCompanies.includes(row.company)))
                  .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
                  .slice(0, 9)
                  .map((video, index) => (
                  <div key={index} className="space-y-2">
                  {/* Company Tag Outside */}
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#ff0050] text-xs font-bold px-2 py-1 rounded-full bg-[#ff0050]/10 border border-[#ff0050]/20">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-sm text-[#ff0050]">{video.company || 'Unknown'}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#00f2ea]/10 text-[#00f2ea] rounded-full font-medium">
                          @{video.presence_handle || 'unknown'}
                        </span>
                      </div>
                      <span className="text-xs text-[#ff0050] font-medium">{video.published_date || 'Unknown date'}</span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      {/* Video Embed */}
                      <div className="relative aspect-[9/16] bg-black rounded-t-xl overflow-hidden">
                        {video.post_link ? (
                          <iframe
                            src={`https://www.tiktok.com/embed/v2/${video.post_link.split('/').pop()}`}
                            className="w-full h-full border-0"
                            style={{ border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`TikTok video by ${video.presence_handle}`}
                            onError={() => {
                              // Silently handle embed failures
                              console.log(`TikTok embed failed for video: ${video.post_link}`);
                            }}
                            onLoad={() => {
                              // Optional: Handle successful loads
                            }}
                          />
                        ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#ff0050]/20 to-[#00f2ea]/20 flex items-center justify-center">
                          <div className="text-center">
                            <Video className="w-12 h-12 text-[#ff0050] mx-auto mb-2" />
                            <p className="text-[#ff0050] text-sm font-medium">Video not available</p>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Content */}
                    <div className="p-3 bg-white">
                    {/* Message */}
                    <div className="mb-2">
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{video.message || 'No message available'}</p>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Eye className="w-3 h-3 text-[#00f2ea]" />
                        <span className="text-[#00f2ea] font-medium">{formatNumber(video.views)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3 text-[#ff0050]" />
                        <span className="text-[#ff0050] font-medium">{formatNumber(video.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-700 font-medium">{formatNumber(video.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Share2 className="w-3 h-3 text-black" />
                        <span className="text-black font-medium">{formatNumber(video.shares)}</span>
                      </div>
                    </div>

                    {/* Footer metrics */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{formatNumber(video.followers)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-[#00f2ea]">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">{formatNumber(video.engagement_total)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#ff0050]">
                          <span className="font-bold">{(video.engagement_rate_by_follower * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Link to TikTok */}
                    {video.post_link && (
                      <div className="mt-2">
                        <a
                          href={video.post_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#ff0050] hover:text-[#00f2ea] font-medium transition-colors duration-200"
                        >
                          <span>View on TikTok</span>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg py-2 px-4 mb-6 w-full">
        <p className="text-sm text-blue-800 font-medium text-center">
          Dataset covers advertising data from January 1, 2024 to July 22, 2025
        </p>
      </div>

      <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 items-start">
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-xs font-medium text-foreground">Year</label>
            <MultiSelect
              options={years}
              selected={selectedYears}
              onChange={setSelectedYears}
              placeholder="All Years"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-xs font-medium text-foreground">Month</label>
            <MultiSelect
              options={months.map(month => MONTH_NAMES[Number(month) - 1])}
              selected={selectedMonths.map(month => MONTH_NAMES[Number(month) - 1])}
              onChange={(selectedMonthNames) => {
                const selectedMonthNumbers = selectedMonthNames.map(name =>
                  String(MONTH_NAMES.indexOf(name) + 1)
                );
                setSelectedMonths(selectedMonthNumbers);
              }}
              placeholder="All Months"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-white to-gray-50 shadow-soft rounded-2xl p-1 border border-gray-200">
          <TabsTrigger value="instagram" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-rose-100 data-[state=active]:text-pink-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200 flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100 data-[state=active]:to-blue-100 data-[state=active]:text-cyan-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200 flex items-center gap-2">
            <TikTokIcon className="w-4 h-4" />
            TikTok
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="instagram" className="mt-6">
          <InstagramSection />
        </TabsContent>
        
        <TabsContent value="tiktok" className="mt-6">
          <TikTokSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMedia;