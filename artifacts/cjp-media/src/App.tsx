import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import FeedPage from "./pages/FeedPage";
import PostPage from "./pages/PostPage";
import CategoryPage from "./pages/CategoryPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFoundPage from "./pages/NotFoundPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/post/:id" component={PostPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function App() {
  return (
    <div className="dark">
      <Toaster position="bottom-center" theme="dark" richColors />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </div>
  );
}
