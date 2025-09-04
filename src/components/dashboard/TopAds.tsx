import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { Eye, BarChart3 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface AdData {
  advertiser: string;
  impressions: number;
  "spend (usd)": number;
  Text?: string;
  "Link To Creative"?: string;
  "Link To Post"?: string;
  post_link?: string;
  "Landing Page"?: string;
}

interface TopAdsProps {
  data: AdData[];
}

const TopAds = ({ data }: TopAdsProps) => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const uniqueCompanies = useMemo(
    () => Array.from(new Set(data.map(row => row.advertiser))).sort(),
    [data]
  );

  const topAds = useMemo(
    () =>
      data
        .filter(row => selectedCompanies.length === 0 || selectedCompanies.includes(row.advertiser))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 12),
    [data, selectedCompanies]
  );

  return (
    <Card className="shadow-soft rounded-2xl border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">Top Ads</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Top 12 ads ranked by impressions
        </CardDescription>
        <div className="mt-4 flex flex-col gap-1 max-w-xs">
          <label className="text-xs font-medium text-foreground">Company</label>
          <MultiSelect
            options={uniqueCompanies}
            selected={selectedCompanies}
            onChange={setSelectedCompanies}
            placeholder="All Companies"
            className="w-full"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
          {topAds.map((ad, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#EA899A] text-xs font-bold px-2 py-1 rounded-full bg-[#EA899A]/10 border border-[#EA899A]/20">
                  #{index + 1}
                </span>
                <span className="font-bold text-sm text-[#EA899A]">
                  {ad.advertiser || "Unknown"}
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
{(() => {
                  const imageUrl = ad["Link To Post"] || ad.post_link || ad["Link To Creative"];
                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={ad.Text || "Ad creative"}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Creative</span>
                    </div>
                  );
                })()}
                <div className="p-3 bg-white">
                  <div className="mb-2">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      {ad.Text || "No text available"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Eye className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-600 font-medium">
                        {formatNumber(ad.impressions)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <BarChart3 className="w-3 h-3 text-[#EA899A]" />
                      <span className="text-[#EA899A] font-medium">
                        ${formatNumber(ad["spend (usd)"])}
                      </span>
                    </div>
                  </div>
                  {ad["Landing Page"] && (
                    <a
                      href={ad["Landing Page"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#EA899A] hover:text-[#c06776] font-medium transition-colors duration-200"
                    >
                      <span>Visit Landing Page</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopAds;
