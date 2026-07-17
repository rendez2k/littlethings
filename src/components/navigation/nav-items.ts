import {
  BarChart3,
  CalendarCheck,
  ListTodo,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Today', icon: CalendarCheck },
  { href: '/habits', label: 'Habits', icon: ListTodo },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];
