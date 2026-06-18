import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc, updateDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useLocation } from 'wouter';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ImagePlus, Trash2, Edit, X, RefreshCw, BarChart3, FileText, Settings, Heart, MessageSquare, PlusCircle, ExternalLink, User, Home, Users, BarChart2, MoreHorizontal, LayoutDashboard, Flag, Shield, Folder, Tag, ImageIcon, TrendingUp, Bell, Radio, UserCheck, PenTool, Database, ChevronRight, Menu, Flame, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Link } from 'wouter';
import { uploadImageAction, saveImageSettings, getImageSettings, getProfileSettings, saveProfileSettings } from './actions';
import { motion, AnimatePresence } from 'motion/react';
import DashboardTab from './DashboardTab';

const CATEGORIES = ["Trending", "Latest", "Economy Roasts", "Politics", "Memes", "Illustrations"];

/* ─── Image position helpers ─── */
const POSITIONS = [
  ['left top',    'center top',    'right top'],
  ['left center', 'center center', 'right center'],
  ['left bottom', 'center bottom', 'right bottom'],
] as const;

function normalizePosition(p?: string): string {
  const map: Record<string, string> = {
    top: 'center top', bottom: 'center bottom',
    left: 'left center', right: 'right center', center: 'center center',
  };
  return map[p || ''] ?? p ?? 'center center';
}

/* ─── Reusable image upload zone ─── */
interface ImageUploadZoneProps {
  label: string;
  badge?: string;
  hint?: string;
  url: string;
  isUploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  height?: string;
  position?: string;
  onPositionChange?: (v: string) => void;
}

