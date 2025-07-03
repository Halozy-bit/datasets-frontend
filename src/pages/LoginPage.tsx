import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { login as testLogin } from "../api/datasets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("default");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(null);

    try {
      const response = await testLogin(form.username, form.password);

      // Simpan auth di localStorage + context
      login(form.username, form.password, response.data.role);

      setAlertMessage("Login successful! Redirecting...");
      setAlertVariant("success");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error?.response?.status === 401
          ? "Username or password is incorrect."
          : "Login failed. Please try again.";
      setAlertMessage(msg);
      setAlertVariant("destructive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🔐 Login
        </h2>

        {alertMessage && (
          <Alert variant={alertVariant} className="text-sm">
            {alertVariant === "success" && <CheckCircle className="h-4 w-4" />}
            {alertVariant === "destructive" && <XCircle className="h-4 w-4" />}
            {alertVariant === "default" && <Info className="h-4 w-4" />}
            <AlertTitle>
              {alertVariant === "success"
                ? "Success!"
                : alertVariant === "destructive"
                ? "Error!"
                : "Info"}
            </AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <Input
            id="username"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 
                0 0 5.373 0 12h4zm2 5.291A7.962 
                7.962 0 014 12H0c0 3.042 1.135 
                5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </div>
  );
}
