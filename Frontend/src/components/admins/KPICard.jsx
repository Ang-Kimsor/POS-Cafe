import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faShoppingCart,
  faUserTie,
  faBox,
  faChartLine,
  faArrowTrendUp,
  faPercentage,
} from "@fortawesome/free-solid-svg-icons";

export default function KPICard({ title, value, desc, breakdown, today }) {
  const config = {
    "Total Sales": {
      icon: faDollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
      shadow: "hover:shadow-emerald-500/20",
    },
    Orders: {
      icon: faShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "bg-blue-500",
      shadow: "hover:shadow-blue-500/20",
    },
    "Today Revenue": {
      icon: faDollarSign,
      color: "text-teal-600",
      bg: "bg-teal-50",
      accent: "bg-teal-500",
      shadow: "hover:shadow-teal-500/20",
    },
    "Today Orders": {
      icon: faShoppingCart,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      accent: "bg-cyan-500",
      shadow: "hover:shadow-cyan-500/20",
    },
    Users: {
      icon: faUserTie,
      color: "text-orange-600",
      bg: "bg-orange-50",
      accent: "bg-orange-500",
      shadow: "hover:shadow-orange-500/20",
    },
    Staff: {
      icon: faUserTie,
      color: "text-orange-600",
      bg: "bg-orange-50",
      accent: "bg-orange-500",
      shadow: "hover:shadow-orange-500/20",
    },
    Products: {
      icon: faBox,
      color: "text-purple-600",
      bg: "bg-purple-50",
      accent: "bg-purple-500",
      shadow: "hover:shadow-purple-500/20",
    },
    "Total Revenue": {
      icon: faDollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
      shadow: "hover:shadow-emerald-500/20",
    },
    "Filtered Items": {
      icon: faBox,
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "bg-amber-500",
      shadow: "hover:shadow-amber-500/20",
    },
    "Top Product": {
      icon: faArrowTrendUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "bg-blue-500",
      shadow: "hover:shadow-blue-500/20",
    },
    "Avg. Order Value": {
      icon: faShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "bg-blue-500",
      shadow: "hover:shadow-blue-500/20",
    },
    "Total Discounts": {
      icon: faPercentage,
      color: "text-orange-600",
      bg: "bg-orange-50",
      accent: "bg-orange-500",
      shadow: "hover:shadow-orange-500/20",
    },
  }[title] || {
    icon: faChartLine,
    color: "text-gray-600",
    bg: "bg-gray-50",
    accent: "bg-gray-500",
    shadow: "hover:shadow-gray-500/20",
  };

  return (
    <div className={`relative bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center ${config.color}`}>
           <FontAwesomeIcon icon={config.icon} className="text-lg" />
        </div>
        <div className="flex-1 ml-3 text-right">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide line-clamp-1">
             {title}
           </p>
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {value}
        </h1>
        {breakdown ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {breakdown.cashier ?? 0} Cashier
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              {breakdown.admin ?? 0} Admin
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              {breakdown.superadmin ?? 0} Superadmin
            </span>
          </div>
        ) : today ? (
          <div className="mt-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block uppercase tracking-wide">
               + {today} Today
            </span>
          </div>
        ) : desc ? (
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
            {desc}
          </p>
        ) : null}
      </div>
    </div>
  );
}
