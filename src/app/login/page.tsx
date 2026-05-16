"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { LoadingSpinner } from "@/components/Loading";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      showToast("Welcome back!", "success");
      // Auth context will redirect
    } else {
      showToast(result.error || "Login failed", "error");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-500 mt-1">Sign in to your PropFind account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:text-primary-dark">
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 text-center mb-2 font-medium">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="bg-white rounded-lg p-2">
              <p className="font-medium">Admin</p>
              <p className="text-gray-400 truncate">samuel.adesanya1love@gmail.com</p>
              <p className="text-gray-400">admin123</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="font-medium">Agent</p>
              <p className="text-gray-400 truncate">marie.nguema@gmail.com</p>
              <p className="text-gray-400">agent123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
