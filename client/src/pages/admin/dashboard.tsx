import { useQuery } from "@tanstack/react-query";
import RoleNav from "@/components/ui/role-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { Loader2 } from "lucide-react";

const BORDER_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <RoleNav />
        <main className="flex-1 p-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <RoleNav />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Statistics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Applications by Gender</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.genderStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="transparent"
                    stroke="none"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats?.genderStats.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`${BORDER_COLORS[index % BORDER_COLORS.length]}20`}
                        stroke={BORDER_COLORS[index % BORDER_COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend 
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>CV Screening Results</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.screeningStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="rgba(0, 136, 254, 0.1)"
                    stroke="#0088FE"
                    strokeWidth={2}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle>Interview Results</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.interviewStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="rgba(0, 196, 159, 0.1)"
                    stroke="#00C49F"
                    strokeWidth={2}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}