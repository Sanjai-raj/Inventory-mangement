import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Package,
    Boxes,
    Receipt,
    FileBarChart,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/employees', label: 'Employees', icon: Users },
        { path: '/admin/stock', label: 'Stock', icon: Boxes },
        { path: '/admin/expenses', label: 'Expenses', icon: Receipt },
        { path: '/admin/reports', label: 'Reports', icon: FileBarChart },
    ];

    const employeeLinks = [
        { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/employee/products', label: 'Products', icon: Package },
        { path: '/employee/stock', label: 'Stock', icon: Boxes },
        { path: '/employee/expenses', label: 'Expenses', icon: Receipt },
        { path: '/employee/reports', label: 'Reports', icon: FileBarChart },
    ];

    const links = user.role === 'admin' ? adminLinks : employeeLinks;

    return (
        <div className="flex flex-col w-64 h-screen text-white bg-gray-800">
            <div className="flex items-center justify-center h-20 shadow-md">
                <h1 className="text-2xl font-bold uppercase">IMS {user.role}</h1>
            </div>
            <ul className="flex flex-col py-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${isActive ? 'bg-gray-700 text-white' : ''}`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
                <li className="mt-auto">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-6 py-3 text-red-400 hover:bg-gray-700 hover:text-red-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
