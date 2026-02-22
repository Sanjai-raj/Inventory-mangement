import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

const Stock = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [stockRes, productsRes] = await Promise.all([
                api.get('/stock/read.php'),
                api.get('/products/read.php')
            ]);

            const stockData = stockRes.data.data || [];
            const productsData = productsRes.data.data || [];

            // Merge stock quantity into products
            const merged = productsData.map(product => {
                const stockItem = stockData.find(s => s.product_id === product.id);
                return {
                    ...product,
                    quantity: stockItem ? stockItem.quantity : 0,
                    stock_id: stockItem ? stockItem.id : null,
                    last_updated: stockItem ? stockItem.last_updated : null
                };
            });

            setItems(merged);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await api.post('/products/delete.php', { id });
                fetchData(); // Refresh list
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product");
            }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div>Loading stock...</div>;

    return (
        <div>
            <div className="flex flex-col justify-between mb-6 md:flex-row md:items-center">
                <h1 className="text-3xl font-semibold text-gray-800">Stock Management</h1>
                <button className="flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 md:mt-0">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
                <div className="relative">
                    <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow-md">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Product Name</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Category</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Quantity</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Unit Price</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{item.category || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${parseInt(item.quantity) < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {item.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">${item.unit_price}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No products found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Stock;
