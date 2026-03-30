import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy 
} from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Banner } from '../types';
import { uploadToTelegram, getFirebaseErrorMessage } from '../lib/utils';
import { useToast } from '../ToastContext';
import { 
  Plus, Trash2, Edit, Package, ShoppingBag, LogOut, 
  Upload, CheckCircle, Clock, Truck, Search, Image as ImageIcon,
  Printer, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'banners'>('products');
  const { showToast } = useToast();

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Logged in successfully', 'success');
    } catch (error) {
      showToast(getFirebaseErrorMessage(error), 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl"
        >
          <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loginLoading}
              type="submit" 
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium"
          >
            <LogOut size={20} /> Logout
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'products' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package size={20} /> Products
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={20} /> Orders
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'banners' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ImageIcon size={20} /> Banners
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'products' ? <ProductManager /> : activeTab === 'orders' ? <OrderManager /> : <BannerManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const initialFormState: Partial<Product> = {
    name: '',
    price: undefined,
    discountPrice: undefined,
    brand: '',
    category: 'Smartphones',
    shortSpecs: '',
    fullSpecs: '',
    stockStatus: 'In Stock',
    isFeatured: false
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchProducts = async () => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      brand: product.brand,
      category: product.category || 'Smartphones',
      shortSpecs: product.shortSpecs,
      fullSpecs: product.fullSpecs,
      stockStatus: product.stockStatus,
      isFeatured: product.isFeatured || false
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile && !editingProduct) {
      showToast('Please select an image', 'error');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingProduct?.image || '';
      
      if (imageFile) {
        const caption = `📱 *${formData.name}*\n💰 Price: ৳${formData.price}`;
        imageUrl = await uploadToTelegram(imageFile, caption);
      }

      const productData = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price) || 0,
        discountPrice: Number(formData.discountPrice) || 0,
        isFeatured: formData.isFeatured || false,
        updatedAt: Date.now()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id!), productData);
        showToast('Product updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: Date.now()
        });
        showToast('Product added successfully', 'success');
      }

      setIsAdding(false);
      setEditingProduct(null);
      setFormData(initialFormState);
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      showToast(editingProduct ? 'Failed to update product' : 'Failed to add product', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Manage Products'}</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditingProduct(null);
              setFormData(initialFormState);
            }
          }}
          className={`${isAdding ? 'bg-gray-500' : 'bg-green-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
        >
          {isAdding ? 'Cancel' : <><Plus size={20} /> Add New Product</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input required type="text" className="w-full p-3 border border-gray-200 rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Regular Price (৳)</label>
                  <input required type="number" className="w-full p-3 border border-gray-200 rounded-xl" value={formData.price ?? ''} onChange={e => setFormData({...formData, price: e.target.value === '' ? undefined : Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Price (৳) - Optional</label>
                  <input type="number" className="w-full p-3 border border-gray-200 rounded-xl" value={formData.discountPrice ?? ''} onChange={e => setFormData({...formData, discountPrice: e.target.value === '' ? undefined : Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input 
                    required 
                    type="text" 
                    list="brands-list"
                    className="w-full p-3 border border-gray-200 rounded-xl" 
                    placeholder="e.g. Apple, Samsung, Tecno..."
                    value={formData.brand} 
                    onChange={e => setFormData({...formData, brand: e.target.value})} 
                  />
                  <datalist id="brands-list">
                    {['Apple', 'Samsung', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Tecno', 'Infinix', 'Itel', 'Honor'].map(b => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input 
                    required 
                    type="text" 
                    list="categories-list"
                    className="w-full p-3 border border-gray-200 rounded-xl" 
                    placeholder="e.g. Smartphones, Accessories, Gadgets..."
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                  />
                  <datalist id="categories-list">
                    {['Smartphones', 'Tablets', 'Accessories', 'Laptops', 'Smartwatches', 'Gadgets'].map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Short Specs</label>
                  <input required type="text" className="w-full p-3 border border-gray-200 rounded-xl" value={formData.shortSpecs} onChange={e => setFormData({...formData, shortSpecs: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Specs</label>
                  <textarea required rows={4} className="w-full p-3 border border-gray-200 rounded-xl" value={formData.fullSpecs} onChange={e => setFormData({...formData, fullSpecs: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Status</label>
                  <select className="w-full p-3 border border-gray-200 rounded-xl" value={formData.stockStatus} onChange={e => setFormData({...formData, stockStatus: e.target.value as any})}>
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Product Image {editingProduct && '(Leave empty to keep current)'}</label>
                  <input required={!editingProduct} type="file" accept="image/*" className="w-full p-2 border border-gray-200 rounded-xl" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured Product (Show in Featured section)</label>
                </div>
                <div className="md:col-span-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={uploading} 
                    type="submit" 
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Upload size={20} />}
                    {uploading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Product</th>
                <th className="px-6 py-4 font-bold text-gray-700">Price</th>
                <th className="px-6 py-4 font-bold text-gray-700">Stock</th>
                <th className="px-6 py-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {products.map(p => (
                <motion.tr 
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-12 h-12 object-contain bg-gray-50 rounded" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{p.brand}</p>
                          {p.isFeatured && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {p.discountPrice ? (
                      <div className="flex flex-col">
                        <span>৳{p.discountPrice.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through">৳{p.price.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span>৳{p.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stockStatus === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stockStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      {deletingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDelete(p.id!)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setDeletingId(null)}
                            className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(p)} 
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit size={20} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeletingId(p.id!)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={20} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    const path = 'orders';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
  };

  const triggerPrint = () => {
    window.print();
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    const path = `orders/${id}`;
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      showToast(`Order marked as ${status}`, 'success');
      fetchOrders();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      showToast('Update failed', 'error');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Manage Orders</h2>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {orders.map((order, index) => (
            <motion.div 
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{order.customerName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600">📧 {order.userEmail || 'N/A'}</p>
                  <p className="text-gray-600">📞 {order.phone}</p>
                  <p className="text-gray-600">🏠 {order.address}</p>
                  <p className="text-gray-500 text-sm">📅 {new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex-1 border-l border-gray-100 pl-0 md:pl-6">
                  <p className="font-bold mb-2">Items:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {order.items.map((item, i) => (
                      <li key={i}>{item.name} (x{item.quantity}) - ৳{(item.price * item.quantity).toLocaleString()}</li>
                    ))}
                  </ul>
                  <p className="mt-4 font-bold text-lg text-orange-600">Total: ৳{order.totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Payment: {order.paymentMethod}</p>
                </div>

                <div className="flex flex-col gap-2 justify-center min-w-[150px]">
                  {order.status === 'Delivered' ? (
                    <div className="text-center py-2 px-4 bg-green-50 text-green-700 rounded-lg font-bold flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Completed
                    </div>
                  ) : order.status === 'Cancelled' ? (
                    <div className="text-center py-2 px-4 bg-red-50 text-red-700 rounded-lg font-bold flex items-center justify-center gap-2">
                      <Trash2 size={18} /> Cancelled
                    </div>
                  ) : (
                    <>
                      <select 
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id!, e.target.value as Order['status'])}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">Update Status</p>
                    </>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrint(order)}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Printer size={16} /> Print Receipt
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Print Receipt Modal */}
      <AnimatePresence>
        {printingOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPrintingOrder(null)}
            id="printable-receipt-container"
            className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center p-4 overflow-y-auto backdrop-blur-sm print:bg-transparent print:p-0 print:block"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:rounded-none"
              id="printable-receipt"
            >
              {/* Modal Header - Hidden on Print */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center print:hidden sticky top-0 z-20">
                <div className="flex items-center gap-2 text-gray-700">
                  <Printer size={20} className="text-orange-600" />
                  <span className="font-bold">Order Receipt Preview</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={triggerPrint}
                    className="bg-orange-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 active:scale-95"
                  >
                    <Printer size={16} /> Print Now
                  </button>
                  <button 
                    onClick={() => setPrintingOrder(null)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-90"
                    title="Close Preview"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Receipt Content */}
              <div className="p-8 md:p-12">
                <div className="text-center mb-10 border-b-2 border-gray-100 pb-8">
                  <h1 className="text-4xl font-black text-orange-600 mb-2 tracking-tighter">MEHEDI TELECOM</h1>
                  <p className="text-gray-500 font-medium">Your Trusted Mobile Shop</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-gray-400 text-xs">Bhitorbond, Nageswari, Kurigram, Bangladesh</p>
                    <p className="text-gray-600 text-sm font-bold">Phone: +880 1786 958055</p>
                    <p className="text-gray-400 text-xs">Email: info@meheditelecom.com</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
                    <p className="font-bold text-lg">{printingOrder.customerName}</p>
                    <p className="text-gray-600 text-sm">{printingOrder.phone}</p>
                    <p className="text-gray-600 text-sm">{printingOrder.userEmail || 'N/A'}</p>
                    <p className="text-gray-600 text-sm mt-2">{printingOrder.address}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Info</h3>
                    <p className="text-sm font-bold">Order ID: <span className="text-gray-500">#{printingOrder.id?.slice(-8).toUpperCase()}</span></p>
                    <p className="text-sm text-gray-600">Date: {new Date(printingOrder.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Time: {new Date(printingOrder.createdAt).toLocaleTimeString()}</p>
                    <p className="text-sm text-gray-600">Status: {printingOrder.status}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="py-3 font-bold text-sm">Item Description</th>
                        <th className="py-3 font-bold text-sm text-center">Qty</th>
                        <th className="py-3 font-bold text-sm text-right">Price</th>
                        <th className="py-3 font-bold text-sm text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {printingOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-4 text-sm font-medium">{item.name}</td>
                          <td className="py-4 text-sm text-center">{item.quantity}</td>
                          <td className="py-4 text-sm text-right">৳{item.price.toLocaleString()}</td>
                          <td className="py-4 text-sm text-right font-bold">৳{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t-2 border-gray-100 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">৳{printingOrder.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-bold">৳0</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-xl font-black">Grand Total</span>
                    <span className="text-2xl font-black text-orange-600">৳{printingOrder.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-12 text-center border-t border-dashed border-gray-200 pt-8">
                  <p className="text-sm font-bold text-gray-600">Thank you for shopping with us!</p>
                  <p className="text-xs text-gray-400 mt-1">Please keep this receipt for your records.</p>
                  <div className="mt-4 flex justify-center">
                    <div className="w-32 h-1 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;

const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchBanners = async () => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile && !editingBanner) {
      showToast('Please select an image', 'error');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingBanner?.image || '';
      
      if (imageFile) {
        const caption = `🖼️ *Banner: ${formData.title}*`;
        imageUrl = await uploadToTelegram(imageFile, caption);
      }

      const bannerData = {
        ...formData,
        image: imageUrl,
        updatedAt: Date.now()
      };

      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id!), bannerData);
        showToast('Banner updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'banners'), {
          ...bannerData,
          createdAt: Date.now()
        });
        showToast('Banner added successfully', 'success');
      }

      setIsAdding(false);
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '' });
      setImageFile(null);
      fetchBanners();
    } catch (error) {
      console.error(error);
      showToast(editingBanner ? 'Failed to update banner' : 'Failed to add banner', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    try {
      await deleteDoc(doc(db, 'banners', id));
      showToast('Banner deleted', 'success');
      fetchBanners();
    } catch (error) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{editingBanner ? 'Edit Banner' : 'Manage Banners (16:9)'}</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditingBanner(null);
              setFormData({ title: '', subtitle: '' });
            }
          }}
          className={`${isAdding ? 'bg-gray-500' : 'bg-green-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
        >
          {isAdding ? 'Cancel' : <><Plus size={20} /> Add New Banner</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Banner Title (Optional)</label>
                  <input type="text" className="w-full p-3 border border-gray-200 rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banner Subtitle (Optional)</label>
                  <input type="text" className="w-full p-3 border border-gray-200 rounded-xl" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banner Image (16:9 recommended) {editingBanner && '(Leave empty to keep current)'}</label>
                  <input required={!editingBanner} type="file" accept="image/*" className="w-full p-2 border border-gray-200 rounded-xl" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploading} 
                  type="submit" 
                  className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Upload size={20} />}
                  {uploading ? 'Uploading...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <motion.div 
            key={banner.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group relative"
          >
            <div className="aspect-[16/9] bg-gray-100">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{banner.title || 'No Title'}</h3>
                <p className="text-sm text-gray-500">{banner.subtitle || 'No Subtitle'}</p>
              </div>
              <div className="flex gap-2">
                {deletingId === banner.id ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(banner.id!)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(banner)} 
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeletingId(banner.id!)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
