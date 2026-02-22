import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, PlusCircle, FileText } from 'lucide-react';
import api from '../../services/api';

const EmployeeDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        myExpenses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [stockRes, expensesRes] = await Promise.all([
                    api.get('/stock/read.php'),
                    api.get('/expenses/read.php') // Filter by user ID if backend supports it
                ]);

                const stock = stockRes.data.data || [];
                // For now assuming all expenses are visible or backend filters them
                // Ideally backend should return only expenses for this user
                // Let's assume frontend filtering for "My Expenses" if user ID was available in expense record
                const expenses = expensesRes.data.data || [];

                // Get current user to filter expenses
                const user = JSON.parse(localStorage.getItem("user"));
                const myExpenses = expenses.filter(e => e.employee_id === user.id);

                setStats({
                    totalProducts: stock.length,
                    lowStock: stock.filter(item => parseInt(item.quantity) < 10).length,
                    myExpenses: myExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
                });

            } catch (error) {
                console.error("Error fetching employee dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="mb-6 text-3xl font-semibold text-gray-800">Employee Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Products</p>
                            <h2 className="text-3xl font-bold">{stats.totalProducts}</h2>
                        </div>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Low Stock Alerts</p>
                            <h2 className="text-3xl font-bold">{stats.lowStock}</h2>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">My Expenses</p>
                            <h2 className="text-3xl font-bold">${stats.myExpenses.toLocaleString()}</h2>
                        </div>
                        <FileText className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-gray-700">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link to="/employee/stock" className="flex items-center p-4 transition bg-white rounded-lg shadow hover:bg-gray-50">
                        <PlusCircle className="mr-3 text-blue-600" />
                        <span className="font-semibold text-gray-700">Add Stock</span>
                    </Link>
                    <Link to="/employee/expenses" className="flex items-center p-4 transition bg-white rounded-lg shadow hover:bg-gray-50">
                        <PlusCircle className="mr-3 text-green-600" />
                        <span className="font-semibold text-gray-700">Record Expense</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
