import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import ArticleView from "@/pages/admin/article";
import ArticleCreate from "@/pages/admin/article-create";
import ArticleEdit from "@/pages/admin/article-edit";
import CategoriesView from "@/pages/admin/categories";
import CategoryView from "@/pages/admin/category";
import AdminDashboard from "@/pages/admin/dashboard";
import DepartmentsView from "@/pages/admin/departments";
import AdminLogin from "@/pages/admin/login";
import AdminSettings from "@/pages/admin/settings";
import AdminUsers from "@/pages/admin/users";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <main className="min-h-screen">
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/articles" component={DepartmentsView} />
          <Route path="/admin/articles/create" component={ArticleCreate} />
          <Route path="/admin/articles/edit/:id" component={ArticleEdit} />
          <Route path="/admin/articles/:slug" component={CategoriesView} />
          <Route
            path="/admin/articles/:department/:category"
            component={CategoryView}
          />
          <Route
            path="/admin/articles/:department/:category/:slug"
            component={ArticleView}
          />
          <Route component={NotFound} />
        </Switch>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <main>
        <Switch>
          <Route path="/">{() => <Home />}</Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
