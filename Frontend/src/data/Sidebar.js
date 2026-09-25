import {
  faHome,
  faCashRegister,
  faReceipt,
  faBox,
  faTags,
  faPlusCircle,
  faUserTie,
  faChartLine,
  faChartBar,
  faCog,
  faUsers,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
// All data
export const adminSidebarSections = [
  {
    id: "main",
    title: "Main",
    sectionIcon: faHome,
    items: [
      {
        icon: faHome,
        label: "Dashboard",
        hint: "Overview of sales, orders, stats",
        to: "/admin",
        end: true,
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    sectionIcon: faCashRegister,
    items: [
      {
        icon: faCashRegister,
        label: "POS / New Order",
        hint: "Main selling screen",
        to: "/admin/pos",
      },
      {
        icon: faReceipt,
        label: "Orders",
        hint: "All current & past orders",
        to: "/admin/orders",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    sectionIcon: faBox,
    items: [
      {
        icon: faBox,
        label: "Products",
        hint: "Manage menu items (coffee, food)",
        to: "/admin/products",
      },
      {
        icon: faTags,
        label: "Categories",
        hint: "Coffee, Tea, Dessert, etc.",
        to: "/admin/categories",
      },
      {
        icon: faPlusCircle,
        label: "Sizes",
        hint: "Manage S, M, L, etc.",
        to: "/admin/sizes",
      },
    ],
  },
  {
    id: "users",
    title: "Users",
    sectionIcon: faUsers,
    items: [
      {
        icon: faUsers,
        label: "Cashier",
        hint: "Manage cashiers",
        to: "/admin/cashiers",
      },
      {
        icon: faUserTie,
        label: "Admin",
        hint: "Manage admins",
        to: "/admin/admins",
        superadminOnly: true,
      },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    sectionIcon: faChartLine,
    items: [
      {
        icon: faChartLine,
        label: "Sales Report",
        hint: "Overview the sale data",
        to: "/admin/reports/sales",
      },
      {
        icon: faChartBar,
        label: "Product Report",
        hint: "Best-selling items & trends",
        to: "/admin/reports/products",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    superadminOnly: true,
    sectionIcon: faSliders,
    items: [
      {
        icon: faCog,
        label: "General Settings",
        hint: "Shop info, VAT, promo",
        to: "/admin/settings",
        superadminOnly: true,
      },
    ],
  },
];

// First Open Main
export const adminSidebarInitiallyOpenId = "main";
