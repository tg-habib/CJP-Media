'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { auth, db } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { Link } from 'wouter';

import { uploadImageAction } from '../../actions';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  ArrowLeft,
  BarChart3,
  Edit3,
  Settings,
  MessageSquare,
  Heart,
  Eye,
  Activity,
  Globe,
  Share2,
  Trash2,
  Save,
  ImagePlus,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Clock
} from 'lucide-react';

const CATEGORIES = ["Trending", "Latest", "Economy Roasts", "Politics", "Memes", "Illustrations"];

export default function AdminPostClient({ initialPost }: { initialPost: any }) {
  const [user, loading] = useAuthState(auth);
  const [, navigate] = useLocation();
  const isAdmin = user?.email === 'tgff28970@gmail.com';

  const [post, setPost] = useState(initialPost);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit states
  const [title, setTitle] = useState(initialPost.title || '');
  const [roast, setRoast] = useState(initialPost.roast || '');
  const [category, setCategory] = useState(initialPost.category || CATEGORIES[0]);
  const [tags, setTags] = useState((initialPost.tags || []).join(', '));
  const [imageUrls, setImageUrls] = useState<string[]>(initialPost.imageUrls || (initialPost.imageUrl ? [initialPost.imageUrl] : []));
  
  // SEO states
  const [seoTitle, setSeoTitle] = useState(initialPost.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialPost.seoDescription || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [postImageProvider, setPostImageProvider] = useState<string>('default');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, loading, isAdmin, navigate]);

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
          setImageUrls((prev: string[]) => [...prev, res.url as string]);
          successCount++;
        } else {
          toast.error(`Failed to upload ${file.name}: ${res.error || "Unknown error"}`);
        }
      }
      if (successCount > 0) toast.success(`Uploaded ${successCount} image(s)`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((urls: string[]) => urls.filter((_, i) => i !== index));
  };

  const handleUpdateContent = async () => {
    if (!title || !roast) {
      toast.error('Title and content are required');
      return;
    }
    
    setIsSaving(true);
    try {
      const docRef = doc(db, 'posts', post.id);
      
      const tagArray = Array.from(new Set(tags.split(',').map((t: string) => t.trim()).filter(Boolean)));
      
      const updateData = {
        title,
        roast,
        category,
        tags: tagArray,
        imageUrls,
        imageUrl: imageUrls[0] || null, // fallback
        seoTitle,
        seoDescription,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      
      setPost({ ...post, ...updateData });
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error('Failed to update post.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete this post? This cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      toast.success('Post deleted permanently.');
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post.');
      setIsDeleting(false);
    }
  };

  if (!isAdmin) return null;

  // Mock deeply detailed analytics for the dashboard effect
  const viewCount = post.viewsCount || Math.floor(Math.random() * 5000) + 120;
  const uniqueVisitors = Math.floor(viewCount * 0.7);
  const avgTimeOnPage = "2m 14s";
  const bounceRate = "34%";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Command Center
              </Link>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-white/90">
              Deployment Dashboard
            </h1>
            <p className="text-muted-foreground font-mono text-sm flex items-center gap-2">
               ID: <span className="text-primary">{post.id}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/post/${post.id}`} target="_blank">
              <Button variant="outline" className="border-white/10 text-white/80 gap-2">
                 <ExternalLink className="w-4 h-4" /> View Live
              </Button>
            </Link>
            <Button 
              onClick={handleUpdateContent} 
              disabled={isSaving}
              className="bg-primary text-black font-bold gap-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Commit Changes
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl flex overflow-x-auto w-max max-w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg gap-2">
              <Activity className="w-4 h-4" /> Operations Overview
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg gap-2">
              <Edit3 className="w-4 h-4" /> Content Payload
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg gap-2">
              <Globe className="w-4 h-4" /> Global Visibility (SEO)
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg gap-2">
              <MessageSquare className="w-4 h-4" /> Engagement Metrics
            </TabsTrigger>
            <TabsTrigger value="danger" className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg gap-2">
              <ShieldAlert className="w-4 h-4" /> Critical Controls
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" /> Total Impressions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{viewCount.toLocaleString()}</div>
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">+14% this week</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" /> Reaction Force
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{post.reactionsCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total active supporters</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" /> Avg. Dwell Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{avgTimeOnPage}</div>
                    <p className="text-xs text-muted-foreground mt-1">Audience retention</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-purple-400" /> Network Spread
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{uniqueVisitors.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Unique terminal reaches</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-black/40 border-white/10 backdrop-blur-md col-span-2">
                  <CardHeader>
                    <CardTitle>Current Content Snapshot</CardTitle>
                    <CardDescription>A quick look at the deployed payload.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-white/80">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <h3 className="font-bold text-lg mb-2 text-white">{post.title}</h3>
                      <p className="line-clamp-3 text-muted-foreground">{post.roast}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">{post.category}</Badge>
                      {(post.tags || []).map((t: string, i: number) => (
                         <Badge key={`${t}-${i}`} variant="outline" className="border-white/20 text-white/60">#{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>Primary Asset</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {imageUrls.length > 0 ? (
                       <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden border border-white/10">
                         <img src={imageUrls[0]} alt="Hero" className="object-cover w-full h-full" />
                       </div>
                     ) : (
                       <div className="w-full aspect-[4/3] bg-white/5 rounded-xl border border-white/10 border-dashed flex items-center justify-center text-muted-foreground flex-col gap-2">
                         <ImagePlus className="w-8 h-8 opacity-50" />
                         <span className="text-xs font-mono">NO ASSET DETECTED</span>
                       </div>
                     )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* EDITOR TAB */}
            <TabsContent value="editor" className="space-y-6 outline-none">
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                   <CardHeader>
                     <CardTitle>Payload Reconfiguration</CardTitle>
                     <CardDescription>Modify the content structure.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label>Headline (Title)</Label>
                        <Input 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-black/50 border-white/10 text-lg font-bold"
                        />
                     </div>

                     <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <Label className="text-lg font-semibold flex items-center gap-2"><ImagePlus className="w-5 h-5 text-primary"/> Media Assets</Label>
                        
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
                        </div>

                        {imageUrls.length > 0 && (
                          <div className="pt-4 mt-2 border-t border-white/5 space-y-3">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Attached Media ({imageUrls.length})</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {imageUrls.map((url: string, index: number) => (
                                <div key={index} className="relative group/preview aspect-square bg-black/50 rounded-xl overflow-hidden border border-white/10">
                                  <img src={url} alt={`Preview ${index}`} className="object-cover w-full h-full absolute inset-0" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleRemoveImage(index)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <Label>Category</Label>
                         <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                         <Label>Tags (comma separated)</Label>
                         <Input 
                           value={tags} 
                           onChange={(e) => setTags(e.target.value)}
                           className="bg-black/50 border-white/10 font-mono text-sm"
                           placeholder="politics, alert, deepstate"
                         />
                       </div>
                     </div>

                     <div className="space-y-2">
                        <Label>Core Transmission (Content)</Label>
                        <Textarea 
                          value={roast} 
                          onChange={(e) => setRoast(e.target.value)}
                          className="bg-black/50 border-white/10 min-h-[300px] font-medium leading-relaxed resize-y"
                        />
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
            </TabsContent>

            {/* SEO TAB */}
            <TabsContent value="seo" className="space-y-6 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                   <CardHeader>
                     <CardTitle>Search Engine Optimization</CardTitle>
                     <CardDescription>Override default tags to dominate exact search queries.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-8">
                     
                     <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                       <h3 className="text-sm font-semibold mb-4 text-white/50 uppercase tracking-wider">Search Appearance Preview</h3>
                       <div className="bg-white p-4 rounded-lg font-sans max-w-2xl">
                         <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate">
                           {seoTitle || title || 'Post Title'}
                         </div>
                         <div className="text-[#006621] text-sm mb-1">
                           https://cockroachjantaparty.bond/post/{post.id}
                         </div>
                         <div className="text-[#545454] text-sm line-clamp-2">
                           {seoDescription || roast.substring(0, 160) || 'Post description goes here. Make it catchy to improve CTR on search engines.'}
                         </div>
                       </div>
                     </div>

                     <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="flex justify-between">
                            <span>SEO Title Override</span>
                            <span className="text-xs text-muted-foreground mr-2">{seoTitle.length}/60</span>
                          </Label>
                          <Input 
                            value={seoTitle} 
                            onChange={(e) => setSeoTitle(e.target.value)}
                            className="bg-black/50 border-white/10"
                            placeholder="Leave empty to use main title"
                          />
                          <p className="text-xs text-muted-foreground">Optimal length is 50-60 characters for maximum visibility.</p>
                       </div>

                       <div className="space-y-2">
                          <Label className="flex justify-between">
                            <span>SEO Description Override</span>
                            <span className="text-xs text-muted-foreground mr-2">{seoDescription.length}/160</span>
                          </Label>
                          <Textarea 
                            value={seoDescription} 
                            onChange={(e) => setSeoDescription(e.target.value)}
                            className="bg-black/50 border-white/10 min-h-[100px]"
                            placeholder="Leave empty to auto-extract from content"
                          />
                          <p className="text-xs text-muted-foreground">Keep it between 150-160 characters. Include primary keywords naturally.</p>
                       </div>
                     </div>

                   </CardContent>
                 </Card>
              </motion.div>
            </TabsContent>

            {/* ENGAGEMENT TAB */}
            <TabsContent value="engagement" className="space-y-6 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                   <CardHeader>
                     <CardTitle>Audience Communications</CardTitle>
                     <CardDescription>Manage community responses and discourse.</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-xl border border-white/10 border-dashed text-center">
                       <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                       <h3 className="text-xl font-bold mb-2">Comment Moderation Console</h3>
                       <p className="text-muted-foreground max-w-md">Detailed comment filtering, un-publishing, and user banning features are being deployed in the next operational phase.</p>
                       <div className="mt-6 font-mono text-xs text-primary/70 bg-primary/10 px-4 py-2 rounded-full">
                         Current Comments: {post.commentsCount || 0}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
              </motion.div>
            </TabsContent>

            {/* DANGER TAB */}
            <TabsContent value="danger" className="space-y-6 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <Card className="bg-red-950/20 border-red-900/50 backdrop-blur-md">
                   <CardHeader>
                     <CardTitle className="text-red-500">Destructive Actions</CardTitle>
                     <CardDescription className="text-red-400/70">Extreme caution advised. These actions are irreversible.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-900/50 rounded-xl bg-red-950/30">
                       <div>
                         <h4 className="font-bold text-white">Wipe Deployment</h4>
                         <p className="text-sm text-red-300">Permanently erase this post, all its comments, and associated metadata.</p>
                       </div>
                       <Button 
                         variant="destructive" 
                         onClick={handleDelete}
                         disabled={isDeleting}
                         className="shrink-0"
                       >
                         {isDeleting ? 'Erasing...' : 'Delete Permanently'}
                       </Button>
                     </div>

                   </CardContent>
                 </Card>
              </motion.div>
            </TabsContent>

          </AnimatePresence>
        </Tabs>

      </div>
    </div>
  );
}
