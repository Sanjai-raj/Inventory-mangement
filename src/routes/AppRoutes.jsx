import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/common/Layout';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import AdminDashboard from '../pages/admin/Dashboard';
import Employees from '../pages/admin/Employees'; // Import Employees
import EmployeeDashboard from '../pages/employee/Dashboard';
import Stock from '../pages/admin/Stock';
import ProductForm from '../pages/admin/ProductForm';
import Reports from '../pages/admin/Reports';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<Layout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="employees" element={<Employees />} /> {/* Added */}
                    <Route path="stock" element={<Stock />} />
                    <Route path="stock/add" element={<ProductForm />} />
                    <Route path="stock/edit/:id" element={<ProductForm />} />
                    <Route path="expenses" element={<div>Expense Tracking</div>} />
                    <Route path="reports" element={<Reports />} />
                </Route>
            </Route>

            {/* Employee Routes */}
            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                <Route path="/employee" element={<Layout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="products" element={<div>Products List</div>} />
                    <Route path="stock" element={<div>Stock Management</div>} />
                    <Route path="expenses" element={<div>Expense Tracking</div>} />
                    <Route path="reports" element={<div>Reports (Restricted)</div>} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
