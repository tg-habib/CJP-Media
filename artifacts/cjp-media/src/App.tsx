import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Link } from "wouter";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Settings } from "lucide-react";

function ScrollRestorer() {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const HomePage = lazy(() => import("./pages/HomePage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminPostPage = lazy(() => import("./pages/AdminPostPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AdminFAB() {
  const [pathname] = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return (
    <Link
      href="/admin"
      className="fixed bottom-24 sm:bottom-6 right-4 z-[90] flex items-center gap-2 px-4 py-2.5 bg-[#ccff00] text-black font-bold text-[13px] rounded-full shadow-[0_4px_24px_rgba(204,255,0,0.35)] hover:bg-white hover:shadow-[0_4px_24px_rgba(255,255,255,0.25)] active:scale-95 transition-all select-none"
    >
      <Settings className="w-4 h-4" strokeWidth={2.5} />
      Admin
    </Link>
  );
}

function Router() {
  return (
    <>
      <ScrollRestorer />
      <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/post/:id" component={PostPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/post/:id" component={AdminPostPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/user/:uid" component={UserProfilePage} />
      <Route component={NotFoundPage} />
    </Switch>
    </>
  );
}

export default function App() {
  return (
    <div className="dark">
      <Toaster position="bottom-center" theme="dark" richColors />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
          <AdminFAB />
        </ErrorBoundary>
      </WouterRouter>
    </div>
  );
}
