"use client";

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
import { ImagePlus, Trash2, Edit, X, RefreshCw, BarChart3, FileText, Settings, Heart, MessageSquare, PlusCircle, ExternalLink, User, Home, Users, BarChart2, MoreHorizontal, LayoutDashboard, Flag, Shield, Folder, Tag, ImageIcon, TrendingUp, Bell, Radio, UserCheck, PenTool, Database, ChevronRight, Menu, Flame } from 'lucide-react';
import { toast } from 'sonner';

import { Link } from 'wouter';
import { uploadImageAction, saveImageSettings, getImageSettings, getProfileSettings, saveProfileSettings } from './actions';
import { motion, AnimatePresence } from 'motion/react';
import DashboardTab from './DashboardTab';

const CATEGORIES = ["Trending", "Latest", "Economy Roasts", "Politics", "Memes", "Illustrations"];

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const [, navigate] = useLocation();
  const isAdmin = user?.email === 'tgff28970@gmail.com';

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

  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

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
    if (!isAdmin || !user) return;
    if (!title || !roast || imageUrls.length === 0) return toast.error('Fill required fields and add at least one image');
    
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

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-32 text-center h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You must be logged in as an administrator to view this page.</p>
        {!user && (
          <Button onClick={() => import('../../firebase').then(m => m.loginWithGoogle())} className="font-bold">
            Sign In with Google
          </Button>
        )}
      </div>
    );
  }

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
                     <img src={profileAvatarUrl || '/placeholder.png'} alt="Admin" className="object-cover" />
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
            <Card className="bg-black/40 border-white/10 backdrop-blur-md outline-none max-w-4xl mx-auto mt-4">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5">
                <div>
                  <CardTitle className="text-2xl text-primary">Profile Management</CardTitle>
                  <CardDescription>Control how CJP Media is presented to the public.</CardDescription>
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSavingProfile}
                  className="bg-primary text-black font-bold hover:bg-primary/90 px-6"
                >
                  {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Profile
                </Button>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="profileName" className="text-sm text-muted-foreground font-semibold">Display Name</Label>
                    <Input id="profileName" value={profileName} onChange={e => setProfileName(e.target.value)} className="bg-white/5 border-white/10 h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="profileHandle" className="text-sm text-muted-foreground font-semibold">Handle/Username</Label>
                    <Input id="profileHandle" value={profileHandle} onChange={e => setProfileHandle(e.target.value)} className="bg-white/5 border-white/10 h-12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="profileBio" className="text-sm text-muted-foreground font-semibold">Bio</Label>
                  <Textarea id="profileBio" value={profileBio} onChange={e => setProfileBio(e.target.value)} className="bg-white/5 border-white/10 h-24 resize-y" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="profileLocation" className="text-sm text-muted-foreground font-semibold">Location</Label>
                    <Input id="profileLocation" value={profileLocation} onChange={e => setProfileLocation(e.target.value)} className="bg-white/5 border-white/10 h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="profileUrl" className="text-sm text-muted-foreground font-semibold">Website URL</Label>
                    <Input id="profileUrl" value={profileUrl} onChange={e => setProfileUrl(e.target.value)} className="bg-white/5 border-white/10 h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="profileJoined" className="text-sm text-muted-foreground font-semibold">Joined Date Text</Label>
                    <Input id="profileJoined" value={profileJoined} onChange={e => setProfileJoined(e.target.value)} className="bg-white/5 border-white/10 h-12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="profileFollowers" className="text-sm text-muted-foreground font-semibold">Followers Count Display Text</Label>
                  <Input id="profileFollowers" value={profileFollowers} onChange={e => setProfileFollowers(e.target.value)} className="bg-white/5 border-white/10 h-12 max-w-xs" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <Label htmlFor="profileAvatar" className="text-sm text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Avatar Image URL</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input id="profileAvatar" value={profileAvatarUrl} onChange={e => setProfileAvatarUrl(e.target.value)} placeholder="Leave blank to use default Flame icon" className="bg-white/5 border-white/10 h-12 flex-1" />
                      <div className="relative shrink-0">
                         <Button type="button" variant="outline" className="h-12 w-12 p-0 border-white/10" disabled={isUploadingAvatar}>
                            {isUploadingAvatar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                         </Button>
                         <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    {profileAvatarUrl && (
                      <div className="mt-2 w-16 h-16 rounded-full border border-white/20 overflow-hidden relative">
                        <img src={profileAvatarUrl} alt="Avatar" className="object-cover" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="profileCover" className="text-sm text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Cover Image URL</span>
                    </Label>
                    <div className="flex gap-2">
                       <Input id="profileCover" value={profileCoverUrl} onChange={e => setProfileCoverUrl(e.target.value)} placeholder="Leave blank to use default background" className="bg-white/5 border-white/10 h-12 flex-1" />
                       <div className="relative shrink-0">
                          <Button type="button" variant="outline" className="h-12 w-12 p-0 border-white/10" disabled={isUploadingCover}>
                             {isUploadingCover ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                          </Button>
                          <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                    </div>
                    {profileCoverUrl && (
                      <div className="mt-2 w-full h-24 rounded-lg border border-white/20 overflow-hidden relative">
                        <img src={profileCoverUrl} alt="Cover" className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <Label htmlFor="profileHero" className="text-sm text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Home Hero Image URL</span>
                    </Label>
                    <div className="flex gap-2">
                       <Input id="profileHero" value={profileHeroUrl} onChange={e => setProfileHeroUrl(e.target.value)} placeholder="Leave blank to use default /hero.png" className="bg-white/5 border-white/10 h-12 flex-1" />
                       <select value={profileHeroPosition} onChange={e => setProfileHeroPosition(e.target.value)} className="bg-white/5 border-white/10 rounded-md px-3 text-white">
                           <option value="center">Center</option>
                           <option value="top">Top</option>
                           <option value="bottom">Bottom</option>
                           <option value="left">Left</option>
                           <option value="right">Right</option>
                       </select>
                       <div className="relative shrink-0">
                          <Button type="button" variant="outline" className="h-12 w-12 p-0 border-white/10" disabled={isUploadingHero}>
                             {isUploadingHero ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                          </Button>
                          <input type="file" accept="image/*" onChange={handleHeroUpload} disabled={isUploadingHero} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                    </div>
                    {profileHeroUrl && (
                      <div className="mt-2 w-full h-48 rounded-lg border border-white/20 overflow-hidden relative">
                        <img src={profileHeroUrl} alt="Hero" style={{ objectPosition: profileHeroPosition }} className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <Label htmlFor="profileMobileHero" className="text-sm text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Mobile Hero Image URL</span>
                    </Label>
                    <div className="flex gap-2">
                       <Input id="profileMobileHero" value={profileMobileHeroUrl} onChange={e => setProfileMobileHeroUrl(e.target.value)} placeholder="Leave blank to fallback to Desktop Hero" className="bg-white/5 border-white/10 h-12 flex-1" />
                       <select value={profileMobileHeroPosition} onChange={e => setProfileMobileHeroPosition(e.target.value)} className="bg-white/5 border-white/10 rounded-md px-3 text-white">
                           <option value="center">Center</option>
                           <option value="top">Top</option>
                           <option value="bottom">Bottom</option>
                           <option value="left">Left</option>
                           <option value="right">Right</option>
                       </select>
                       <div className="relative shrink-0">
                          <Button type="button" variant="outline" className="h-12 w-12 p-0 border-white/10" disabled={isUploadingMobileHero}>
                             {isUploadingMobileHero ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                          </Button>
                          <input type="file" accept="image/*" onChange={handleMobileHeroUpload} disabled={isUploadingMobileHero} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                    </div>
                    {profileMobileHeroUrl && (
                      <div className="mt-2 w-full h-48 sm:w-1/2 rounded-lg border border-white/20 overflow-hidden relative">
                        <img src={profileMobileHeroUrl} alt="Mobile Hero" style={{ objectPosition: profileMobileHeroPosition }} className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="space-y-3">
                    <Label htmlFor="profileFooter" className="text-sm text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Footer Mascot Image URL</span>
                    </Label>
                    <div className="flex gap-2">
                       <Input id="profileFooter" value={profileFooterUrl} onChange={e => setProfileFooterUrl(e.target.value)} placeholder="Leave blank to disable" className="bg-white/5 border-white/10 h-12 flex-1" />
                       <div className="relative shrink-0">
                          <Button type="button" variant="outline" className="h-12 w-12 p-0 border-white/10" disabled={isUploadingFooter}>
                             {isUploadingFooter ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                          </Button>
                          <input type="file" accept="image/*" onChange={handleFooterUpload} disabled={isUploadingFooter} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                    </div>
                    {profileFooterUrl && (
                      <div className="mt-2 w-full h-48 sm:w-1/2 rounded-lg border border-white/20 overflow-hidden relative">
                        <img src={profileFooterUrl} alt="Footer Mascot" className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
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

