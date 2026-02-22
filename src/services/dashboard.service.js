import api from './api';

const DashboardService = {
    getStats: async () => {
        // checks for an aggregate endpoint, otherwise we might need to orchestrate multiple calls
        // For now, let's assume we can get high-level stats from dedicated endpoints or list endpoints
        try {
            const [stockRes, expensesRes, employeesRes] = await Promise.all([
                api.get('/stock/read.php'), // Assuming this returns list of stock
                api.get('/expenses/read.php'),
                api.get('/employees/read.php')
            ]);
            
            // Calculate stats on frontend if backend doesn't provide summary
            // This is a temporary measure until dedicated dashboard endpoints are added
            return {
                totalStock: stockRes.data.data ? stockRes.data.data.length : 0,
                lowStock: stockRes.data.data ? stockRes.data.data.filter(i => i.quantity < 10).length : 0,
                totalExpenses: expensesRes.data.data ? expensesRes.data.data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0) : 0,
                employeeCount: employeesRes.data.data ? employeesRes.data.data.length : 0
            };
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
            throw error;
        }
    },
    
    getStockTrends: async () => {
        // Mocking this for now as we likely don't have historical data endpoint yet
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Stock Levels',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        };
    }
};

export default DashboardService;
