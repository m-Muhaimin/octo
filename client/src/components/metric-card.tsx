import { Button } from "@/components/ui/button";
import { ArrowRight, Users, CalendarCheck, DollarSign, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MetricCardProps {
  icon: string;
  title: string;
  value: string;
  growth: string;
  "data-testid"?: string;
}

export default function MetricCard({ icon, title, value, growth, "data-testid": testId }: MetricCardProps) {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "users":
        return Users;
      case "calendar-check":
        return CalendarCheck;
      case "dollar-sign":
        return DollarSign;
      case "procedures":
        return Activity;
      default:
        return Activity;
    }
  };

  const IconComponent = getIconComponent(icon);

  return (
    <div className="bg-white rounded-[17px] p-5 border border-gray-200 shadow-sm" data-testid={testId}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-[11px] flex items-center justify-center">
          <IconComponent className="h-4 w-4 text-text-secondary" />
        </div>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          {growth}
        </span>
      </div>
      <p className="text-text-secondary text-xs mb-1">{title}</p>
      <p className="text-2xl font-bold text-text-primary mb-2" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
        {value}
      </p>
      <Button 
        onClick={() => toast({ title: `${title} details page coming soon!` })}
        variant="ghost" 
        className="text-medisight-teal text-xs font-medium p-0 h-auto flex items-center space-x-1 hover:text-medisight-dark-teal transition-colors"
        data-testid={`button-see-details-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span>See details</span>
        <ArrowRight className="w-3 h-3" />
      </Button>
    </div>
  );
}
