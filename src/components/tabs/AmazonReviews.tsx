import { useMemo, Fragment, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Store, Tag } from "lucide-react";
import { useCSVData } from "@/hooks/useCSVData";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProductRow {
  ASIN: string;
  "Product Title": string;
  Price: number | string;
  "Original Price": number | string;
  Currency: string;
  Country: string;
  Brand: string;
  "Star Rating": number;
  "Number of Ratings": number;
  "Product URL": string;
  "Product Photo": string;
  Availability: string;
  "Is Best Seller": string;
  "Is Amazon Choice": string;
  "Is Prime": string;
  "Sales Volume": string;
}

interface ReviewRow {
  "Review ID": string;
  ASIN: string;
  Rating: number;
  "Review Title": string;
  "Review Text": string;
  "Review Link": string;
}

interface Product {
  asin: string;
  title: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  country: string;
  brand: string;
  starRating: number;
  numberOfRatings: number;
  url: string;
  photo: string;
  availability: string;
  isBestSeller: boolean;
  isAmazonChoice: boolean;
  isPrime: boolean;
  salesVolume: string | null;
  reviews: ReviewRow[];
  avgReviewRating: number | null;
  reviewCount: number;
}

interface BrandStats {
  brand: string;
  productCount: number;
  totalReviews: number;
  avgPrice: number;
  avgDiscount: number;
  avgRating: number;
}

const PriceRatingTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const product = payload[0].payload as Product;
    return (
      <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
        <div className="font-medium">{product.brand}</div>
        <div className="text-muted-foreground">{product.title}</div>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          View product
        </a>
      </div>
    );
  }
  return null;
};

