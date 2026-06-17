const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

const startBlock = `  return (
    <>
      {activeTab === 'dashboard' ? (
        <DashboardTab posts={posts} setActiveTab={setActiveTab} />
      ) : (
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-6xl min-h-screen pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight text-white flex items-center gap-3">
              Admin <span className="text-primary font-serif italic font-normal">Command Center</span>
            </h1>
            <p className="text-muted-foreground">Manage your content, view analytics, and orchestrate the platform.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10" onClick={() => router.push('/')}>
              Exit Admin
            </Button>
            <Button 
              className="bg-primary text-black font-bold hover:bg-primary/90"
              onClick={() => {
                handleCancelEdit();
                setActiveTab('editor');
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> New Roast
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2 mb-8 inline-block w-full overflow-x-auto">
            <TabsList className="bg-transparent justify-start w-max md:w-full h-auto p-0">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold text-muted-foreground gap-2">
                <BarChart3 className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold text-muted-foreground gap-2">
                <FileText className="w-4 h-4" /> Manage Arsenal
              </TabsTrigger>
              <TabsTrigger value="editor" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold text-muted-foreground gap-2">
                <Edit className="w-4 h-4" /> {editingId ? 'Edit Draft' : 'New Deployment'}
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold text-muted-foreground gap-2">
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl px-6 py-3 font-semibold text-muted-foreground gap-2">
                <Settings className="w-4 h-4" /> Platform Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* DASHBOARD TAB OMITTED HERE - IT IS RENDERED ABOVE */}
        <AnimatePresence mode="wait">
        <TabsContent value="dashboard">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">`;

const replacement1 = `  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={\`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0c0c0c] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}>
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
                     <Image src={profileAvatarUrl || '/placeholder.png'} alt="Admin" fill className="object-cover" />
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
                           className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all \${isActive ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'text-white/60 hover:text-white hover:bg-white/5'} \${item.soon ? 'cursor-default opacity-50' : ''}\`}
                         >
                           <div className="flex items-center gap-3">
                              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                              <span className={\`text-sm \${isActive ? 'font-semibold' : 'font-medium'}\`}>{item.label}</span>
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
         {/* Mobile Header */}
         <div className="lg:hidden h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a] z-30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full border border-[#ccff00]/30 flex items-center justify-center relative overflow-hidden bg-[#ccff00]/10">
                  <Flame className="w-4 h-4 text-[#ccff00]" />
               </div>
               <h1 className="font-bold text-sm">CJP Admin</h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-white/60 hover:text-white">
               <Menu className="w-6 h-6" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto">
           {activeTab === 'dashboard' && <DashboardTab posts={posts} setActiveTab={setActiveTab} />}
           {activeTab !== 'dashboard' && (
             <div className="container mx-auto px-4 py-8 lg:py-10 max-w-6xl pb-32">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                 <div>
                   <h1 className="text-3xl font-black mb-1 text-white capitalize">{activeTab === 'manage' ? 'Manage Arsenal' : activeTab === 'editor' ? (editingId ? 'Refine Strategy' : 'Deploy Content') : activeTab}</h1>
                   <p className="text-sm text-white/50">Administer the system and orchestrate the platform.</p>
                 </div>
                 <div className="flex gap-3">
                   <Button variant="outline" className="border-white/10" onClick={() => router.push('/')}>
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

               <AnimatePresence mode="wait">
                 {/* Fake dashboard wrapper so code doesn't break */}
                 {false && <motion.div className="hidden">`;

code = code.replace(startBlock, replacement1);


// Middle tabs closing replacements
code = code.replace(`        </TabsContent>
        </AnimatePresence>

        {/* MANAGE TAB */}
        <AnimatePresence mode="wait">
        <TabsContent value="manage">`, `                 </motion.div>}
               </AnimatePresence>

               {/* MANAGE TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'manage' && (`);

code = code.replace(`        </TabsContent>
        </AnimatePresence>

        {/* EDITOR TAB */}
        <AnimatePresence mode="wait">
        <TabsContent value="editor">`, `               )}
               </AnimatePresence>

               {/* EDITOR TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'editor' && (`);

code = code.replace(`        </TabsContent>
        </AnimatePresence>

        {/* PROFILE TAB */}
        <AnimatePresence mode="wait">
        <TabsContent value="profile">`, `               )}
               </AnimatePresence>

               {/* PROFILE TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'profile' && (`);

code = code.replace(`        </TabsContent>
        </AnimatePresence>

        {/* SETTINGS TAB */}
        <AnimatePresence mode="wait">
        <TabsContent value="settings">`, `               )}
               </AnimatePresence>

               {/* SETTINGS TAB */}
               <AnimatePresence mode="wait">
               {activeTab === 'settings' && (`);


const bottomBlock = `        </TabsContent>
        </AnimatePresence>
      </Tabs>
      </div>
      )}

      {/* Global Admin Bottom Navigation */}
      <div className={\`fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 py-3 px-6 flex justify-between items-center z-50 \${activeTab === 'dashboard' ? '' : 'md:hidden'}\`}>
         <button onClick={() => setActiveTab('dashboard')} className="flex flex-col items-center gap-1.5 focus:outline-none">
            <Home className={\`w-[22px] h-[22px] \${activeTab === 'dashboard' ? 'text-[#ccff00]' : 'text-white/50'}\`} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className={\`text-[10px] \${activeTab === 'dashboard' ? 'font-semibold text-[#ccff00]' : 'font-medium text-white/50'}\`}>Dashboard</span>
         </button>
         <button onClick={() => setActiveTab('manage')} className="flex flex-col items-center gap-1.5 focus:outline-none">
            <FileText className={\`w-[22px] h-[22px] \${activeTab === 'manage' ? 'text-[#ccff00]' : 'text-white/50'}\`} strokeWidth={activeTab === 'manage' ? 2.5 : 2} />
            <span className={\`text-[10px] \${activeTab === 'manage' ? 'font-semibold text-[#ccff00]' : 'font-medium text-white/50'}\`}>Posts</span>
         </button>
         <button className="flex flex-col items-center gap-1.5 focus:outline-none">
            <Users className="w-[22px] h-[22px] text-white/50" />
            <span className="text-[10px] font-medium text-white/50">Users</span>
         </button>
         <button className="flex flex-col items-center gap-1.5 focus:outline-none">
            <BarChart2 className="w-[22px] h-[22px] text-white/50" />
            <span className="text-[10px] font-medium text-white/50">Reports</span>
         </button>
         <button onClick={() => setActiveTab('settings')} className="flex flex-col items-center gap-1.5 focus:outline-none">
            <MoreHorizontal className={\`w-[22px] h-[22px] \${activeTab === 'settings' ? 'text-[#ccff00]' : 'text-white/50'}\`} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className={\`text-[10px] \${activeTab === 'settings' ? 'font-semibold text-[#ccff00]' : 'font-medium text-white/50'}\`}>More</span>
         </button>
      </div>
    </>
  );
}`;

const replacementBottom = `               )}
               </AnimatePresence>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}`;

code = code.replace(bottomBlock, replacementBottom);

fs.writeFileSync('src/app/admin/page.tsx', code);
console.log("Replacement done");
