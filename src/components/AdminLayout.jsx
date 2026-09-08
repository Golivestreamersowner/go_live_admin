import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Package,
  CreditCard,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Layers,
  QrCode,
  Store,
  ShoppingBag,
  ShoppingCart,
  Tags,
  ClipboardList,
  Star,
  Wallet,
  Flag,
  FileWarning,
  Ban,
  Gift,
  Newspaper,
  DollarSign,
  ArrowDownToLine,
  Sparkles,
  UserPlus,
  ShieldHalf,
  Crown,
  TrendingUp,
  BadgeCheck,
  Gem,
  LifeBuoy,
  Building2,
  Bell,
  AlertTriangle,
  Share2,
  SlidersHorizontal,
  Trophy,
  Radio,
  Send,
  Megaphone,
  Palette,
} from 'lucide-react';
import { supportService } from '../services/supportService';

const AdminLayout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Which grouped-menu sections are expanded, keyed by groupKey — generic so
  // any number of groups (subscription, ecommerce, marketplace, ...) can
  // auto-expand independently instead of hardcoding one state var per group.
  const groupPaths = {
    subscription: ['/packages', '/subscriptions', '/subscription-stats'],
    ecommerce: ['/vendors', '/products', '/categories', '/orders', '/reviews', '/payouts'],
    marketplace: [
      '/marketplace/products',
      '/marketplace/cost-table',
      '/marketplace/settings',
      '/marketplace/orders',
      '/marketplace/earnings',
    ],
  };
  const [openGroups, setOpenGroups] = React.useState(() => {
    const initial = {};
    for (const [key, paths] of Object.entries(groupPaths)) {
      initial[key] = paths.includes(location.pathname);
    }
    return initial;
  });

  // Auto-expand a group when navigating directly to one of its pages.
  React.useEffect(() => {
    for (const [key, paths] of Object.entries(groupPaths)) {
      if (paths.includes(location.pathname) && !openGroups[key]) {
        setOpenGroups((prev) => ({ ...prev, [key]: true }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Poll open-ticket count for the sidebar badge
  const [openTicketCount, setOpenTicketCount] = React.useState(0);
  React.useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const stats = await supportService.getStats();
        if (!cancelled) setOpenTicketCount(stats?.unread || stats?.open || 0);
      } catch {
        /* ignore — user may not be authed yet */
      }
    };
    refresh();
    const id = setInterval(refresh, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'App Stability',
      href: '/stabilization',
      icon: ShieldHalf,
    },
    {
      name: 'User Management',
      href: '/users',
      icon: Users,
    },
    {
      name: 'Sponsored creators',
      href: '/sponsored-creators',
      icon: Sparkles,
    },
    {
      name: 'Icon Recruiter',
      href: '/icon-recruiter',
      icon: UserPlus,
    },
    {
      name: 'Agencies',
      href: '/agencies',
      icon: Building2,
    },
    {
      name: 'Money Flow',
      href: '/finance',
      icon: TrendingUp,
    },
    {
      name: 'Top Spenders',
      href: '/topspenders',
      icon: Crown,
    },
    {
      name: 'Premium subscribers',
      href: '/premium-subscribers',
      icon: BadgeCheck,
    },
    {
      name: 'Referrals',
      href: '/referrals',
      icon: Share2,
    },
    {
      name: 'Reported Users',
      href: '/reported-users',
      icon: Flag,
    },
    {
      name: 'IP Bans',
      href: '/ip-bans',
      icon: Ban,
    },
    {
      name: 'Reported Posts',
      href: '/reported-posts',
      icon: FileWarning,
    },
    // {
    //   name: 'Cash out management',
    //   href: '/cashout-requests',
    //   icon: Wallet,
    // },
    {
      name: 'Withdraw Requests',
      href: '/withdraw-requests',
      icon: ArrowDownToLine,
    },
    {
      name: 'Streamers & rubies',
      href: '/streamers-rubies',
      icon: Gem,
      pathMatch: 'prefix',
      pathExclude: ['/user-stream-earnings'],
    },
    {
      name: 'User stream earnings',
      href: '/user-stream-earnings',
      icon: Radio,
    },
    {
      name: 'Live streams',
      href: '/live-streams',
      icon: Radio,
    },
    {
      name: 'Cash out email change',
      href: '/cashout-email-change',
      icon: ClipboardList,
    },
    // {
    //   name: 'Cashout Options',
    //   href: '/cashout-options',
    //   icon: DollarSign,
    // },
    {
      name: 'Gifter recipients',
      href: '/gifter-recipients',
      icon: Send,
    },
    {
      name: 'Gifts',
      href: '/gifts',
      icon: Gift,
    },
    {
      name: 'Gift categories',
      href: '/gift-categories',
      icon: Tags,
    },
    {
      name: 'Blog',
      href: '/blogs',
      icon: Newspaper,
      pathMatch: 'prefix',
    },
    {
      name: 'Contests',
      href: '/contests',
      icon: Trophy,
    },
    {
      name: 'Banners',
      href: '/banners',
      icon: Megaphone,
    },
    {
      name: 'Support Tickets',
      href: '/support',
      icon: LifeBuoy,
      badge: openTicketCount,
      pathMatch: 'prefix',
      pathExclude: ['/support/settings'],
    },
    {
      name: 'Support Settings',
      href: '/support/settings',
      icon: Bell,
    },
    {
      name: 'IAP Management',
      href: '/iap',
      icon: ShieldCheck,
    },
    {
      name: 'Features Allowed',
      href: '/features-allowed',
      icon: SlidersHorizontal,
    },
    {
      name: 'App Theme',
      href: '/theme',
      icon: Palette,
    },
    {
      name: 'Marketplace',
      icon: ShoppingCart,
      isGroup: true,
      groupKey: 'marketplace',
      children: [
        { name: 'Products', href: '/marketplace/products', icon: BadgeCheck },
        { name: 'Cost Table', href: '/marketplace/cost-table', icon: Tags },
        { name: 'Settings', href: '/marketplace/settings', icon: Settings },
        { name: 'Orders', href: '/marketplace/orders', icon: ClipboardList },
        { name: 'Earnings', href: '/marketplace/earnings', icon: DollarSign },
      ],
    },
    // {
    //   name: 'QR Codes',
    //   href: '/qr-codes',
    //   icon: QrCode,
    // },
    // {
    //   name: 'Ecommerce',
    //   icon: ShoppingCart,
    //   isGroup: true,
    //   groupKey: 'ecommerce',
    //   children: [
    //     {
    //       name: 'Vendors',
    //       href: '/vendors',
    //       icon: Store,
    //     },
    //     {
    //       name: 'Products',
    //       href: '/products',
    //       icon: ShoppingBag,
    //     },
    //     {
    //       name: 'Categories',
    //       href: '/categories',
    //       icon: Tags,
    //     },
    //     {
    //       name: 'Orders',
    //       href: '/orders',
    //       icon: ClipboardList,
    //     },
    //     {
    //       name: 'Reviews',
    //       href: '/reviews',
    //       icon: Star,
    //     },
    //     {
    //       name: 'Payouts',
    //       href: '/payouts',
    //       icon: Wallet,
    //     },
    //   ],
    // },
    // {
    //   name: 'Subscriptions',
    //   icon: Layers,
    //   isGroup: true,
    //   children: [
    //     {
    //       name: 'Packages',
    //       href: '/packages',
    //       icon: Package,
    //     },
    //     {
    //       name: 'Subscriptions',
    //       href: '/subscriptions',
    //       icon: CreditCard,
    //     },
    //     {
    //       name: 'Analytics',
    //       href: '/subscription-stats',
    //       icon: BarChart3,
    //     },
    //   ],
    // },
    // {
    //   name: 'Settings',
    //   href: '/settings',
    //   icon: Settings,
    // },
  ];

  // Super-admin-only entries. Hidden for moderators. Matches the backend
  // requireSuperAdmin gate (role === "admin"); also honours shape variants
  // used elsewhere (role.name/role.level) for defence in depth.
  const isSuperAdmin = (() => {
    const roleField = user?.role;
    const name = (roleField?.name || roleField || '').toString().toUpperCase();
    const level = roleField?.level;
    return level >= 5 || name === 'ADMIN' || name === 'SUPER_ADMIN';
  })();

  if (isSuperAdmin) {
    navigation.push({
      name: 'Fraud cascade',
      href: '/fraud-cascade',
      icon: AlertTriangle,
    });
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  const isNavItemActive = (item) => {
    if (item.pathMatch === 'prefix') {
      if (!location.pathname.startsWith(item.href)) return false;
      if (Array.isArray(item.pathExclude) && item.pathExclude.some((p) => location.pathname.startsWith(p))) return false;
      return true;
    }
    return location.pathname === item.href;
  };

  const isGroupActive = (children) => {
    return children.some(child => location.pathname === child.href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              if (item.isGroup) {
                const isMenuOpen = openGroups[item.groupKey];
                const toggleMenu = () => toggleGroup(item.groupKey);

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={toggleMenu}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                        isGroupActive(item.children)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {isMenuOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isMenuOpen && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                                isActive(child.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <ChildIcon className="w-4 h-4" />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                    isNavItemActive(item)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white lg:overflow-hidden">
        <div className="flex shrink-0 items-center border-b px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            if (item.isGroup) {
              const isMenuOpen = openGroups[item.groupKey];
              const toggleMenu = () => toggleGroup(item.groupKey);

              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={toggleMenu}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                      isGroupActive(item.children)
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {isMenuOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isMenuOpen && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                              isActive(child.href)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isNavItemActive(item)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.name}</span>
                {item.badge > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t p-4">
          {user && (
            <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-md">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.role?.name || 'Admin'}
                </div>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.role?.name || 'Admin'} • {user.email}
                  </div>
                </div>
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func,
};

export default AdminLayout;