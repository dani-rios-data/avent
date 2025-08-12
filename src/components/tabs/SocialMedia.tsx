import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCSVData } from "@/hooks/useCSVData";
import { AlertCircle, Instagram, Heart, MessageCircle, Users, Eye, Share2, TrendingUp, Video, FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatNumber } from "@/lib/utils";

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
    const igData = instagramData as unknown as InstagramDataRow[];
    
    // Calculate improved metrics with proper number parsing
    const totalEngagement = igData.reduce((sum, row) => sum + (Number(row.engagement_total) || 0), 0);
    const totalLikes = igData.reduce((sum, row) => sum + (Number(row.likes) || 0), 0);
    const totalComments = igData.reduce((sum, row) => sum + (Number(row.comments) || 0), 0);
    const totalImpressions = igData.reduce((sum, row) => sum + (Number(row.estimated_impressions) || 0), 0);
    const avgEngagementRate = igData.length > 0 
      ? igData.reduce((sum, row) => sum + (Number(row.engagement_rate_by_follower) || 0), 0) / igData.length 
      : 0;
    const uniqueCompanies = new Set(igData.map(row => row.company)).size;


    return (
      <div className="space-y-6">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600 capitalize tracking-wide">Total Posts</p>
                  <p className="text-2xl font-bold text-pink-800 tracking-tight">{formatNumber(igData.length)}</p>
                </div>
                <div className="w-10 h-10 bg-pink-200 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pink-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 capitalize tracking-wide">Total Likes</p>
                  <p className="text-2xl font-bold text-red-800 tracking-tight">{formatNumber(totalLikes)}</p>
                </div>
                <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 capitalize tracking-wide">Total Comments</p>
                  <p className="text-2xl font-bold text-blue-800 tracking-tight">{formatNumber(totalComments)}</p>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 capitalize tracking-wide">Total Impressions</p>
                  <p className="text-2xl font-bold text-green-800 tracking-tight">{formatNumber(totalImpressions)}</p>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 capitalize tracking-wide">Avg Engagement Rate</p>
                  <p className="text-2xl font-bold text-purple-800 tracking-tight">{(avgEngagementRate * 100).toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 capitalize tracking-wide">Total Engagement</p>
                  <p className="text-2xl font-bold text-indigo-800 tracking-tight">{formatNumber(totalEngagement)}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-soft rounded-2xl">
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
        </div>

        <Card className="shadow-soft rounded-2xl border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Instagram Posts Performance</CardTitle>
            <CardDescription className="text-sm text-gray-600">Recent posts and their engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {igData.slice(0, 10).map((post, index) => (
                <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-pink-800">{post.company}</p>
                        <span className="text-xs px-2 py-0.5 bg-pink-200 text-pink-700 rounded-full font-medium">
                          @{post.presence_handle}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2 leading-relaxed">{post.message}</p>
                    </div>
                    <div className="text-right ml-4 space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium text-purple-700">
                        <TrendingUp className="w-3 h-3" />
                        {formatNumber(post.engagement_total)} engagements
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <Heart className="w-3 h-3" />
                        {formatNumber(post.likes)} likes
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-pink-200">
                    <span className="text-xs text-pink-600 font-medium">{post.published_date}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Users className="w-3 h-3 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {(post.engagement_rate_by_follower * 100).toFixed(1)}% engagement
                      </span>
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
    const ttData = tiktokData as unknown as TikTokDataRow[];
    
    // Calculate improved metrics with proper number parsing
    const totalEngagement = ttData.reduce((sum, row) => sum + (Number(row.engagement_total) || 0), 0);
    const totalViews = ttData.reduce((sum, row) => sum + (Number(row.views) || 0), 0);
    const totalLikes = ttData.reduce((sum, row) => sum + (Number(row.likes) || 0), 0);
    const totalComments = ttData.reduce((sum, row) => sum + (Number(row.comments) || 0), 0);
    const totalShares = ttData.reduce((sum, row) => sum + (Number(row.shares) || 0), 0);
    const avgEngagementRate = ttData.length > 0 
      ? ttData.reduce((sum, row) => sum + (Number(row.engagement_rate_by_view) || 0), 0) / ttData.length 
      : 0;
    const uniqueCompanies = new Set(ttData.map(row => row.company)).size;


    return (
      <div className="space-y-6">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-600 capitalize tracking-wide">Total Videos</p>
                  <p className="text-2xl font-bold text-violet-800 tracking-tight">{formatNumber(ttData.length)}</p>
                </div>
                <div className="w-10 h-10 bg-violet-200 rounded-xl flex items-center justify-center">
                  <TikTokIcon className="w-5 h-5 text-violet-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600 capitalize tracking-wide">Total Views</p>
                  <p className="text-2xl font-bold text-cyan-800 tracking-tight">{formatNumber(totalViews)}</p>
                </div>
                <div className="w-10 h-10 bg-cyan-200 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-cyan-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600 capitalize tracking-wide">Total Likes</p>
                  <p className="text-2xl font-bold text-rose-800 tracking-tight">{formatNumber(totalLikes)}</p>
                </div>
                <div className="w-10 h-10 bg-rose-200 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 capitalize tracking-wide">Total Comments</p>
                  <p className="text-2xl font-bold text-indigo-800 tracking-tight">{formatNumber(totalComments)}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-200 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 capitalize tracking-wide">Total Shares</p>
                  <p className="text-2xl font-bold text-emerald-800 tracking-tight">{formatNumber(totalShares)}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-200 rounded-xl flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 capitalize tracking-wide">Avg Engagement Rate</p>
                  <p className="text-2xl font-bold text-amber-800 tracking-tight">{(avgEngagementRate * 100).toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-soft rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 capitalize tracking-wide">Total Engagement</p>
                  <p className="text-2xl font-bold text-purple-800 tracking-tight">{formatNumber(totalEngagement)}</p>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 shadow-soft rounded-2xl">
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

        <Card className="shadow-soft rounded-2xl border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">TikTok Videos Performance</CardTitle>
            <CardDescription className="text-sm text-gray-600">Recent videos and their engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ttData.slice(0, 10).map((video, index) => (
                <div key={index} className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 hover:shadow-soft transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-violet-800">{video.company}</p>
                        <span className="text-xs px-2 py-0.5 bg-violet-200 text-violet-700 rounded-full font-medium">
                          @{video.presence_handle}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2 leading-relaxed">{video.message}</p>
                    </div>
                    <div className="text-right ml-4 space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium text-cyan-700">
                        <Eye className="w-3 h-3" />
                        {formatNumber(video.views)} views
                      </div>
                      <div className="flex items-center gap-1 text-xs text-rose-600">
                        <Heart className="w-3 h-3" />
                        {formatNumber(video.likes)} likes
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-violet-200">
                    <span className="text-xs text-violet-600 font-medium">{video.published_date}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="w-3 h-3 text-amber-600" />
                      <span className="text-amber-700 font-medium">
                        {(video.engagement_rate_by_view * 100).toFixed(1)}% engagement
                      </span>
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 bg-purple-200 rounded-xl flex items-center justify-center">
            <Instagram className="w-4 h-4 text-purple-700" />
          </div>
          <h2 className="text-lg font-bold text-purple-800 text-center tracking-wide">
            Social Media Analysis
          </h2>
          <div className="w-8 h-8 bg-pink-200 rounded-xl flex items-center justify-center">
            <TikTokIcon className="w-4 h-4 text-pink-700" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-white to-gray-50 shadow-soft rounded-2xl p-1 border border-gray-200">
          <TabsTrigger value="instagram" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-rose-100 data-[state=active]:text-pink-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200 flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-100 data-[state=active]:to-purple-100 data-[state=active]:text-violet-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200 flex items-center gap-2">
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