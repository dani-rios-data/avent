import { useState, useEffect } from "react";
import Papa from "papaparse";

interface DataRow {
  "month-year": string;
  year: string;
  advertiser: string;
  "brand root": string;
  "category level 2": string;
  "category level 3": string;
  "category level 8": string;
  channel: string;
  placement: string;
  publisher: string;
  impressions: number;
  "spend (usd)": number;
}

export const useCSVData = (csvPath: string) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${csvPath}: ${response.statusText}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transform: (value, header) => {
            // Convert numeric columns
            if (header === "impressions" || header === "spend (usd)") {
              return parseFloat(value) || 0;
            }
            return value;
          },
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
            }
            setData(results.data as DataRow[]);
            setLoading(false);
          },
          error: (error) => {
            setError(`CSV parsing error: ${error.message}`);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, [csvPath]);

  return { data, loading, error };
};