import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import "../styles/AdminData.css";
const AdminData = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalConnections, setTotalConnections] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = async (
    url,
    setData,
    processData = (res) => res.data.count
  ) => {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(processData(res));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch some data. Please try again.");
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchData(
          "/api/v1/users/all-users-dash",
          setTotalUsers,
          (res) => res.data.count
        ),
        fetchData(
          "/api/v1/connections/all-users",
          setTotalConnections,
          (res) => res.data.count
        ),
        fetchData(
          "/api/v1/events/getallEvents",
          setTotalEvents,
          (res) => res.data.events.length
        ),
        fetchData("/api/v1/blogs", setTotalBlogs, (res) => res.data.results),
      ]);
      setLoading(false);
    };
    loadAllData();
  }, [token]);

  const overviewChartData = [
    { name: "Users", value: totalUsers },
    { name: "Connections", value: totalConnections },
    { name: "Events", value: totalEvents },
    { name: "Blogs", value: totalBlogs },
  ];

  const usersChartData = [{ name: "Users", value: totalUsers }];
  const connectionsChartData = [
    { name: "Connections", value: totalConnections },
  ];
  const eventsChartData = [{ name: "Events", value: totalEvents }];
  const blogsChartData = [{ name: "Blogs", value: totalBlogs }];

  const PIE_COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF19A0",
  ];

  if (loading) {
    return (
      <div className="admin-dashboard-loading">Loading dashboard data...</div>
    );
  }

  if (error) {
    return <div className="admin-dashboard-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="stats-cards-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Connections</h3>
          <p>{totalConnections}</p>
        </div>
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Blogs</h3>
          <p>{totalBlogs}</p>
        </div>
      </div>

      <div className="chart-section main-chart-section">
        <h2 className="chart-title">Overall Statistics</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={overviewChartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="small-charts-container">
        <div className="chart-card">
          <h3 className="chart-card-title">Users Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={usersChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#82ca9d"
                label
              >
                {usersChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">Connections Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={connectionsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ffc658"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">Events Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={eventsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">Blogs Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={blogsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminData;
