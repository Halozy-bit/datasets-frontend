import { useState } from "react";
import { uploadDataset } from "../api/datasets";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UploadDataset() {
  const { auth } = useAuth();
  const [form, setForm] = useState({
    name: "",
    tags: "",
    source: "",
    description: "",
    license: "cc-by",
    visibility: "public",
    file: null,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const data = new FormData();
    for (const key in form) {
      data.append(key, form[key]);
    }

    try {
      await uploadDataset(data, auth);
      navigate("/");
    } catch (err) {
      setError("Failed to upload dataset");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800">📤 Upload Dataset</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Dataset Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Solar Power Data"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-xs text-gray-400">(comma separated)</span>
          </label>
          <Input
            id="tags"
            name="tags"
            placeholder="e.g. solar, climate"
            value={form.tags}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <Input
            id="source"
            name="source"
            placeholder="e.g. PLN, BPPT"
            value={form.source}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the dataset..."
            value={form.description}
            onChange={handleChange}
            required
            className="resize-none"
          />
        </div>

        <div>
          <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">
            License
          </label>
          <Input
            id="license"
            name="license"
            placeholder="e.g. cc-by"
            value={form.license}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="public">🌍 Public</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Upload File (.csv only)
          </label>
          <Input
            id="file"
            name="file"
            type="file"
            accept=".csv"
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full">
          Upload Dataset
        </Button>
      </form>
    </div>
  );
}
