import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Boxes,
  Power,
  Settings,
  BarChart3,
  BookOpen,
  CreditCard,
  Factory,
  FileText,
  MessageCircle,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
} from "lucide-react";

import StaffManagement from "./staff/StaffManagement";
import AccessControl from "./access-control/AccessControl";
import KillSwitch from "./kill-switch/KillSwitch";
import SystemSettings from "./system-settings/SystemSettings";
import ComingSoon from "../components/ComingSoon";
import Inventory from "../Modules/inventory/Inventory";
import Product from "../Modules/product/Product";
import Purchase from "../Modules/purchase/Purchase";
import Production from "../Modules/production/Production";
import Dispatch from "../Modules/dispatch/Dispatch";
import SaleBill from "../Modules/sale-bill/SaleBill";
import Payment from "../Modules/payment/Payment";
import Ledger from "../Modules/ledger/Ledger";
import LR from "../Modules/lr/LR";

export const DASHBOARD_SECTION = "dashboard";

/**
 * Single source of truth for every navigable section.
 *
 * guard:
 *  - "open"        -> visible to every authenticated role
 *  - "super-admin" -> visible to Super Admin only
 *  - "module"      -> requires access.modules[module] (Super Admin bypasses)
 *
 * `module` must match the keys used by the User model access map
 * (see server/src/models/User.js -> defaultModules).
 */
export const superAdminSections = [
  {
    id: DASHBOARD_SECTION,
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "management",
    guard: "open",
    Element: null,
  },
  {
    id: "staff",
    label: "Staff",
    icon: Users,
    group: "management",
    guard: "super-admin",
    Element: StaffManagement,
  },
  {
    id: "access",
    label: "Access",
    icon: ShieldCheck,
    group: "management",
    guard: "super-admin",
    Element: AccessControl,
  },
  {
    id: "modules",
    label: "Modules",
    icon: Boxes,
    group: "management",
    guard: "super-admin",
    Element: ComingSoon,
  },
  {
    id: "kill-switch",
    label: "Kill Switch",
    icon: Power,
    group: "management",
    guard: "super-admin",
    Element: KillSwitch,
  },
  {
    id: "system-settings",
    label: "System Settings",
    icon: Settings,
    group: "management",
    guard: "super-admin",
    Element: SystemSettings,
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    group: "erp",
    guard: "module",
    module: "inventory",
    Element: Inventory,
  },
  {
    id: "product",
    label: "Product",
    icon: Package,
    group: "erp",
    guard: "module",
    module: "product",
    Element: Product,
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: ShoppingCart,
    group: "erp",
    guard: "module",
    module: "purchase",
    Element: Purchase,
  },
  {
    id: "production",
    label: "Production",
    icon: Factory,
    group: "erp",
    guard: "module",
    module: "production",
    Element: Production,
  },
  {
    id: "dispatch",
    label: "Dispatch",
    icon: Truck,
    group: "erp",
    guard: "module",
    module: "dispatch",
    Element: Dispatch,
  },
  {
    id: "sale-bill",
    label: "Sale Bill",
    icon: Receipt,
    group: "erp",
    guard: "module",
    module: "sale_bill",
    Element: SaleBill,
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    group: "erp",
    guard: "module",
    module: "payment",
    Element: Payment,
  },
  {
    id: "ledger",
    label: "Ledger",
    icon: BookOpen,
    group: "erp",
    guard: "module",
    module: "ledger",
    Element: Ledger,
  },
  {
    id: "lr",
    label: "LR",
    icon: FileText,
    group: "erp",
    guard: "module",
    module: "lr",
    Element: LR,
  },
  {
    id: "whatsapp-ai",
    label: "WhatsApp AI",
    icon: MessageCircle,
    group: "erp",
    guard: "module",
    module: "whatsapp_ai",
    Element: ComingSoon,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    group: "erp",
    guard: "module",
    module: "reports",
    Element: ComingSoon,
  },
];

export const groupLabels = {
  management: "Management",
  erp: "ERP",
};

export const findSection = (sectionId) =>
  superAdminSections.find((section) => section.id === sectionId) || null;

export const canViewSection = (section, { isSuperAdmin, canAccessModule }) => {
  if (!section) return false;
  if (section.guard === "open") return true;
  if (section.guard === "super-admin") return Boolean(isSuperAdmin);
  if (section.guard === "module") return canAccessModule(section.module);
  return false;
};

export const visibleSectionsFor = ({ isSuperAdmin, canAccessModule }) =>
  superAdminSections.filter((section) =>
    canViewSection(section, { isSuperAdmin, canAccessModule })
  );

export const groupSections = (sections = []) =>
  Object.entries(groupLabels)
    .map(([id, label]) => ({
      id,
      label,
      items: sections.filter((section) => section.group === id),
    }))
    .filter((group) => group.items.length > 0);
