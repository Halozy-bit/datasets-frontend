import { useEffect, useState } from "react";
import { getAllDatasets, getPublicDatasets, deleteDataset } from "../api/datasets";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DatasetList() {
  const { auth } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = auth ? await getAllDatasets(auth) : await getPublicDatasets();
        setDatasets(res.data);
      } catch (err) {
        setAlert({ type: "error", message: "Failed to load datasets" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth, refresh]);

  const handleDelete = async (name) => {
    const confirm = window.confirm("Delete this dataset?");
    if (!confirm) return;

    try {
      await deleteDataset(name, auth);
      setAlert({ type: "success", message: "Dataset deleted" });
      setRefresh((r) => r + 1);
    } catch (err) {
      setAlert({ type: "error", message: "You are not authorized to delete this dataset." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Dataset List</h1>
        {auth && (
          <Link to="/upload">
            <Button>Add Dataset</Button>
          </Link>
        )}
      </div>

      {alert && (
        <Alert variant={alert.type === "error" ? "destructive" : "default"} className="mb-4">
          {alert.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading datasets...
        </div>
      ) : datasets.length === 0 ? (
        <p className="text-center text-gray-500">No datasets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {datasets.map((ds) => (
            <div key={ds.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
              <div className="mb-3">
                <Link
                  to={`/dataset/${ds.name.toLowerCase().replace(/ /g, "_")}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {ds.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{ds.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Tags: {ds.tags?.join(", ") || "-"} | Visibility: {ds.visibility}
                </p>
              </div>

              {auth && (
                <div className="flex justify-end gap-2 mt-2">
                  <Link to={`/edit/${ds.name.toLowerCase().replace(/ /g, "_")}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(ds.name.toLowerCase().replace(/ /g, "_"))}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