function ImageUploadZone({
  label, badge, hint, url, isUploading, onChange, onClear,
  height = 'h-40', position, onPositionChange,
}: ImageUploadZoneProps) {
  const normalized = normalizePosition(position);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.14em]">{label}</span>
        {badge && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ccff00]/10 text-[#ccff00]/60 font-bold tracking-wider">{badge}</span>
        )}
        {hint && <span className="text-[11px] text-white/20">{hint}</span>}
      </div>
      <div className="flex gap-3 items-start">
        <div className={`flex-1 relative group rounded-xl overflow-hidden border transition-all cursor-pointer ${height} ${url ? 'border-white/[0.08]' : 'border-dashed border-white/[0.09] hover:border-[#ccff00]/30 bg-white/[0.02] hover:bg-[#ccff00]/[0.02]'}`}>
          {url ? (
            <>
              <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: normalized }} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[12px] font-bold text-white bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  {isUploading ? 'Uploading…' : 'Change Image'}
                </span>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-[#ccff00] animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {isUploading
                ? <RefreshCw className="w-6 h-6 text-[#ccff00] animate-spin" />
                : <>
                    <ImagePlus className="w-6 h-6 text-white/15" />
                    <span className="text-[11px] text-white/25 font-medium">Click or drag to upload</span>
                  </>
              }
            </div>
          )}
          <input type="file" accept="image/*" onChange={onChange} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        {(onPositionChange || url) && (
          <div className="flex flex-col gap-2 shrink-0">
            {onPositionChange && (
              <div>
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-1.5 text-center">Focus</p>
                <div className="grid grid-cols-3 gap-0.5 p-1.5 bg-[#151515] rounded-xl border border-white/[0.06]">
                  {POSITIONS.flat().map(pos => {
                    const active = normalized === pos;
                    return (
                      <button key={pos} type="button" onClick={() => onPositionChange(pos)} title={pos}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-[#ccff00]' : 'hover:bg-white/10'}`}>
                        <div className={`w-2 h-2 rounded-full transition-colors ${active ? 'bg-black' : 'bg-white/20'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {url && (
              <button type="button" onClick={onClear}
                className="px-3 py-1.5 rounded-lg bg-red-500/[0.08] hover:bg-red-500/[0.15] text-red-400/60 hover:text-red-400 text-[11px] font-semibold transition-all border border-red-500/[0.08] whitespace-nowrap">
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const [, navigate] = useLocation();
  const isAdmin = true; // DEV: auth bypassed for testing

  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [roast, setRoast] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [postImageProvider, setPostImageProvider] = useState<string>('default');

  // Settings State
  const [imageProvider, setImageProvider] = useState('imgbb');
  const [settingsImgbbKey, setSettingsImgbbKey] = useState('');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Profile State
  const [profileName, setProfileName] = useState('CJP Media');
  const [profileHandle, setProfileHandle] = useState('@cjpmedia');
  const [profileBio, setProfileBio] = useState('We speak for the ignored, the unseen,\nand the unemployed youth.');
  const [profileLocation, setProfileLocation] = useState('New Delhi, India');
  const [profileUrl, setProfileUrl] = useState('cjpmedia.in');
  const [profileJoined, setProfileJoined] = useState('Jan 2024');
  const [profileFollowers, setProfileFollowers] = useState('127K');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [profileCoverUrl, setProfileCoverUrl] = useState('');
  const [profileHeroUrl, setProfileHeroUrl] = useState('');
  const [profileMobileHeroUrl, setProfileMobileHeroUrl] = useState('');
  const [profileFooterUrl, setProfileFooterUrl] = useState('');
  const [profileHeroPosition, setProfileHeroPosition] = useState('center');
  const [profileMobileHeroPosition, setProfileMobileHeroPosition] = useState('center');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingMobileHero, setIsUploadingMobileHero] = useState(false);
  const [isUploadingFooter, setIsUploadingFooter] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      title: 'MANAGE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'manage', label: 'Posts', icon: FileText },
        { id: 'users', label: 'Users', icon: Users, soon: true },
        { id: 'comments', label: 'Comments', icon: MessageSquare, soon: true },
        { id: 'reports', label: 'Reports', icon: Flag, soon: true },
        { id: 'moderation', label: 'Moderation', icon: Shield, soon: true },
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'categories', label: 'Categories', icon: Folder, soon: true },
        { id: 'tags', label: 'Tags', icon: Tag, soon: true },
        { id: 'media', label: 'Media Library', icon: ImageIcon, soon: true },
        { id: 'polls', label: 'Polls', icon: BarChart2, soon: true },
      ]
    },
    {
      title: 'ENGAGEMENT',
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, soon: true },
        { id: 'notifications', label: 'Notifications', icon: Bell, soon: true },
        { id: 'live', label: 'Live Sessions', icon: Radio, soon: true },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'roles', label: 'Roles & Permissions', icon: UserCheck, soon: true },
        { id: 'appearance', label: 'Appearance', icon: PenTool, soon: true },
        { id: 'logs', label: 'System Logs', icon: Database, soon: true },
      ]
    }
  ];

  // DEV: admin redirect removed for testing

  useEffect(() => {
    if (!isAdmin) return;
    const fetchSettings = async () => {
      const settings: any = await getImageSettings();
      if (settings) {
        setImageProvider(settings.provider || 'imgbb');
        setSettingsImgbbKey(settings.imgbbApiKey || '');
        setCloudinaryCloudName(settings.cloudinaryCloudName || '');
        setCloudinaryApiKey(settings.cloudinaryApiKey || '');
        setCloudinaryApiSecret(settings.cloudinaryApiSecret || '');
      }

      const profile: any = await getProfileSettings();
      if (profile) {
        setProfileName(profile.name || 'CJP Media');
        setProfileHandle(profile.handle || '@cjpmedia');
        setProfileBio(profile.bio || 'We speak for the ignored, the unseen,\nand the unemployed youth.');
        setProfileLocation(profile.location || 'New Delhi, India');
        setProfileUrl(profile.url || 'cjpmedia.in');
        setProfileJoined(profile.joined || 'Jan 2024');
        setProfileFollowers(profile.followers || '127K');
        setProfileAvatarUrl(profile.avatarUrl || '');
        setProfileCoverUrl(profile.coverUrl || '');
        setProfileHeroUrl(profile.heroUrl || '');
        setProfileMobileHeroUrl(profile.mobileHeroUrl || '');
        setProfileFooterUrl(profile.footerUrl || '');
        setProfileHeroPosition(profile.heroPosition || 'center');
        setProfileMobileHeroPosition(profile.mobileHeroPosition || 'center');
      }
    };
    fetchSettings();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [isAdmin]);

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title || '');
    setRoast(p.roast || '');
    
    let parsedUrls = p.imageUrls || [];
    if (parsedUrls.length === 0 && p.imageUrl) {
      parsedUrls = [p.imageUrl];
    }
    setImageUrls(parsedUrls);
    
    setCategory(p.category || CATEGORIES[0]);
    setTags((p.tags || []).join(', '));
    setActiveTab('editor'); // Switch tab to editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setRoast('');
    setImageUrls([]);
    setTags('');
    setCategory(CATEGORIES[0]);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;
    if (!title || !roast || imageUrls.length === 0) { toast.error('Fill required fields and add at least one image'); return; }
    
    setIsSubmitting(true);
    try {
      const tagArray = Array.from(new Set(tags.split(',').map(t => t.trim()).filter(Boolean)));
      
      const postData = {
        title: title.trim(),
        roast: roast.trim(),
        imageUrls: imageUrls,
        category,
        tags: tagArray,
        adminId: user.uid,
      };

      if (editingId) {
        await updateDoc(doc(db, 'posts', editingId), {
          ...postData,
          updatedAt: serverTimestamp(),
        });
        toast.success('Post updated successfully 🪳');
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: serverTimestamp(),
          reactionsCount: 0,
          commentsCount: 0
        });
        toast.success('Post uploaded successfully 🪳');
      }
      
      handleCancelEdit();
      setActiveTab('manage'); // Switch to manage tab so they see it
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await saveImageSettings({
        provider: imageProvider,
        imgbbApiKey: settingsImgbbKey,
        cloudinaryCloudName,
        cloudinaryApiKey,
        cloudinaryApiSecret
      });
      if (res.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings: " + res.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await saveProfileSettings({
        name: profileName,
        handle: profileHandle,
        bio: profileBio,
        location: profileLocation,
        url: profileUrl,
        joined: profileJoined,
        followers: profileFollowers,
        avatarUrl: profileAvatarUrl,
        coverUrl: profileCoverUrl,
        heroUrl: profileHeroUrl,
        mobileHeroUrl: profileMobileHeroUrl,
        footerUrl: profileFooterUrl,
        heroPosition: profileHeroPosition,
        mobileHeroPosition: profileMobileHeroPosition
      });
      if (res.success) {
        toast.success("Profile saved successfully");
      } else {
        toast.error("Failed to save profile: " + res.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setProfileAvatarUrl(res.url);
        toast.success("Avatar uploaded");
      } else {
        toast.error(`Failed to upload avatar: ${res.error || "Unknown error"}`);
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
        setProfileCoverUrl(res.url);
        toast.success("Cover uploaded");
      } else {
        toast.error(`Failed to upload cover: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleHeroUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setProfileHeroUrl(res.url);
        toast.success("Hero image uploaded");
      } else {
        toast.error(`Failed to upload hero: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleMobileHeroUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMobileHero(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setProfileMobileHeroUrl(res.url);
        toast.success("Mobile hero image uploaded");
      } else {
        toast.error(`Failed to upload mobile hero: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingMobileHero(false);
      e.target.value = '';
    }
  };

  const handleFooterUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFooter(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setProfileFooterUrl(res.url);
        toast.success("Footer image uploaded");
      } else {
        toast.error(`Failed to upload footer: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingFooter(false);
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("image", file);
        if (postImageProvider !== 'default') {
          formData.append("provider", postImageProvider);
        }
        
        const res = await uploadImageAction(formData);
        
        if (res.success && res.url) {
          setImageUrls(prev => [...prev, res.url as string]);
          successCount++;
        } else {
          toast.error(`Failed to upload ${file.name}: ${res.error || "Unknown error"}`);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded successfully`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // Reset input so same files can be uploaded again if needed
    }
  };
  
  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };
  
  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i): i is number => i !== index) as string[]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this masterpiece?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      toast.success('Deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-32 text-center text-muted-foreground flex justify-center items-center h-screen"><RefreshCw className="w-8 h-8 animate-spin" /></div>;

  // Calculate Stats
  const totalPosts = posts.length;
  const totalReactions = posts.reduce((sum, p) => sum + (p.reactionsCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0c0c0c] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         {/* Sidebar Content */}
         <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full border border-[#ccff00]/30 flex items-center justify-center relative overflow-hidden bg-[#ccff00]/10">
                  <Flame className="w-5 h-5 text-[#ccff00]" />
               </div>
               <div>
                 <h2 className="font-bold text-sm tracking-tight text-white leading-tight">CJP Media</h2>
                 <p className="text-[10px] text-[#ccff00] font-medium leading-tight">Admin Panel</p>
               </div>
            </div>
            <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
               <X className="w-5 h-5" />
            </button>
         </div>

         <div className="px-4 mb-4">
            <div className="bg-[#151515] rounded-xl p-3 flex items-center justify-between border border-white/5 cursor-pointer hover:bg-white/10 transition" onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden relative">
                     <img src={profileAvatarUrl || '/placeholder.png'} alt="Admin" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight mb-0.5">Admin</p>
                    <div className="flex items-center gap-1 text-[10px] text-[#ccff00]">
                       <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                       Super Admin
                    </div>
                  </div>
               </div>
               <ChevronRight className="w-4 h-4 text-white/40" />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pt-2 pb-6 px-3 scrollbar-hide space-y-6">
            {navGroups.map((group, i) => (
              <div key={i} className="mb-2">
                 <p className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">{group.title}</p>
                 <div className="space-y-1">
                    {group.items.map(item => {
                       const Icon = item.icon;
                       const isActive = activeTab === item.id;
                       return (
                         <button 
                           key={item.id}
                           onClick={() => {
                              if (!item.soon) {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                              }
                           }}
                           className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'text-white/60 hover:text-white hover:bg-white/5'} ${item.soon ? 'cursor-default opacity-50' : ''}`}
                         >
                           <div className="flex items-center gap-3">
                              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                              <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                           </div>
                           {item.soon && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 font-semibold tracking-wider">SOON</span>
                           )}
                         </button>
                       );
                    })}
                 </div>
              </div>
            ))}
         </div>

         {/* System Status */}
         <div className="p-4 border-t border-white/5">
            <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5">
               <span className="text-xs font-semibold text-white/60">System Status</span>
               <div className="flex items-center gap-1.5 bg-[#ccff00]/10 px-2 py-1 rounded text-[#ccff00]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Operational</span>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#050505]">
         <div className="flex-1 overflow-y-auto">
           {activeTab === 'dashboard' && <DashboardTab posts={posts} setActiveTab={setActiveTab} setIsMobileMenuOpen={setIsMobileMenuOpen} />}
           {activeTab !== 'dashboard' && (
             <div className="container mx-auto px-4 py-8 lg:py-10 max-w-6xl pb-8">
                <div className="flex items-center gap-4 mb-6 lg:hidden">
                   <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:text-white/80">
                     <Menu className="w-6 h-6" />
                   </button>
                   <span className="font-bold text-lg text-white">Menu</span>
                </div>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                 <div>
                   <h1 className="text-3xl font-black mb-1 text-white capitalize">{activeTab === 'manage' ? 'Manage Arsenal' : activeTab === 'editor' ? (editingId ? 'Refine Strategy' : 'Deploy Content') : activeTab}</h1>
                   <p className="text-sm text-white/50">Administer the system and orchestrate the platform.</p>
                 </div>
                 <div className="flex gap-3">
                   <Button variant="outline" className="border-white/10" onClick={() => navigate('/')}>
                     Exit Admin
                   </Button>
                   <Button 
                     className="bg-[#ccff00] text-black font-bold hover:bg-[#bbe600]"
                     onClick={() => {
                       handleCancelEdit();
                       setActiveTab('editor');
                     }}
                   >
                     <PlusCircle className="w-4 h-4 mr-2" /> New Roast
                   </Button>
                 </div>
               </div>



               {/* MANAGE TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'manage' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="bg-black/40 border-white/10 backdrop-blur-md outline-none">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5">
                <div>
                  <CardTitle>Manage Arsenal</CardTitle>
                  <CardDescription>View, edit, and delete your published content.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                  {posts.map((p, i) => (
                    <div key={p.id || i} className={`group relative p-6 border-white/5 ${i % 3 !== 0 ? 'border-l' : ''} ${i >= 3 ? 'border-t' : ''} transition-colors hover:bg-white/[0.02]`}>
                      <div className="flex gap-4 items-start">
                        <div className="w-20 h-20 bg-muted/20 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 relative">
                          <img src={p.imageUrls?.[0] || p.imageUrl || '/placeholder.png'} alt="Preview" className="object-cover" />
                          {p.imageUrls?.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-bold backdrop-blur-sm">
                              +{p.imageUrls.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight text-white/90 line-clamp-2 mb-1">{p.title}</h4>
                          <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-0">{p.category}</Badge>
                          
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-mono">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-primary" /> {p.reactionsCount || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-white/50" /> {p.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Overlay Mobile + Desktop Hover */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/post/${p.id}`}>
                          <Button variant="secondary" size="icon" className="h-8 w-8 bg-primary text-black hover:bg-primary/90 backdrop-blur-md shadow-lg border-0" title="Manage Dashboard">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/post/${p.id}`} target="_blank">
                          <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-lg border-0" title="View Live">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <div className="col-span-full py-24 text-center text-muted-foreground flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p>No content deployed yet.</p>
                      <Button className="mt-4" onClick={() => setActiveTab('editor')}>Create First Post</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
               )}
               </AnimatePresence>

               {/* EDITOR TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'editor' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="bg-black/40 border-white/10 backdrop-blur-md outline-none">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5">
                <div>
                  <CardTitle className="text-2xl text-primary">{editingId ? 'Refine Strategy' : 'Deploy Content'}</CardTitle>
                  <CardDescription>Craft your posts carefully. They hit hard.</CardDescription>
                </div>
                {editingId && (
                  <Button variant="outline" className="border-white/10" onClick={handleCancelEdit}>Cancel Edit</Button>
                )}
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                  {/* Image Section */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg font-semibold flex items-center gap-2"><ImagePlus className="w-5 h-5 text-primary"/> Media Assets</Label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="imageFile" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Upload Local File</Label>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                           <Button 
                             type="button" 
                             size="sm"
                             variant={postImageProvider === 'default' ? 'default' : 'outline'} 
                             className={postImageProvider === 'default' ? 'bg-primary text-black font-bold h-7 text-[10px]' : 'border-white/10 text-white/70 h-7 text-[10px]'}
                             onClick={() => setPostImageProvider('default')}
                           >
                             Global Default
                           </Button>
                           <Button 
                             type="button" 
                             size="sm"
                             variant={postImageProvider === 'imgbb' ? 'default' : 'outline'} 
                             className={postImageProvider === 'imgbb' ? 'bg-primary text-black font-bold h-7 text-[10px]' : 'border-white/10 text-white/70 h-7 text-[10px]'}
                             onClick={() => setPostImageProvider('imgbb')}
                           >
                             ImgBB
                           </Button>
                           <Button 
                             type="button" 
                             size="sm"
                             variant={postImageProvider === 'cloudinary' ? 'default' : 'outline'} 
                             className={postImageProvider === 'cloudinary' ? 'bg-primary text-black font-bold h-7 text-[10px]' : 'border-white/10 text-white/70 h-7 text-[10px]'}
                             onClick={() => setPostImageProvider('cloudinary')}
                           >
                             Cloudinary
                           </Button>
                        </div>
                        <div className="relative group/upload h-12">
                          <Input 
                            id="imageFile" 
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center border-2 border-dashed rounded-xl transition-colors ${isUploadingImage ? 'border-primary bg-primary/10' : 'border-white/20 group-hover/upload:border-primary group-hover/upload:bg-primary/5'}`}>
                            {isUploadingImage ? (
                              <div className="flex items-center gap-2 text-primary font-medium">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                              </div>
                            ) : (
                              <div className="text-muted-foreground font-medium flex items-center gap-2">
                                <ImagePlus className="w-4 h-4" /> Click or drag image
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="newImageUrl" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Or provide Image URL</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="newImageUrl" 
                            placeholder="https://example.com/meme.jpg" 
                            value={newImageUrl} 
                            onChange={e => setNewImageUrl(e.target.value)} 
                            className="bg-black/50 border-white/10 focus-visible:ring-primary h-12"
                            onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                          />
                          <Button type="button" onClick={addImageUrl} variant="secondary" className="h-12 border-white/10" disabled={!newImageUrl.trim()}>Add</Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Preview List */}
                    {imageUrls.length > 0 && (
                       <div className="flex gap-4 overflow-x-auto pb-2 pt-4 snap-x">
                         {imageUrls.map((url, i) => (
                           <div key={i} className="relative group/preview rounded-xl overflow-hidden border-2 border-white/10 shrink-0 w-40 h-40 snap-start bg-black">
                             <img src={url || '/placeholder.png'} alt={`Preview ${i}`} className="object-cover" />
                             <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                               <p className="text-[10px] text-white font-mono truncate">{i === 0 ? 'COVER' : `IMAGE ${i+1}`}</p>
                             </div>
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                               <Button 
                                 type="button" 
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => removeImage(i)}
                                 className="font-bold shadow-2xl"
                               >
                                 <Trash2 className="w-4 h-4 mr-2" /> Remove
                               </Button>
                             </div>
                           </div>
                         ))}
                       </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-lg font-semibold">Headline</Label>
                      <Input 
                        id="title" 
                        placeholder="Drop a catchy, hard-hitting title..." 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        className="bg-white/5 border-white/10 text-xl font-bold h-14 focus-visible:ring-primary" 
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="roast" className="text-lg font-semibold">The Core Message / Roast</Label>
                      <Textarea 
                        id="roast" 
                        placeholder="Elaborate the point. Be brutal, be truthful..." 
                        value={roast} 
                        onChange={e => setRoast(e.target.value)}
                        className="h-48 bg-white/5 border-white/10 resize-y text-[15px] leading-relaxed focus-visible:ring-primary font-serif italic" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Classification</Label>
                        <select 
                          id="category"
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-black/50 px-4 py-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="tags" className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Tags / Keywords</Label>
                        <Input 
                          id="tags" 
                          placeholder="e.g. economy, reality-check, inflation" 
                          value={tags} 
                          onChange={e => setTags(e.target.value)}
                          className="bg-black/50 border-white/10 h-12 focus-visible:ring-primary font-mono text-sm" 
                        />
                        <p className="text-xs text-muted-foreground">Separate strictly with commas.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end gap-4">
                    {editingId && (
                      <Button type="button" variant="ghost" onClick={handleCancelEdit} className="h-12 px-8">Discard Changes</Button>
                    )}
                    <Button type="submit" className="h-12 px-10 font-bold bg-primary text-black hover:bg-primary/80 shadow-[0_0_30px_rgba(195,255,0,0.2)] hover:shadow-[0_0_40px_rgba(195,255,0,0.4)] transition-all text-lg" disabled={isSubmitting}>
                      {isSubmitting ? <RefreshCw className="w-5 h-5 mr-3 animate-spin"/> : null}
                      {isSubmitting ? 'Deploying...' : (editingId ? 'Update Masterpiece' : 'Deploy Masterpiece')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
               )}
               </AnimatePresence>

               {/* PROFILE TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

            {/* ── Page header ── */}
            <div className="flex items-start justify-between mb-7 gap-4">
              <div>
                <h1 className="text-[22px] font-black text-white tracking-tight">Media Profile</h1>
                <p className="text-white/35 text-[13px] mt-0.5">Control how CJP Media is presented to the public</p>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#ccff00] text-black font-bold text-[13px] rounded-full hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_24px_rgba(204,255,0,0.18)] shrink-0"
              >
                {isSavingProfile
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" strokeWidth={2.5} />}
                {isSavingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_316px] gap-5">

              {/* ── LEFT: form sections ── */}
              <div className="space-y-5">

                {/* IDENTITY */}
                <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-6">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-[3px] h-4 rounded-full bg-[#ccff00]" />
                    <h3 className="font-bold text-white text-[14px] tracking-tight">Identity</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="relative group cursor-pointer">
                        <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-white/[0.08] bg-[#1a1a1a]">
                          {profileAvatarUrl
                            ? <img src={profileAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Flame className="w-8 h-8 text-[#ccff00]/30" /></div>
                          }
                        </div>
                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          {isUploadingAvatar
                            ? <RefreshCw className="w-5 h-5 text-white animate-spin" />
                            : <Camera className="w-5 h-5 text-white" />
                          }
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} className="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
                      </div>
                      <span className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Avatar</span>
                      {profileAvatarUrl && (
                        <button type="button" onClick={() => setProfileAvatarUrl('')} className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors">Remove</button>
                      )}
                    </div>
                    {/* Fields */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-white/35 uppercase tracking-[0.14em]">Display Name</label>
                        <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="CJP Media"
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 h-11 text-white text-[14px] font-medium placeholder-white/15 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/35 uppercase tracking-[0.14em]">Handle</label>
                        <input value={profileHandle} onChange={e => setProfileHandle(e.target.value)} placeholder="@cjpmedia"
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 h-11 text-white text-[14px] font-medium placeholder-white/15 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/35 uppercase tracking-[0.14em]">Followers Display</label>
                        <input value={profileFollowers} onChange={e => setProfileFollowers(e.target.value)} placeholder="127K"
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 h-11 text-white text-[14px] font-medium placeholder-white/15 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-white/35 uppercase tracking-[0.14em]">Bio</label>
                        <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={3} placeholder="We speak for the ignored…"
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-[14px] font-medium placeholder-white/15 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all resize-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRESENCE */}
                <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-6">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-[3px] h-4 rounded-full bg-[#1d9bf0]" />
                    <h3 className="font-bold text-white text-[14px] tracking-tight">Presence</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Location', value: profileLocation, setter: (v: string) => setProfileLocation(v), placeholder: 'New Delhi, India' },
                      { label: 'Website URL', value: profileUrl, setter: (v: string) => setProfileUrl(v), placeholder: 'cjpmedia.in' },
                      { label: 'Joined Date', value: profileJoined, setter: (v: string) => setProfileJoined(v), placeholder: 'Jan 2024' },
                    ].map(({ label, value, setter, placeholder }) => (
                      <div key={label} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/35 uppercase tracking-[0.14em]">{label}</label>
                        <input value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 h-11 text-white text-[14px] font-medium placeholder-white/15 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* MEDIA ASSETS */}
                <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl p-6">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-[3px] h-4 rounded-full bg-[#a855f7]" />
                    <h3 className="font-bold text-white text-[14px] tracking-tight">Media Assets</h3>
                    <span className="text-[11px] text-white/20 font-medium">· Images used across the site</span>
                  </div>
                  <div className="space-y-6">

                    <ImageUploadZone
                      label="Desktop Hero Image" badge="Homepage" hint="· Main banner on desktop screens"
                      url={profileHeroUrl} isUploading={isUploadingHero}
                      onChange={handleHeroUpload} onClear={() => setProfileHeroUrl('')}
                      height="h-44" position={profileHeroPosition} onPositionChange={setProfileHeroPosition}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <ImageUploadZone
                        label="Mobile Hero Image" badge="Mobile" hint="· Falls back to desktop hero"
                        url={profileMobileHeroUrl} isUploading={isUploadingMobileHero}
                        onChange={handleMobileHeroUpload} onClear={() => setProfileMobileHeroUrl('')}
                        height="h-36" position={profileMobileHeroPosition} onPositionChange={setProfileMobileHeroPosition}
                      />
                      <ImageUploadZone
                        label="Cover Image" badge="Profile page" hint="· Profile banner"
                        url={profileCoverUrl} isUploading={isUploadingCover}
                        onChange={handleCoverUpload} onClear={() => setProfileCoverUrl('')}
                        height="h-36"
                      />
                    </div>

                    <ImageUploadZone
                      label="Footer Mascot" badge="Footer" hint="· Character shown in the footer"
                      url={profileFooterUrl} isUploading={isUploadingFooter}
                      onChange={handleFooterUpload} onClear={() => setProfileFooterUrl('')}
                      height="h-40"
                    />
                  </div>
                </div>

              </div>{/* end LEFT */}

              {/* ── RIGHT: Live Preview ── */}
              <div className="xl:sticky xl:top-6 xl:self-start space-y-4">
                <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.14em]">Live Preview</span>
                  </div>

                  {/* Cover */}
                  <div className="relative h-[100px] bg-gradient-to-br from-[#111] to-[#181818]">
                    {profileCoverUrl
                      ? <img src={profileCoverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      : <div className="absolute inset-0 bg-gradient-to-br from-[#ccff00]/5 to-transparent" />
                    }
                    {/* Avatar overlap */}
                    <div className="absolute -bottom-7 left-5 w-[56px] h-[56px] rounded-full border-4 border-[#0c0c0c] overflow-hidden bg-[#1a1a1a] shadow-lg">
                      {profileAvatarUrl
                        ? <img src={profileAvatarUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center bg-[#ccff00]/10"><Flame className="w-5 h-5 text-[#ccff00]" /></div>
                      }
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-5 pt-10 pb-5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white text-[15px] tracking-tight">{profileName || 'CJP Media'}</span>
                      {/* verified badge */}
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 22 22" fill="none">
                        <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.438 1.69-.882.445-.47.749-1.055.878-1.688.13-.633.08-1.29-.144-1.896.587-.274 1.087-.705 1.443-1.245.356-.54.555-1.17.574-1.816zm-9.224 4.185l-3.6-3.6 1.06-1.06 2.54 2.54 4.605-4.605 1.06 1.06-5.665 5.665z" fill="#ccff00"/>
                      </svg>
                    </div>
                    <p className="text-[#ccff00]/60 text-[11px] font-medium mt-0.5">{profileHandle || '@cjpmedia'}</p>
                    {profileBio && (
                      <p className="text-white/40 text-[11px] leading-relaxed mt-2 line-clamp-2">{profileBio}</p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2.5 text-white/30 text-[10px]">
                      {profileLocation && <span>📍 {profileLocation}</span>}
                      {profileUrl && <span className="text-[#ccff00]/50">{profileUrl}</span>}
                      {profileJoined && <span>Joined {profileJoined}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.05] text-[11px]">
                      <div>
                        <span className="font-black text-white text-[13px] tabular-nums">{profileFollowers || '—'}</span>
                        <span className="text-white/30 ml-1">Followers</span>
                      </div>
                      <div>
                        <span className="font-black text-white text-[13px] tabular-nums">{posts.length}</span>
                        <span className="text-white/30 ml-1">Posts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero thumbnail */}
                {profileHeroUrl && (
                  <div className="bg-[#0c0c0c] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.14em]">Hero Preview</span>
                    </div>
                    <div className="relative h-28 overflow-hidden">
                      <img src={profileHeroUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: normalizePosition(profileHeroPosition) }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end px-4 pb-3">
                        <span className="text-white text-[11px] font-bold opacity-70">Desktop Hero</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-white/20 text-center leading-relaxed px-3">
                  Preview updates live. Changes go live after saving.
                </p>
              </div>

            </div>
          </motion.div>
               )}
               </AnimatePresence>

               {/* SETTINGS TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="bg-black/40 border-white/10 backdrop-blur-md outline-none max-w-4xl mx-auto mt-4">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5">
                <div>
                  <CardTitle className="text-2xl text-primary">Platform configuration</CardTitle>
                  <CardDescription>Manage global environment boundaries and API limitations.</CardDescription>
                </div>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={isSavingSettings}
                  className="bg-primary hover:bg-primary/90 text-black font-bold px-6"
                >
                  {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                  <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-white">Image Upload Provider</h3>
                     <p className="text-sm text-muted-foreground mt-0">Select and configure the CDN provider for post images.</p>
                     
                     <div className="flex gap-4">
                        <Button 
                          variant={imageProvider === 'imgbb' ? 'default' : 'outline'} 
                          className={imageProvider === 'imgbb' ? 'bg-primary text-black font-bold' : 'border-white/10 text-white/70'}
                          onClick={() => setImageProvider('imgbb')}
                        >
                          ImgBB
                        </Button>
                        <Button 
                          variant={imageProvider === 'cloudinary' ? 'default' : 'outline'} 
                          className={imageProvider === 'cloudinary' ? 'bg-primary text-black font-bold' : 'border-white/10 text-white/70'}
                          onClick={() => setImageProvider('cloudinary')}
                        >
                          Cloudinary
                        </Button>
                     </div>

                     <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-6 space-y-4">
                       {imageProvider === 'imgbb' ? (
                         <div className="space-y-4">
                           <h4 className="font-medium text-white/90">ImgBB Configuration</h4>
                           <div>
                             <Label className="text-muted-foreground">API Key</Label>
                             <Input 
                               type="password" 
                               value={settingsImgbbKey} 
                               onChange={e => setSettingsImgbbKey(e.target.value)} 
                               placeholder="c87f9b7c..." 
                               className="bg-black/50 border-white/10 font-mono mt-1" 
                             />
                             <p className="text-xs text-muted-foreground mt-2">If left blank, it will try to use the environment variable VITE_IMGBB_API_KEY.</p>
                           </div>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           <h4 className="font-medium text-white/90">Cloudinary Configuration</h4>
                           <div>
                             <Label className="text-muted-foreground">Cloud Name</Label>
                             <Input 
                               value={cloudinaryCloudName} 
                               onChange={e => setCloudinaryCloudName(e.target.value)} 
                               placeholder="e.g. dwlquotvw" 
                               className="bg-black/50 border-white/10 font-mono mt-1" 
                             />
                             <p className="text-xs text-muted-foreground mt-2">If left blank, it will try to use the environment variable CLOUDINARY_CLOUD_NAME.</p>
                           </div>
                           <div>
                             <Label className="text-muted-foreground">API Key</Label>
                             <Input 
                               value={cloudinaryApiKey} 
                               onChange={e => setCloudinaryApiKey(e.target.value)} 
                               placeholder="e.g. 398536318389896" 
                               className="bg-black/50 border-white/10 font-mono mt-1" 
                             />
                             <p className="text-xs text-muted-foreground mt-2">If left blank, it will try to use the environment variable CLOUDINARY_API_KEY.</p>
                           </div>
                           <div>
                             <Label className="text-muted-foreground">API Secret</Label>
                             <Input 
                               type="password"
                               value={cloudinaryApiSecret} 
                               onChange={e => setCloudinaryApiSecret(e.target.value)} 
                               placeholder="e.g. oFU-XGlIFR..." 
                               className="bg-black/50 border-white/10 font-mono mt-1" 
                             />
                             <p className="text-xs text-muted-foreground mt-2">If left blank, it will try to use the environment variable CLOUDINARY_API_SECRET.</p>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-white/5">
                     <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                     <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                         <div>
                            <h4 className="font-medium text-white/90">Emergency Purge</h4>
                            <p className="text-xs text-muted-foreground mt-1">Wipes all cached image derivatives and forces a total metadata re-sync.</p>
                         </div>
                         <Button variant="destructive" className="font-bold">Initialize Purge</Button>
                     </div>
                  </div>
              </CardContent>
            </Card>
          </motion.div>
               )}
               </AnimatePresence>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}

