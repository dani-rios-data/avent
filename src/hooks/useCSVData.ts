import { useState, useEffect } from "react";
import Papa from "papaparse";

export const useCSVData = <T = Record<string, unknown>>(csvPath: string) => {
  const [data, setData] = useState<T[]>([]);
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
        
        Papa.parse<T>(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
            }
            setData(results.data as T[]);
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
