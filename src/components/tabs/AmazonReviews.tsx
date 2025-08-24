import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Store, Tag } from "lucide-react";
import { useCSVData } from "@/hooks/useCSVData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
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
  Brand: string;
  "Star Rating": number;
  "Number of Ratings": number;
  "Product URL": string;
  "Product Photo": string;
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
  brand: string;
  starRating: number;
  numberOfRatings: number;
  url: string;
  photo: string;
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

const AmazonReviews = () => {
  const { data: productRaw, loading: productsLoading, error: productsError } = useCSVData<ProductRow>("/consolidated_products.csv");
  const { data: reviewRaw, loading: reviewsLoading, error: reviewsError } = useCSVData<ReviewRow>("/consolidated_reviews.csv");

  const { products, brandStats, ratingDistribution, topProducts } = useMemo(() => {
    const prodRows = (productRaw as ProductRow[]).map(p => {
      const price = typeof p.Price === "number" ? p.Price : parseFloat(String(p.Price).replace(/[$,]/g, ""));
      const originalPrice = p["Original Price"] ? parseFloat(String(p["Original Price"]).replace(/[$,]/g, "")) : null;
      const brand = p.Brand.replace(/^Visit the\s+(.*?)\s+Store$/i, "$1").trim();
      return {
        asin: p.ASIN,
        title: p["Product Title"],
        price,
        originalPrice,
        brand,
        starRating: Number(p["Star Rating"]),
        numberOfRatings: Number(p["Number of Ratings"]),
        url: p["Product URL"],
        photo: p["Product Photo"],
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

    const ratingCounts = [1, 2, 3, 4, 5].map(r => ({ rating: r, count: reviews.filter(rv => Number(rv.Rating) === r).length }));

    const topProducts = [...products]
      .filter(p => p.reviewCount > 0)
      .sort((a, b) => (b.avgReviewRating! - a.avgReviewRating!))
      .slice(0, 5);

    return { products, brandStats, ratingDistribution: ratingCounts, topProducts };
  }, [productRaw, reviewRaw]);

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
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandStats.map(b => (
              <Card
                key={b.brand}
                className="border border-border shadow-gentle rounded-xl bg-gradient-to-br from-background to-muted/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{b.brand}</CardTitle>
                  </div>
                  <CardDescription>{b.productCount} products</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Avg Price</dt>
                    <dd className="text-right font-medium">${b.avgPrice.toFixed(2)}</dd>
                    <dt className="text-muted-foreground">Avg Discount</dt>
                    <dd className="text-right font-medium">{b.avgDiscount.toFixed(1)}%</dd>
                    <dt className="text-muted-foreground">Avg Rating</dt>
                    <dd className="text-right font-medium">{b.avgRating.toFixed(2)}</dd>
                    <dt className="text-muted-foreground">Ratings</dt>
                    <dd className="text-right font-medium">{formatNumber(b.totalReviews)}</dd>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Avg Discount %</TableHead>
                <TableHead className="text-right">Avg Rating</TableHead>
                <TableHead className="text-right">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandStats.map(b => (
                <TableRow key={b.brand}>
                  <TableCell>{b.brand}</TableCell>
                  <TableCell className="text-right">${b.avgPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{b.avgDiscount.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{b.avgRating.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatNumber(b.totalReviews)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="price" name="Price" unit="$" />
                <YAxis type="number" dataKey="starRating" name="Rating" domain={[0, 5]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={products} fill="#EA899A" />
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#EA899A" />
              </BarChart>
            </ResponsiveContainer>
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
                  <img src={p.photo} alt={p.title} className="w-full h-40 object-cover" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <CardTitle className="text-sm line-clamp-2">{p.title}</CardTitle>
                  <CardDescription>{p.brand}</CardDescription>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${p.price.toFixed(2)}</span>
                    {p.originalPrice && (
                      <>
                        <span className="text-sm line-through text-muted-foreground">${p.originalPrice.toFixed(2)}</span>
                        <Badge variant="secondary">
                          {(((p.originalPrice - p.price) / p.originalPrice) * 100).toFixed(0)}% off
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ⭐ {(p.avgReviewRating ?? p.starRating).toFixed(2)} ({formatNumber(p.reviewCount || p.numberOfRatings)})
                  </div>
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

