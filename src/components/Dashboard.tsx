import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "./dashboard/DashboardHeader";

import ExecutiveSummary from "./tabs/ExecutiveSummary";
import BrandManufacturer from "./tabs/BrandManufacturer";
import DMEProviders from "./tabs/DMEProviders";
import SocialMedia from "./tabs/SocialMedia";
import { useCSVData } from "@/hooks/useCSVData";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("executive-summary");
  
  const { data: brandData, loading: brandLoading, error: brandError } = useCSVData("/brand_manufacturer_clean.csv");
  const { data: dmeData, loading: dmeLoading, error: dmeError } = useCSVData("/dme_provider_clean.csv");

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
        <div className="bg-orange-100 border-t border-b border-orange-200 flex items-center">
          <div className="container mx-auto max-w-7xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 py-1">
              <TabsList className="grid w-full grid-cols-4 bg-transparent rounded-none border-none p-0 shadow-none">
                <TabsTrigger 
                  value="executive-summary" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-soft font-bold text-black transition-all text-sm"
                >
                  Executive Summary
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
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-40 container mx-auto p-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-white rounded-2xl border border-border shadow-gentle p-6">
            <TabsContent value="executive-summary" className="mt-0">
              <ExecutiveSummary brandData={brandData} dmeData={dmeData} />
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
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;