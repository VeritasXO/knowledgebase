import { SidebarButton } from "@/components/admin/sidebar-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { WebsiteSwitcher } from "@/components/website-switcher";
import { useUserAccount } from "@/hooks/use-current-user";
import { ADMIN_ROLES } from "@shared/constants";
import {
  BookIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useLocation } from "wouter";

// SVG background component using external file
import backgroundSvg from "@/assets/becovic-b.svg";

interface SidebarNavProps {
  onNavigate?: () => void;
  onLogout: () => Promise<void>;
}

export function SidebarNav({ onNavigate, onLogout }: SidebarNavProps) {
  const [location, setLocation] = useLocation();
  const { data: userAccount } = useUserAccount();

  // Check if the user is a super admin
  const isAdmin = userAccount?.role === ADMIN_ROLES.ADMIN;

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="bottom-[70px] top-[70px] border-primary absolute inset-0 flex items-end justify-center overflow-visible pointer-events-none">
        <img
          src={backgroundSvg}
          className="h-[330px] max-w-none opacity-[0.07] dark:opacity-[0.04]"
        />
      </div>
      <div className="border-b-2 border-primary/30 h-[70px] flex items-center px-2 z-10">
        <WebsiteSwitcher />
      </div>
      <div className="py-4 px-2 flex-grow z-10">
        <ul className="space-y-2">
          <li>
            <SidebarButton
              icon={HomeIcon}
              label="Dashboard"
              isActive={location === "/admin/dashboard"}
              onClick={() => handleNavigation("/admin/dashboard")}
            />
          </li>
          <li>
            <SidebarButton
              icon={BookIcon}
              label="Articles"
              isActive={location.startsWith("/admin/articles")}
              onClick={() => handleNavigation("/admin/articles")}
            />
          </li>
          {isAdmin && (
            <li>
              <SidebarButton
                icon={UsersIcon}
                label="Users"
                isActive={location === "/admin/users"}
                onClick={() => handleNavigation("/admin/users")}
              />
            </li>
          )}
          {isAdmin && (
            <li>
              <SidebarButton
                icon={SettingsIcon}
                label="Settings"
                isActive={location === "/admin/settings"}
                onClick={() => handleNavigation("/admin/settings")}
              />
            </li>
          )}
        </ul>
      </div>{" "}
      <div className="py-2.5 px-3.5 border-t-2 border-primary/30 mt-auto z-10">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="border-primary/20 p-2 rounded-md"
            onClick={onLogout}
            size="icon"
            aria-label="Logout"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