const AmazonReviews = () => {
  const { data: productRaw, loading: productsLoading, error: productsError } = useCSVData<ProductRow>("/consolidated_products.csv");
  const { data: reviewRaw, loading: reviewsLoading, error: reviewsError } = useCSVData<ReviewRow>("/consolidated_reviews.csv");

  const {
    products,
    brandStats,
    ratingDistributionAll,
    ratingDistributionAvent,
    topProducts,
  } = useMemo(() => {
    const prodRows = (productRaw as ProductRow[]).map(p => {
      const price = typeof p.Price === "number" ? p.Price : parseFloat(String(p.Price).replace(/[$,]/g, ""));
      const originalPrice = p["Original Price"] ? parseFloat(String(p["Original Price"]).replace(/[$,]/g, "")) : null;
      const brand = p.Brand.replace(/^Visit the\s+(.*?)\s+Store$/i, "$1").trim();
      return {
        asin: p.ASIN,
        title: p["Product Title"],
        price,
        originalPrice,
        currency: p.Currency,
        country: p.Country,
        brand,
        starRating: Number(p["Star Rating"]),
        numberOfRatings: Number(p["Number of Ratings"]),
        url: p["Product URL"],
        photo: p["Product Photo"],
        availability: p.Availability,
        isBestSeller: p["Is Best Seller"]?.toLowerCase() === "true",
        isAmazonChoice: p["Is Amazon Choice"]?.toLowerCase() === "true",
        isPrime: p["Is Prime"]?.toLowerCase() === "true",
        salesVolume: p["Sales Volume"] || null,
      };
    });

    const reviews = reviewRaw as ReviewRow[];
    const reviewsByProduct = new Map<string, ReviewRow[]>();
    reviews.forEach(r => {
      if (!reviewsByProduct.has(r.ASIN)) reviewsByProduct.set(r.ASIN, []);
      reviewsByProduct.get(r.ASIN)!.push(r);
    });

    const products: Product[] = prodRows.map(p => {
      const productReviews = reviewsByProduct.get(p.asin) || [];
      const avgReviewRating = productReviews.length > 0 ? productReviews.reduce((sum, r) => sum + Number(r.Rating), 0) / productReviews.length : null;
      return {
        ...p,
        reviews: productReviews,
        avgReviewRating,
        reviewCount: productReviews.length,
      };
    });

    const brandMap = new Map<string, BrandStats & { totalPrice: number; totalDiscount: number; totalRating: number }>();
    products.forEach(p => {
      const stats = brandMap.get(p.brand) || {
        brand: p.brand,
        productCount: 0,
        totalReviews: 0,
        avgPrice: 0,
        avgDiscount: 0,
        avgRating: 0,
        totalPrice: 0,
        totalDiscount: 0,
        totalRating: 0,
      };
      stats.productCount += 1;
      stats.totalReviews += p.numberOfRatings;
      stats.totalPrice += p.price;
      const discount = p.originalPrice ? ((p.originalPrice - p.price) / p.originalPrice) * 100 : 0;
      stats.totalDiscount += discount;
      stats.totalRating += p.starRating;
      brandMap.set(p.brand, stats);
    });

    const brandStats: BrandStats[] = Array.from(brandMap.values()).map(s => ({
      brand: s.brand,
      productCount: s.productCount,
      totalReviews: s.totalReviews,
      avgPrice: s.totalPrice / s.productCount,
      avgDiscount: s.totalDiscount / s.productCount,
      avgRating: s.totalRating / s.productCount,
    }));

    const ratingCountsAll = [1, 2, 3, 4, 5].map(r => ({
      rating: r,
      count: reviews.filter(rv => Number(rv.Rating) === r).length,
    }));

    const aventReviews = products
      .filter(p => p.brand.toLowerCase().includes("avent"))
      .flatMap(p => p.reviews);
    const ratingCountsAvent = [1, 2, 3, 4, 5].map(r => ({
      rating: r,
      count: aventReviews.filter(rv => Number(rv.Rating) === r).length,
    }));

    const topProducts = [...products]
      .filter(p => p.reviewCount > 0)
      .sort((a, b) => (b.avgReviewRating! - a.avgReviewRating!))
      .slice(0, 5);

    return {
      products,
      brandStats,
      ratingDistributionAll: ratingCountsAll,
      ratingDistributionAvent: ratingCountsAvent,
      topProducts,
    };
  }, [productRaw, reviewRaw]);

  const sortedBrandStats = useMemo(
    () => [...brandStats].sort((a, b) => b.totalReviews - a.totalReviews),
    [brandStats]
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  useEffect(() => {
    setSelectedBrands(sortedBrandStats.slice(0, 8).map(b => b.brand));
  }, [sortedBrandStats]);
  const displayedBrands = useMemo(
    () =>
      sortedBrandStats.filter(b => selectedBrands.includes(b.brand)),
    [selectedBrands, sortedBrandStats]
  );

  const brandColorMap = useMemo(() => {
    const brands = Array.from(new Set(products.map(p => p.brand)));
    return brands.reduce<Record<string, string>>((acc, brand, index) => {
      acc[brand] = `hsl(${(index * 360) / brands.length}, 65%, 50%)`;
      return acc;
    }, {});
  }, [products]);

  const productsByBrand = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach(p => {
      (map[p.brand] = map[p.brand] || []).push(p);
    });
    return Object.entries(map).map(([brand, items]) => ({ brand, items }));
  }, [products]);

  if (productsLoading || reviewsLoading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-gentle rounded-2xl">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-foreground font-medium">Loading Amazon review data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productsError || reviewsError) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading Amazon review data: {productsError || reviewsError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Brand Overview
          </CardTitle>
          <CardDescription>General brand information</CardDescription>
          <div className="w-72 mt-4">
            <MultiSelect
              options={sortedBrandStats.map(b => b.brand)}
              selected={selectedBrands}
              onChange={setSelectedBrands}
              placeholder="Select brands"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayedBrands.map(b => (
              <Card
                key={b.brand}
                className="border border-border/40 shadow-sm rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary/80" />
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {b.brand}
                    </CardTitle>
                  </div>
                  <CardDescription>{b.productCount} products</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {[
                      {
                        label: "Avg Price",
                        value:
                          Number.isFinite(b.avgPrice) && b.avgPrice > 0
                            ? `$${b.avgPrice.toFixed(2)}`
                            : null,
                      },
                      {
                        label: "Avg Discount",
                        value:
                          Number.isFinite(b.avgDiscount) && b.avgDiscount > 0
                            ? `${b.avgDiscount.toFixed(1)}%`
                            : null,
                      },
                      {
                        label: "Avg Rating",
                        value:
                          Number.isFinite(b.avgRating) && b.avgRating > 0
                            ? b.avgRating.toFixed(2)
                            : null,
                      },
                      {
                        label: "Ratings",
                        value:
                          Number.isFinite(b.totalReviews) && b.totalReviews > 0
                            ? formatNumber(b.totalReviews)
                            : null,
                      },
                    ].map((stat, idx) =>
                      stat.value ? (
                        <Fragment key={idx}>
                          <dt className="text-muted-foreground">{stat.label}</dt>
                          <dd className="text-right font-medium">{stat.value}</dd>
                        </Fragment>
                      ) : null
                    )}
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price vs. Rating</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis type="number" dataKey="price" name="Price" unit="$" />
                <YAxis type="number" dataKey="starRating" name="Rating" domain={[0, 5]} />
                <Tooltip content={<PriceRatingTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                {productsByBrand.map(({ brand, items }) => (
                  <Scatter key={brand} data={items} name={brand} fill={brandColorMap[brand]} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                All Brands
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistributionAll}>
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#EA899A"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Avent
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistributionAvent}>
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#EA899A"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Rated Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Avg Rating</TableHead>
                <TableHead className="text-right">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map(p => (
                <TableRow key={p.asin}>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell className="text-right">{p.avgReviewRating?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatNumber(p.reviewCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map(p => (
              <Card key={p.asin} className="overflow-hidden">
                <CardHeader className="p-0">
                  <img src={p.photo} alt={p.title} className="w-full h-60 object-cover" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <CardTitle className="text-sm line-clamp-2">{p.title}</CardTitle>
                  <CardDescription>{p.brand}</CardDescription>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.currency} {p.price.toFixed(2)}</span>
                    {p.originalPrice && (
                      <>
                        <span className="text-sm line-through text-muted-foreground">{p.currency} {p.originalPrice.toFixed(2)}</span>
                        <Badge variant="secondary">
                          {(((p.originalPrice - p.price) / p.originalPrice) * 100).toFixed(0)}% off
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ⭐ {(p.avgReviewRating ?? p.starRating).toFixed(2)} ({formatNumber(p.reviewCount || p.numberOfRatings)})
                  </div>
                  <dl className="text-xs space-y-1">
                    <div className="flex justify-between"><dt>ASIN</dt><dd>{p.asin}</dd></div>
                    <div className="flex justify-between"><dt>Currency</dt><dd>{p.currency}</dd></div>
                    <div className="flex justify-between"><dt>Country</dt><dd>{p.country}</dd></div>
                    {p.availability && (
                      <div className="flex justify-between"><dt>Availability</dt><dd>{p.availability}</dd></div>
                    )}
                    <div className="flex justify-between"><dt>Best Seller</dt><dd>{p.isBestSeller ? "Yes" : "No"}</dd></div>
                    <div className="flex justify-between"><dt>Amazon Choice</dt><dd>{p.isAmazonChoice ? "Yes" : "No"}</dd></div>
                    <div className="flex justify-between"><dt>Prime</dt><dd>{p.isPrime ? "Yes" : "No"}</dd></div>
                    {p.salesVolume && (
                      <div className="flex justify-between"><dt>Sales Volume</dt><dd>{p.salesVolume}</dd></div>
                    )}
                  </dl>
                  <div className="flex gap-2 mt-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        View Product
                      </a>
                    </Button>
                    {p.reviews.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">View Reviews</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Reviews</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {p.reviews.map(r => (
                              <div key={r["Review ID"]} className="space-y-1">
                                <h4 className="font-semibold">{r["Review Title"]}</h4>
                                <p className="text-sm">Rating: {r.Rating}</p>
                                <p className="text-sm text-muted-foreground">{r["Review Text"]}</p>
                                <a
                                  href={r["Review Link"]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary text-sm underline"
                                >
                                  Read more
                                </a>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmazonReviews;

