"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RefreshCw, User, Settings, Bookmark, Heart, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function DashboardClient() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">User Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="md:col-span-1 bg-[#121212] border-white/10 h-fit">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6 p-2">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/20">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="Profile" width={48} height={48} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-primary/20 text-primary">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold truncate">{user.displayName || 'Anonymous User'}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
            
            <Button 
              variant={activeTab === 'profile' ? 'default' : 'ghost'} 
              className={`w-full justify-start ${activeTab === 'profile' ? 'bg-primary text-black hover:bg-primary/90' : 'hover:bg-white/5'}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
            <Button 
              variant={activeTab === 'bookmarks' ? 'default' : 'ghost'} 
              className={`w-full justify-start ${activeTab === 'bookmarks' ? 'bg-primary text-black hover:bg-primary/90' : 'hover:bg-white/5'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              <Bookmark className="w-4 h-4 mr-2" /> Bookmarks
            </Button>
            <Button 
              variant={activeTab === 'likes' ? 'default' : 'ghost'} 
              className={`w-full justify-start ${activeTab === 'likes' ? 'bg-primary text-black hover:bg-primary/90' : 'hover:bg-white/5'}`}
              onClick={() => setActiveTab('likes')}
            >
              <Heart className="w-4 h-4 mr-2" /> Liked Posts
            </Button>
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'ghost'} 
              className={`w-full justify-start ${activeTab === 'settings' ? 'bg-primary text-black hover:bg-primary/90' : 'hover:bg-white/5'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
            
            <hr className="border-white/5 my-4" />
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
              onClick={() => auth.signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details and statistics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <p className="text-sm text-white/50 mb-1">Account ID</p>
                    <p className="font-mono text-xs break-all">{user.uid}</p>
                  </div>
                  <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <p className="text-sm text-white/50 mb-1">Status</p>
                    <p className="text-primary font-bold">Active Supporter</p>
                  </div>
                  <div className="col-span-2 bg-black/50 p-4 rounded-xl border border-white/5 flex items-center justify-center py-8">
                     <p className="text-center text-white/40 text-sm">More profile features coming soon.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookmarks' && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader>
                <CardTitle>Saved Bookmarks</CardTitle>
                <CardDescription>Posts you've saved for later.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] flex items-center justify-center text-white/40 border-t border-white/5 pt-8 mt-4">
                You haven't bookmarked any posts yet.
              </CardContent>
            </Card>
          )}

          {activeTab === 'likes' && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader>
                <CardTitle>Liked Posts</CardTitle>
                <CardDescription>Your favorite content.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] flex items-center justify-center text-white/40 border-t border-white/5 pt-8 mt-4">
                You haven't liked any posts yet.
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4 border-t border-white/5 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Email Notifications</p>
                    <p className="text-white/50 text-xs">Receive updates and notifications via email</p>
                  </div>
                  <div className="w-11 h-6 bg-[#ccff00] rounded-full relative cursor-pointer opacity-50">
                    <div className="w-5 h-5 bg-black rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Direct Messages</p>
                    <p className="text-white/50 text-xs">Allow users to send you direct messages</p>
                  </div>
                  <div className="w-11 h-6 bg-[#ccff00] rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-black rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                 <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Private Account</p>
                    <p className="text-white/50 text-xs">Only approved followers can see your posts</p>
                  </div>
                  <div className="w-11 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white/50 rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}