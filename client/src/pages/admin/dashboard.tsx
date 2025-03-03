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
} from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
          <Card>
            <CardHeader>
              <CardTitle>Applications by Gender</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart width={400} height={300}>
                <Pie
                  data={stats?.genderStats}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.genderStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CV Screening Results</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={400} height={300} data={stats?.screeningStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Results</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={400} height={300} data={stats?.interviewStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
