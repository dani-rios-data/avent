import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./dashboard/DashboardHeader";

import MarketingOverview from "./tabs/MarketingOverview";
import BrandManufacturer from "./tabs/BrandManufacturer";
import DMEProviders from "./tabs/DMEProviders";
import SocialMedia from "./tabs/SocialMedia";
import AmazonReviews from "./tabs/AmazonReviews";
import { useCSVData } from "@/hooks/useCSVData";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { parseISO, format } from "date-fns";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("marketing-overview");
  
  const { data: brandDataRaw, loading: brandLoading, error: brandError } =
    useCSVData("/Pathmathics_Brand_Manufacturer_plus_focus.csv");

  // Parse all brand data and add derived fields
  const brandDataAll =
    brandDataRaw
      ?.map((row) => {
        const dateStr = row["Last Seen"];
        const lastSeenDate = parseISO(String(dateStr));
        if (isNaN(lastSeenDate.getTime())) return null;
        const year = format(lastSeenDate, "yyyy");
        const monthYear = format(lastSeenDate, "MMM yyyy");

        return {
          ...row,
          "month-year": monthYear,
          year,
          advertiser: row["Advertiser"],
          "brand root": row["Brand Root"],
          "category level 2": row["Category Level 2"],
          "category level 3": row["Category Level 3"],
          "category level 8": row["Category Level 8"],
          channel: row["Channel"],
          placement: row["Placement"],
          publisher: row["Publisher"],
          impressions: parseInt(row["Impressions"]) || 0,
          "spend (usd)": parseFloat(row["Spend (USD)"]) || 0,
          focus_vs_other: row["focus_vs_other"],
        };
      })
      .filter(Boolean) || [];

  // Filter data to only include breast pump related products (focus_vs_other = 'focus')
  const brandData = brandDataAll.filter(
    (row) => row["focus_vs_other"] === "focus"
  );
  const { data: dmeDataRaw, loading: dmeLoading, error: dmeError } = useCSVData(
    "/Pathmatics_DME_plus_focus.csv"
  );

  // Parse all DME data and add derived fields
  const dmeDataAll =
    dmeDataRaw
      ?.map((row) => {
        const dateStr = row["Last Seen"];
        const lastSeenDate = parseISO(String(dateStr));
        if (isNaN(lastSeenDate.getTime())) return null;
        const year = format(lastSeenDate, "yyyy");
        const monthYear = format(lastSeenDate, "MMM yyyy");

        return {
          ...row,
          "month-year": monthYear,
          year,
          advertiser: row["Advertiser"],
          "brand root": row["Brand Root"],
          "category level 2": row["Category Level 2"],
          "category level 3": row["Category Level 3"],
          "category level 8": row["Category Level 8"],
          channel: row["Channel"],
          placement: row["Placement"],
          publisher: row["Publisher"],
          impressions: parseInt(row["Impressions"]) || 0,
          "spend (usd)": parseFloat(row["Spend (USD)"]) || 0,
          focus_vs_other: row["focus_vs_other"],
        };
      })
      .filter(Boolean) || [];

  // Filter data to only include breast pump related products
  const dmeData = dmeDataAll.filter((row) => row["focus_vs_other"] === "focus");

  if (brandLoading || dmeLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="p-8 bg-white shadow-gentle rounded-2xl">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-foreground font-medium">Loading dashboard data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (brandError || dmeError) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="p-8 bg-white shadow-gentle rounded-2xl max-w-md">
          <CardContent className="flex items-center gap-4 text-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Data Loading Error</h3>
              <p className="text-sm text-muted-foreground">
                {brandError || dmeError}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Fixed Header and Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-gentle">
        <div className="container mx-auto max-w-7xl">
          <DashboardHeader />
        </div>
        
        {/* Navigation bar with full width background */}
        <div className="bg-[#EA899A] border-t border-b border-[#EA899A] flex items-center">
          <div className="container mx-auto max-w-7xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 py-1">
              <TabsList className="grid w-full grid-cols-5 bg-transparent rounded-none border-none p-0 shadow-none">
                <TabsTrigger
                  value="marketing-overview"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-soft font-bold text-black transition-all text-sm"
                >
                  Marketing Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="brand-manufacturer" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-soft font-bold text-black transition-all text-sm"
                >
                  Brand Manufacturer
                </TabsTrigger>
                <TabsTrigger 
                  value="dme-providers" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-soft font-bold text-black transition-all text-sm"
                >
                  DME Providers
                </TabsTrigger>
                <TabsTrigger
                  value="social-media"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-soft font-bold text-black transition-all text-sm"
                >
                  Social Media
                </TabsTrigger>
                <TabsTrigger
                  value="amazon-reviews"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-soft font-bold text-black transition-all text-sm"
                >
                  Amazon Reviews
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-40 container mx-auto p-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-white rounded-2xl border border-border shadow-gentle p-6">
            <TabsContent value="marketing-overview" className="mt-0">
              <MarketingOverview brandData={brandDataAll} dmeData={dmeDataAll} />
            </TabsContent>
            
            <TabsContent value="brand-manufacturer" className="mt-0">
              <BrandManufacturer data={brandData} />
            </TabsContent>
            
            <TabsContent value="dme-providers" className="mt-0">
              <DMEProviders data={dmeData} />
            </TabsContent>
            
            <TabsContent value="social-media" className="mt-0">
              <SocialMedia />
            </TabsContent>

            <TabsContent value="amazon-reviews" className="mt-0">
              <AmazonReviews />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;