import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useLocation } from 'wouter';

import { Badge } from './ui/badge';


export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  // Open search via hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch top 100 recent posts once when opened
  useEffect(() => {
    if (isOpen && posts.length === 0) {
      setLoading(true);
      const fetchPosts = async () => {
        try {
          const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
          const snap = await getDocs(q);
          const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPosts(fetched);
          setFilteredPosts(fetched);
        } catch (error) {
          console.error("Error fetching for search:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = posts.filter(p => 
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(term)))
    );
    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-12 h-12 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            />
            
            {/* Search Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-[10%] inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-[101] bg-card/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Search Input Area */}
              <div className="relative border-b border-white/10 p-4 shrink-0">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search articles, roasts, or topics..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none text-xl md:text-2xl text-white placeholder:text-white/30 focus:outline-none pl-14 pr-12 py-4"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Results Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                    <p>Loading the archive...</p>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredPosts.map(post => (
                      <div 
                        key={post.id}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/post/${post.id}`);
                        }}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-black/50">
                          <img 
                            src={post.imageUrls?.[0] || post.image || post.imageUrl || post.coverImage || 'https://picsum.photos/seed/placeholder/800/600'}
                            alt=""
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold truncate group-hover:text-primary transition-colors">{post.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/50 capitalize font-medium">{post.category}</span>
                            {post.tags && post.tags.length > 0 && (
                              <>
                                <span className="text-white/20">•</span>
                                <span className="text-xs text-white/40 truncate">{post.tags.slice(0, 3).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No results found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-black/20 text-xs text-center text-white/40 shrink-0">
                Press <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/60 mx-1">ESC</kbd> to close
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
