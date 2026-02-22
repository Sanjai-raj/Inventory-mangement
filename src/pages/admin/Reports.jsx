import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, AlertTriangle } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [reportType, setReportType] = useState('sales');
    const [loading, setLoading] = useState(true);
    const [anomalies, setAnomalies] = useState([]);

    const [salesData, setSalesData] = useState({
        labels: [],
        datasets: []
    });

    const [forecastData, setForecastData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [forecastRes, anomaliesRes, expensesRes] = await Promise.all([
                api.get('/analytics/forecast.php'),
                api.get('/analytics/anomalies.php'),
                api.get('/expenses/read.php')
            ]);

            // Process Forecast Data
            if (forecastRes.data.data && !forecastRes.data.data.error) {
                const forecast = forecastRes.data.data;
                setForecastData({
                    labels: forecast.map(f => f.date),
                    datasets: [
                        {
                            label: 'Predicted Demand (Units)',
                            data: forecast.map(f => f.predicted_demand),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderDash: [5, 5],
                            tension: 0.4
                        },
                    ],
                });
            }

            // Process Anomalies
            if (anomaliesRes.data.data) {
                setAnomalies(anomaliesRes.data.data);
            }

            // Process Sales/Expenses (Mocking sales as expenses for now or fetching real sales if available)
            // Using Expenses for the bar chart
            const expenses = expensesRes.data.data || [];
            // Group by month
            const expenseByMonth = expenses.reduce((acc, curr) => {
                const month = curr.expense_date.substring(0, 7); // YYYY-MM
                acc[month] = (acc[month] || 0) + parseFloat(curr.amount);
                return acc;
            }, {});

            setSalesData({
                labels: Object.keys(expenseByMonth).sort(),
                datasets: [
                    {
                        label: 'Monthly Expenses ($)',
                        data: Object.keys(expenseByMonth).sort().map(k => expenseByMonth[k]),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    },
                ],
            });

        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (format) => {
        alert(`Downloading ${reportType} report in ${format} format... (Feature coming soon)`);
    };

    if (loading) return <div>Loading Analytics...</div>;

    return (
        <div>
            <h1 className="mb-6 text-3xl font-semibold text-gray-800">Reports & Analytics</h1>

            <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-bold text-gray-700">Report Type</label>
                        <select
                            className="w-full px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="sales">Sales Performance</option>
                            <option value="stock">Stock Levels</option>
                            <option value="expenses">Expense Analysis</option>
                            <option value="forecast">Demand Forecasting (AI)</option>
                        </select>
                    </div>
                    <div>
                        <button
                            className="flex items-center px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
                            onClick={() => handleDownload('csv')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-xl font-bold text-gray-800">Historical Expenses</h2>
                    <Bar options={{ responsive: true }} data={salesData} />
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-xl font-bold text-gray-800">
                        AI Demand Forecasting (Next 7 Days)
                    </h2>
                    <p className="mb-4 text-sm text-gray-600">Based on recent consumption patterns.</p>
                    <Line options={{ responsive: true }} data={forecastData} />
                </div>
            </div>

            <div className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Anomaly Detection</h2>
                {anomalies.length > 0 ? (
                    <div className="space-y-4">
                        {anomalies.map((anomaly, index) => (
                            <div key={index} className="p-4 text-orange-700 bg-orange-100 border-l-4 border-orange-500 rounded flex items-start" role="alert">
                                <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Expense Anomaly Detected</p>
                                    <p>Unusual expense of <strong>${anomaly.amount}</strong> for "{anomaly.title}" on {anomaly.date}. (Z-Score: {anomaly.score.toFixed(2)})</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
                        <p>No anomalies detected in recent expenses.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
