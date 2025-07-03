import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSampleData, getMetadata, downloadDataset } from "../api/datasets";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DatasetDetail() {
  const { name: collection_name } = useParams();
  const [sample, setSample] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const handleDownload = async () => {
    try {
      const res = await downloadDataset(collection_name);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${collection_name}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setAlert({ type: "error", message: "Failed to download dataset." });
    }
  };

  useEffect(() => {
    setLoading(true);
    setAlert(null);
    Promise.all([
      getSampleData(collection_name).then((r) => r.data),
      getMetadata(collection_name).then((r) => r.data),
    ])
      .then(([sampleData, metaData]) => {
        setSample(sampleData);
        setMeta(metaData.length ? metaData[0] : {});
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setAlert({ type: "error", message: "Failed to load dataset details. Please try again." });
      })
      .finally(() => setLoading(false));
  }, [collection_name]);

  const sampleColumns = sample.length > 0 ? Object.keys(sample[0]) : [];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!meta || Object.keys(meta).length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Dataset not found or no metadata available.</p>
        <Link to="/" className="text-blue-600 underline mt-4 block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6 px-0">
        <Link to="/" className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Datasets
        </Link>
      </Button>

      {alert && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8 p-4 md:p-6 lg:p-8">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-bold break-words">{meta.name}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 p-0 text-sm">
          {meta.tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Tags:</span>
              {meta.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
          <div><span className="font-semibold">Source:</span> {meta.source || "N/A"}</div>
          <div><span className="font-semibold">License:</span> {meta.license || "N/A"}</div>
          <div><span className="font-semibold">Visibility:</span> {meta.visibility || "N/A"}</div>
          {meta.size_mb !== undefined && (
            <div><span className="font-semibold">Size:</span> {meta.size_mb.toFixed(2)} MB</div>
          )}
          {meta.format && (
            <div><span className="font-semibold">Format:</span> {meta.format}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6 px-0 pb-0">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            Download
          </Button>
        </CardFooter>
      </Card>

      <h2 className="text-xl font-bold mb-4">Sample Data</h2>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {sampleColumns.map((k) => (
                <TableHead key={k} className="text-left whitespace-nowrap">
                  {k}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sample.length > 0 ? (
              sample.map((row, i) => (
                <TableRow key={i}>
                  {sampleColumns.map((col, j) => (
                    <TableCell key={j} className="whitespace-nowrap">
                      {String(row[col])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={sampleColumns.length} className="h-24 text-center text-muted-foreground">
                  No sample data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
