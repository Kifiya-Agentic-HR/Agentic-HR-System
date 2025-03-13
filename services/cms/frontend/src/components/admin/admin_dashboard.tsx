"use client";
import { useState, useEffect } from "react";
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
import { getJobs, getApplications } from "@/lib/api";

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          getJobs(),
          getApplications(),
        ]);

        if (jobsResponse.success && jobsResponse.jobs) {
          setJobs(jobsResponse.jobs);
        }
        if (applicationsResponse.success && applicationsResponse.applications) {
          setApplications(applicationsResponse.applications);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const totalApplications = applications.length;
  const jobPosts = jobs.length;
  const screenedPassed = applications.filter(
    (app) => app.screening?.score >= 5
  ).length;
  const screenedFailed = applications.filter(
    (app) => app.screening?.score < 5
  ).length;

  // Gender distribution
  const genderCounts = applications.reduce((acc, app) => {
    const gender = app.candidate.gender.toLowerCase();
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genderData = [
    { name: "Female", value: genderCounts.female || 0 },
    { name: "Male", value: genderCounts.male || 0 },
  ];

  // Screening data processing
  const screeningData = applications.reduce((acc, app) => {
    if (!app.screening) return acc;
    const date = new Date(app.created_at);
    const month = date.toLocaleString("default", { month: "short" });
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!acc[yearMonth]) {
      acc[yearMonth] = { month, passed: 0, failed: 0 };
    }

    app.screening.score >= 5
      ? acc[yearMonth].passed++
      : acc[yearMonth].failed++;
    return acc;
  }, {} as Record<string, { month: string; passed: number; failed: number }>);

  const screeningDataArray = Object.values(screeningData).sort(
    (a, b) =>
      new Date(a.month + " 1 2023").getMonth() -
      new Date(b.month + " 1 2023").getMonth()
  );

  // Interview data processing
  const interviewData = applications.reduce((acc, app) => {
    if (!app.interview?.hiring_decision) return acc;
    const interviewDate = app.interview.interview_date
      ? new Date(app.interview.interview_date)
      : new Date(app.interview.created_at);
    const month = interviewDate.toLocaleString("default", { month: "short" });
    const yearMonth = `${interviewDate.getFullYear()}-${
      interviewDate.getMonth() + 1
    }`;

    if (!acc[yearMonth]) {
      acc[yearMonth] = { month, passed: 0, failed: 0 };
    }

    app.interview.hiring_decision === "Hire"
      ? acc[yearMonth].passed++
      : acc[yearMonth].failed++;
    return acc;
  }, {} as Record<string, { month: string; passed: number; failed: number }>);

  const interviewDataArray = Object.values(interviewData).sort(
    (a, b) =>
      new Date(a.month + " 1 2023").getMonth() -
      new Date(b.month + " 1 2023").getMonth()
  );

  // Interview status counts
  const interviewPassed = applications.filter(
    (app) => app.interview?.hiring_decision === "Hire"
  ).length;
  const interviewFailed = applications.filter(
    (app) => app.interview?.hiring_decision === "No Hire"
  ).length;

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications.toString(),
      icon: <Users className="w-6 h-6 text-[#364957]" />,
    },
    {
      title: "Job Posts",
      value: jobPosts.toString(),
      icon: <Briefcase className="w-6 h-6 text-[#FF8A00]" />,
    },
    {
      title: "Screened Passed",
      value: screenedPassed.toString(),
      icon: <FileCheck className="w-6 h-6 text-[#364957]" />,
    },
    {
      title: "Screened Failed",
      value: screenedFailed.toString(),
      icon: <FileX className="w-6 h-6 text-[#FF8A00]" />,
    },
  ];

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
              <BarChart data={screeningDataArray}>
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
              <LineChart data={interviewDataArray}>
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
              <span className="font-bold">{interviewPassed}</span>
            </div>
            <div className="flex items-center justify-between text-[#FF8A00]">
              <div className="flex items-center gap-2">
                <CalendarX className="w-5 h-5 text-[#FF8A00]" />
                <span>Interview Failed</span>
              </div>
              <span className="font-bold">{interviewFailed}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
