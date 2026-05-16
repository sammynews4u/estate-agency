"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { LoadingSpinner } from "@/components/Loading";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, register } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (!agreed) {
      showToast("Please agree to the terms", "error");
      return;
    }

    setLoading(true);

    const result = await register({ name, email, phone, password });

    if (result.success) {
      showToast("Account created successfully!", "success");
      router.push("/dashboard");
    } else {
      showToast(result.error || "Registration failed", "error");
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
              <span className="text-3xl">🏠</span>
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-500 mt-1">
              Register as an agent to list properties
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                placeholder="Repeat password"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
              />
              <span className="text-sm text-gray-600">
                I agree that PropFind is a listing platform only and is not responsible for any transactions between users and agents.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:text-primary-dark">
              Sign In
            </Link>
          </p>
        </div>

        {/* Benefits reminder */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "♾️", label: "Unlimited Listings" },
            { icon: "💰", label: "Zero Commission" },
            { icon: "📱", label: "Direct Contact" },
          ].map((b, i) => (
            <div key={i} className="bg-white rounded-lg p-3 text-center border border-gray-100">
              <div className="text-xl">{b.icon}</div>
              <p className="text-xs text-gray-500 mt-1">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
