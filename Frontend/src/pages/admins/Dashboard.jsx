import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { getDashboardData } from "../../api/dashboardApi";
import KPICard from "../../components/admins/KPICard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faChartLine,
  faPieChart,
  faBarChart,
  faTrophy,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardData();
      setData(res.data);
      setError("");
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return null; // Global overlay will handle the UI
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: "#94a3b8", font: { family: "'Inter', sans-serif" } } },
      y: { grid: { color: "#f1f5f9", drawBorder: false, borderDash: [5, 5] }, border: { display: false }, ticks: { color: "#94a3b8", font: { family: "'Inter', sans-serif" } } },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: "#94a3b8", font: { family: "'Inter', sans-serif" } } },
      y: { grid: { color: "#f1f5f9", drawBorder: false, borderDash: [5, 5] }, border: { display: false }, ticks: { color: "#94a3b8", font: { family: "'Inter', sans-serif" } } },
    },
  };

  const topProductsOptions = {
    ...commonOptions,
    indexAxis: "y",
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { display: false } },
      y: { grid: { display: false }, border: { display: false }, ticks: { color: "#64748b", font: { family: "'Inter', sans-serif", weight: '600' } } },
    },
  };

  const lineData = {
    labels: data?.charts?.line?.labels || [],
    datasets: [
      {
        label: "Monthly Sales",
        data: data?.charts?.line?.data || [],
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.05)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#14b8a6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const pieData = {
    labels: data?.charts?.pie?.labels || [],
    datasets: [
      {
        data: data?.charts?.pie?.data || [],
        backgroundColor: [
          "#14b8a6",
          "#60a5fa",
          "#f59e0b",
          "#f87171",
          "#a855f7",
          "#ec4899",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const barData = {
    labels: data?.charts?.bar?.labels || [],
    datasets: [
      {
        label: "Revenue",
        data: data?.charts?.bar?.data || [],
        backgroundColor: "#14b8a6",
        borderRadius: { topLeft: 6, topRight: 6 },
        maxBarThickness: 40,
        hoverBackgroundColor: "#0f766e",
      },
    ],
  };

  const topProductsChart = {
    labels: data?.charts?.topProducts?.labels || [],
    datasets: [
      {
        label: "Sold Items",
        data: data?.charts?.topProducts?.data || [],
        backgroundColor: "rgba(20,184,166,0.8)",
        borderRadius: 6,
        maxBarThickness: 32,
        hoverBackgroundColor: "#14b8a6",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
      {error && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <FontAwesomeIcon icon={faBox} className="opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <FontAwesomeIcon icon={faBox} className="opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Found</h2>
            <p className="text-gray-500">There is currently no dashboard data available to display.</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {data.kpis.map((kpi, index) => (
          <KPICard key={index} title={kpi.title} value={kpi.value} desc={kpi.desc} breakdown={kpi.breakdown} today={kpi.today} />
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* LINE */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-teal-500" />
                Monthly Sales
              </h3>
              <p className="text-xs text-gray-500">
                Revenue performance tracking over the last 6 months
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/reports/sales")}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-[#087467] bg-emerald-50 hover:bg-[#087467] hover:text-white rounded-lg transition-all uppercase tracking-wider"
            >
              <span>View Sales Report</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            {data?.charts?.line?.data?.length > 0 ? (
              <Line id="monthly-sales-chart" data={lineData} options={lineOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md border border-dashed border-gray-200">
                <FontAwesomeIcon icon={faBox} className="text-gray-300 text-3xl mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* PIE */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faPieChart} className="text-blue-500" />
                Categories
              </h3>
              <p className="text-xs text-gray-500">
                Product count across categories
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/reports/products")}
              className="p-2 text-[#087467] bg-emerald-50 hover:bg-[#087467] hover:text-white rounded-lg transition-all"
              title="View Product Report"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            {data?.charts?.pie?.data?.length > 0 ? (
              <Doughnut id="categories-pie-chart" data={pieData} options={commonOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md border border-dashed border-gray-200">
                <FontAwesomeIcon icon={faBox} className="text-gray-300 text-3xl mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* BAR - Revenue */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faBarChart}
                  className="text-orange-500"
                />
                Weekly Revenue
              </h3>
              <p className="text-xs text-gray-500">
                Daily income breakdown for the past 7 days
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/reports/sales")}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-[#087467] bg-emerald-50 hover:bg-[#087467] hover:text-white rounded-lg transition-all uppercase tracking-wider"
            >
              <span>Full Report</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="h-[300px] w-full mt-auto">
            {data?.charts?.bar?.data?.length > 0 ? (
              <Bar id="revenue-bar-chart" data={barData} options={barOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md border border-dashed border-gray-200">
                <FontAwesomeIcon icon={faBox} className="text-gray-300 text-3xl mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
                Top Products
              </h3>
              <p className="text-xs text-gray-500">
                Highest performing menu items by volume
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/reports/products")}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-[#087467] bg-emerald-50 hover:bg-[#087467] hover:text-white rounded-lg transition-all uppercase tracking-wider"
            >
              <span>View Insights</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="h-[300px] w-full mt-auto">
            {data?.charts?.topProducts?.data?.length > 0 ? (
              <Bar
                id="top-products-bar-chart"
                data={topProductsChart}
                options={topProductsOptions}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md border border-dashed border-gray-200">
                <FontAwesomeIcon icon={faBox} className="text-gray-300 text-3xl mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE LAST */}
        </>
      )}
    </div>
  );
}
