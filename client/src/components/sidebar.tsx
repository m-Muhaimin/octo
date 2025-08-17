import { 
  User, Crown, ChevronDown, X, LayoutDashboard, Users, MessageSquare, 
  Calendar, Bot, FileText, CreditCard, Settings, MessageCircle, 
  HelpCircle, Stethoscope 
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import UserMenu from "@/components/modals/user-menu";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: Bot, label: "AI Scheduling", path: "/ai-scheduling" },
    { icon: FileText, label: "Billing", path: "/billing" },
    { icon: CreditCard, label: "Transactions", path: "/transactions" },
  ];

  const toolItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: MessageCircle, label: "Chat & Support", path: null },
    { icon: HelpCircle, label: "Help Center", path: null },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white shadow-sm border-r-[5px] border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-medisight-teal rounded-md flex items-center justify-center">
                <Stethoscope className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-base text-text-primary">Medisight</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              data-testid="button-sidebar-toggle"
            >
              <X className="h-5 w-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigationItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    setLocation(item.path);
                    if (window.innerWidth < 1024) {
                      onToggle(); // Close sidebar on mobile after navigation
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    location === item.path || (location === "/" && item.path === "/dashboard")
                      ? "bg-medisight-teal text-white"
                      : "text-text-secondary hover:bg-gray-50"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Tools Section */}
          <div className="mt-6">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide px-3 mb-2">
              Tools
            </p>
            <ul className="space-y-1">
              {toolItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      if (item.path) {
                        setLocation(item.path);
                        if (window.innerWidth < 1024) {
                          onToggle(); // Close sidebar on mobile after navigation
                        }
                      } else {
                        toast({ title: `${item.label} feature coming soon!` });
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      location === item.path
                        ? "bg-medisight-teal text-white"
                        : "text-text-secondary hover:bg-gray-50"
                    }`}
                    data-testid={`tool-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Upgrade Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-medisight-teal bg-opacity-10 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-medisight-teal rounded-full flex items-center justify-center">
                <Crown className="text-white w-3 h-3" />
              </div>
              <div>
                <p className="font-medium text-xs text-text-primary">Upgrade to premium</p>
                <p className="text-xs text-text-secondary">
                  Upgrade your account to premium to get more features.
                </p>
              </div>
            </div>
            <button 
              onClick={() => toast({ title: "Upgrade feature coming soon!" })}
              className="w-full bg-text-primary text-white py-1.5 px-3 rounded-md text-xs font-medium hover:bg-gray-800 transition-colors"
              data-testid="button-upgrade-plan"
            >
              Upgrade plan
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600 w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-xs text-text-primary">Robert Fox</p>
              <p className="text-xs text-text-secondary">robertfox@email.com</p>
            </div>
            <UserMenu>
              <button className="text-text-secondary hover:text-text-primary" data-testid="button-user-dropdown">
                <ChevronDown className="w-3 h-3" />
              </button>
            </UserMenu>
          </div>
        </div>
      </div>
    </>
  );
}