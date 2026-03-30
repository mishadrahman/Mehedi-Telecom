import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { uploadToTelegram, getFirebaseErrorMessage } from '../lib/utils';
import { User, Calendar, Camera, Save, Loader2, Mail } from 'lucide-react';

const Profile = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    profileImage: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        dob: userData.dob || '',
        profileImage: userData.profileImage || ''
      });
      setPreviewUrl(userData.profileImage || null);
    }
  }, [userData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = formData.profileImage;

      if (imageFile) {
        const caption = `👤 *Profile Update*\nUser: ${formData.name}\nEmail: ${user.email}`;
        imageUrl = await uploadToTelegram(imageFile, caption);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        dob: formData.dob,
        profileImage: imageUrl,
        updatedAt: Date.now()
      });

      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(getFirebaseErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={48} /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Please login to view your profile.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 h-32 md:h-48"></div>
        
        <div className="px-8 pb-12 -mt-16 md:-mt-24">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white bg-gray-100 shadow-xl overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-orange-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-orange-700 transition-colors">
                  <Camera size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-900">{formData.name || 'User Profile'}</h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Mail size={16} /> {user.email}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <User size={18} className="text-orange-600" />
                  Full Name
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Calendar size={18} className="text-orange-600" />
                  Date of Birth
                </label>
                <input 
                  type="date" 
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-8 flex justify-center">
              <button 
                disabled={loading}
                type="submit"
                className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
