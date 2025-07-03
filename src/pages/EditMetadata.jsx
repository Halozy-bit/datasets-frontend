import { useEffect, useState } from "react";
import { getMetadata, updateMetadata } from "../api/datasets";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EditMetadata() {
  const { name } = useParams();
  const { auth } = useAuth();
  const [form, setForm] = useState({
    description: "",
    tags: "",
    visibility: "public",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await getMetadata(name);
        const meta = res.data[0];
        setForm({
          description: meta.description || "",
          tags: (meta.tags || []).join(", "),
          visibility: meta.visibility || "public",
        });
      } catch (err) {
        setError("Failed to load metadata.");
      }
    };
    fetchMetadata();
  }, [name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await updateMetadata(name, form, auth);
      navigate(`/dataset/${name}`);
    } catch (err) {
      setError("Failed to update metadata");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800">📝 Edit Metadata</h2>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Dataset description"
            value={form.description}
            onChange={handleChange}
            required
            className="resize-none"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-xs text-gray-400">(comma separated)</span>
          </label>
          <Input
            id="tags"
            name="tags"
            placeholder="e.g. climate, solar, energy"
            value={form.tags}
            onChange={handleChange}
            required
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
