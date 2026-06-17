"use client";

import { useState, ChangeEvent } from 'react';
import { Camera, X, ArrowLeft } from 'lucide-react';

import { uploadImageAction, saveProfileSettings } from '../admin/actions';
import { toast } from 'sonner';

interface EditProfileModalProps {
  profile: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: any) => void;
}

export default function EditProfileModal({ profile, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(profile?.name || 'CJP Media');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [url, setUrl] = useState(profile?.url || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(profile?.coverUrl || '');
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setAvatarUrl(res.url);
      } else {
        toast.error(`Error: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setCoverUrl(res.url);
      } else {
        toast.error(`Error: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newSettings = {
        ...profile,
        name,
        bio,
        location,
        url,
        avatarUrl,
        coverUrl,
      };
      const res = await saveProfileSettings(newSettings);
      if (res.success) {
        toast.success("Profile saved!");
        onSave(newSettings);
        onClose();
      } else {
        toast.error("Failed to save: " + res.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-white/10 sm:bg-white/5 backdrop-blur-sm transition-opacity">
       <div className="bg-black sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[85vh] max-w-[600px] flex flex-col shadow-2xl overflow-hidden border border-white/20">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 bg-black/80 backdrop-blur shrink-0 z-10 sticky top-0">
             <div className="flex items-center gap-6">
                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                   <X className="w-5 h-5 hidden sm:block" />
                   <ArrowLeft className="w-5 h-5 sm:hidden" />
                </button>
                <h2 className="text-white font-bold text-xl">Edit profile</h2>
             </div>
             <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-white text-black font-bold px-4 h-8 rounded-full text-[14px] hover:bg-white/90 disabled:opacity-50 transition-colors"
             >
                {isSaving ? 'Saving...' : 'Save'}
             </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
             {/* Banner */}
             <div className="relative w-full h-[200px] bg-[#1a1a1a]">
                {coverUrl && (
                   <img src={coverUrl} alt="Cover" className="object-cover opacity-80" />
                )}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                   <div className="relative group/cover">
                      <button className="w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors pointer-events-none">
                         <Camera className="w-5 h-5" />
                      </button>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploadingCover} />
                   </div>
                   {coverUrl && (
                      <button onClick={() => setCoverUrl('')} className="w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors">
                         <X className="w-5 h-5" />
                      </button>
                   )}
                </div>
                {isUploadingCover && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 text-white text-sm font-bold">Uploading...</div>
                )}
             </div>

             {/* Avatar */}
             <div className="px-4 relative -mt-[60px] flex justify-between items-end mb-4">
                <div className="relative w-[120px] h-[120px] rounded-full border-4 border-black bg-[#121212] overflow-hidden group/avatar">
                   {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="object-cover" />
                   ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ccff00]/10 to-transparent flex items-center justify-center">
                         <span className="text-white/40 font-bold text-sm">No Image</span>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <button className="w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors pointer-events-none">
                          <Camera className="w-5 h-5" />
                       </button>
                       <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploadingAvatar} />
                   </div>
                   {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 text-white text-xs font-bold">Uploading...</div>
                   )}
                </div>
             </div>

             {/* Form Fields */}
             <div className="px-4 space-y-6 mt-6">
                <div className="relative rounded-md border border-white/20 focus-within:border-[#1d9bf0] transition-colors bg-transparent px-3 pt-6 pb-2 group">
                   <label className="absolute top-2 left-3 text-white/50 text-[13px] group-focus-within:text-[#1d9bf0] transition-colors">Name</label>
                   <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      maxLength={50}
                      className="w-full bg-transparent text-white focus:outline-none text-[15px]" 
                   />
                </div>
                
                <div className="relative rounded-md border border-white/20 focus-within:border-[#1d9bf0] transition-colors bg-transparent px-3 pt-6 pb-2 group">
                   <label className="absolute top-2 left-3 text-white/50 text-[13px] group-focus-within:text-[#1d9bf0] transition-colors">Bio</label>
                   <textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)} 
                      maxLength={160}
                      className="w-full bg-transparent text-white focus:outline-none text-[15px] resize-none h-20" 
                   />
                </div>

                <div className="relative rounded-md border border-white/20 focus-within:border-[#1d9bf0] transition-colors bg-transparent px-3 pt-6 pb-2 group">
                   <label className="absolute top-2 left-3 text-white/50 text-[13px] group-focus-within:text-[#1d9bf0] transition-colors">Location</label>
                   <input 
                      type="text" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                      maxLength={30}
                      className="w-full bg-transparent text-white focus:outline-none text-[15px]" 
                   />
                </div>

                <div className="relative rounded-md border border-white/20 focus-within:border-[#1d9bf0] transition-colors bg-transparent px-3 pt-6 pb-2 group">
                   <label className="absolute top-2 left-3 text-white/50 text-[13px] group-focus-within:text-[#1d9bf0] transition-colors">Website</label>
                   <input 
                      type="text" 
                      value={url} 
                      onChange={e => setUrl(e.target.value)} 
                      maxLength={100}
                      className="w-full bg-transparent text-white focus:outline-none text-[15px]" 
                   />
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
