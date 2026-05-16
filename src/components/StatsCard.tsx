"use client";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-green-50 text-green-600 border-green-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  red: "bg-red-50 text-red-600 border-red-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

export function StatsCard({ icon, label, value, trend, color = "blue" }: StatsCardProps) {
  return (
    <div className={`rounded-xl p-5 border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
