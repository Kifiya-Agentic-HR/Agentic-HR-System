"use client";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  FileCheck,
  FileX,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import {
  Bar,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Cell,
  BarChart,
  LineChart,
} from "recharts";

const stats = [
  {
    title: "Total Applications",
    value: "2,345",
    icon: <Users className="w-6 h-6 text-[#364957]" />,
  },
  {
    title: "Job Posts",
    value: "45",
    icon: <Briefcase className="w-6 h-6 text-[#FF8A00]" />,
  },
  {
    title: "Screened Passed",
    value: "1,234",
    icon: <FileCheck className="w-6 h-6 text-[#364957]" />,
  },
  {
    title: "Screened Failed",
    value: "1,111",
    icon: <FileX className="w-6 h-6 text-[#FF8A00]" />,
  },
];

const genderData = [
  { name: "Female", value: 65 },
  { name: "Male", value: 35 },
];

const screeningData = [
  { month: "Jan", passed: 4000, failed: 2400 },
  { month: "Feb", passed: 3000, failed: 1398 },
  { month: "Mar", passed: 2000, failed: 9800 },
];

const genderConfig = {
  female: {
    label: "Female",
    color: "hsl(var(--chart-1))",
  },
  male: {
    label: "Male",
    color: "hsl(var(--chart-2))",
  },
} as const;

const screeningConfig = {
  passed: {
    label: "Passed",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-2))",
  },
} as const;

export default function Dashboard() {
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="p-8 space-y-8 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-[#364957]/10 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 bg-[#364957]/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-[#364957]/20 hover:border-[#364957]/40 transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#364957]">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#364957]">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Pie Chart */}
        <Card className="border-[#364957]/20 p-6">
          <h3 className="text-xl font-semibold text-[#364957] mb-6">
            Applicants by Gender
          </h3>
          <ChartContainer config={genderConfig} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={`var(--color-${entry.name.toLowerCase()})`}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Screening Results Bar Chart */}
        <Card className="border-[#364957]/20 p-6">
          <h3 className="text-xl font-semibold text-[#364957] mb-6">
            Screening Results
          </h3>
          <ChartContainer config={screeningConfig} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={screeningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#36495730" />
                <XAxis dataKey="month" stroke="#364957" />
                <YAxis stroke="#364957" />
                <Bar dataKey="passed" fill="var(--color-passed)" radius={4} />
                <Bar dataKey="failed" fill="var(--color-failed)" radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Interview Results Line Chart */}
        <Card className="border-[#364957]/20 p-6">
          <h3 className="text-xl font-semibold text-[#364957] mb-6">
            Interview Results
          </h3>
          <ChartContainer config={screeningConfig} className="min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={screeningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#36495730" />
                <XAxis dataKey="month" stroke="#364957" />
                <YAxis stroke="#364957" />
                <Line
                  type="monotone"
                  dataKey="passed"
                  stroke="var(--color-passed)"
                  strokeWidth={2}
                  dot={{ fill: "#364957", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="var(--color-failed)"
                  strokeWidth={2}
                  dot={{ fill: "#FF8A00", strokeWidth: 2 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="border-[#364957]/20 p-6">
          <h3 className="text-xl font-semibold text-[#364957] mb-6">
            Application Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[#364957]">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#364957]" />
                <span>Interview Passed</span>
              </div>
              <span className="font-bold">850</span>
            </div>
            <div className="flex items-center justify-between text-[#FF8A00]">
              <div className="flex items-center gap-2">
                <CalendarX className="w-5 h-5 text-[#FF8A00]" />
                <span>Interview Failed</span>
              </div>
              <span className="font-bold">150</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
