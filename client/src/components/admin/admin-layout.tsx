import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserAccount } from "@/hooks/use-current-user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Menu } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";

export interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { isLoading, isError } = useUserAccount();

  // Redirect to login if session is invalid
  useEffect(() => {
    if (isError && !isLoading) {
      setLocation("/admin/login");
    }
  }, [isError, isLoading, setLocation]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      // Invalidate the admin session query
      queryClient.invalidateQueries();
      setLocation("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // If loading or error, show nothing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-background">
      {/* Mobile Header with Hamburger Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 border-b-2 border-primary/30 bg-muted flex justify-between h-[80px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0 mx-2"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-56 border-r-2 border-primary/30 bg-muted"
              aria-label="Navigation menu"
            >
              <div className="h-full flex flex-col">
                <SidebarNav
                  onNavigate={() => setOpen(false)}
                  onLogout={handleLogout}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-col justify-start min-w-0 overflow-hidden">
            <h1 className="text-xl font-bold truncate">{title}</h1>
            <div className="h-5">
              {description && (
                <span className="text-sm text-muted-foreground truncate">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Fixed position */}
      <nav className="hidden md:flex w-56 h-screen bg-muted border-r-2 border-primary/30 fixed left-0 top-0 flex-col">
        <SidebarNav onLogout={handleLogout} />
      </nav>

      {/* Main Content Area - with proper margin */}
      <div className="flex-1 md:ml-56 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden md:flex border-b-2 border-primary/30 px-4 justify-between bg-muted sticky top-0 z-10 h-[70px] bg-gradient-to-l from-primary/15 to-muted">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="h-4">
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - this is the scrollable area */}
        <main className="overflow-auto p-4 pb-10 pt-24 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
