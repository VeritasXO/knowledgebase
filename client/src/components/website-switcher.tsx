import becovicLogo from "@/assets/becovic-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientSettings } from "@/hooks/use-settings";
import { ChevronDownIcon } from "lucide-react";

interface WebsiteSwitcherProps {
  className?: string;
}

export function WebsiteSwitcher({ className = "" }: WebsiteSwitcherProps) {
  const { data: settings } = useClientSettings();

  // Handle website switching
  const handleWebsiteSwitch = (url: string) => {
    window.location.href = url;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center gap-2 transition-colors w-full cursor-pointer ${className}`}
          aria-label="Select website"
        >
          <div className="flex items-center gap-2 flex-1">
            <img src={becovicLogo} alt="Becovic Logo" className="h-7 w-7" />
            <h1 className="text-lg truncate">
              {settings?.websiteTitle || "Becovic Systems"}
            </h1>
          </div>
          <ChevronDownIcon className="h-4 w-4 opacity-70" aria-hidden="true" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuItem
          onClick={() =>
            handleWebsiteSwitch(
              "https://calendar.becovicsystems.com/admin/login",
            )
          }
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <img src={becovicLogo} alt="Becovic Logo" className="h-6 w-6" />
            <span>Elevator Booking</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            handleWebsiteSwitch("https://surveys.becovicsystems.com/")
          }
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <img src={becovicLogo} alt="Becovic Logo" className="h-6 w-6" />
            <span>Survey Tracker</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            handleWebsiteSwitch("https://guestcards.becovicsystems.com/")
          }
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <img src={becovicLogo} alt="Becovic Logo" className="h-6 w-6" />
            <span>Guest Card Parser</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            handleWebsiteSwitch("https://knowledge.becovicsystems.com/")
          }
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <img src={becovicLogo} alt="Becovic Logo" className="h-6 w-6" />
            <span>Knowledge Base</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
