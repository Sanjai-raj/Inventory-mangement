import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        unit_price: '',
        quantity: '0' // Only for create mode or specifically handled
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            // If passed via state, use it
            if (location.state?.product) {
                const p = location.state.product;
                setFormData({
                    name: p.name,
                    category: p.category,
                    description: p.description,
                    unit_price: p.unit_price,
                    quantity: p.quantity // Display only, or update via stock API?
                });
            } else {
                // Fallback: fetch all and find (since read_single doesn't exist)
                fetchProductFallback();
            }
        }
    }, [isEditMode, location.state]);

    const fetchProductFallback = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products/read.php');
            const product = res.data.data.find(p => p.id == id);
            if (product) {
                setFormData({
                    name: product.name,
                    category: product.category,
                    description: product.description,
                    unit_price: product.unit_price,
                    quantity: '0' // We don't get stock quantity easily here without merging
                });
            } else {
                setError("Product not found");
            }
        } catch (err) {
            setError("Failed to fetch product details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                await api.post('/products/update.php', {
                    id,
                    name: formData.name,
                    category: formData.category,
                    description: formData.description,
                    unit_price: formData.unit_price
                });
                alert("Product updated successfully!");
                navigate('/admin/stock');
            } else {
                await api.post('/products/create.php', {
                    name: formData.name,
                    category: formData.category,
                    description: formData.description,
                    unit_price: formData.unit_price
                });
                alert("Product created successfully!");
                navigate('/admin/stock');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/admin/stock')}
                className="flex items-center mb-6 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Stock
            </button>

            <div className="p-8 bg-white rounded-lg shadow-md">
                <h1 className="mb-6 text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>

                {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block mb-2 text-sm font-bold text-gray-700">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold text-gray-700">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold text-gray-700">Unit Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="unit_price"
                                value={formData.unit_price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block mb-2 text-sm font-bold text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
