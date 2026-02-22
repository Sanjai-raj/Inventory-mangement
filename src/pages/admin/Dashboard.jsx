import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStock: 0,
        lowStock: 0,
        totalExpenses: 0,
        employeeCount: 0
    });
    const [loading, setLoading] = useState(true);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch basic stats
                const [stockRes, expensesRes, employeesRes] = await Promise.all([
                    api.get('/stock/read.php'),
                    api.get('/expenses/read.php'),
                    api.get('/employees/read.php')
                ]);

                const stock = stockRes.data.data || [];
                const expenses = expensesRes.data.data || [];
                const employees = employeesRes.data.data || [];

                setStats({
                    totalStock: stock.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0),
                    lowStock: stock.filter(item => parseInt(item.quantity) < 10).length,
                    totalExpenses: expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
                    employeeCount: employees.length
                });

                // Prepare chart data (Mock trend for now as we lack historical data endpoint)
                setChartData({
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Monthly Expenses',
                            data: [1200, 1900, 3000, 500, 2000, 3000], // Mock data
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        },
                        {
                            label: 'Stock Inflow',
                            data: [500, 600, 400, 700, 800, 750], // Mock data
                            borderColor: 'rgb(53, 162, 235)',
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Semester Overview',
            },
        },
    };

    return (
        <div>
            <h1 className="mb-6 text-3xl font-semibold text-gray-800">Admin Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
                    <h3 className="text-gray-500 text-md">Total Stock Items</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalStock}</p>
                </div>
                <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
                    <h3 className="text-gray-500 text-md">Low Stock Alerts</h3>
                    <p className="mt-2 text-3xl font-bold text-red-600">{stats.lowStock}</p>
                </div>
                <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
                    <h3 className="text-gray-500 text-md">Total Expenses</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600">${stats.totalExpenses.toLocaleString()}</p>
                </div>
                <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
                    <h3 className="text-gray-500 text-md">Active Employees</h3>
                    <p className="mt-2 text-3xl font-bold text-purple-600">{stats.employeeCount}</p>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default AdminDashboard;
