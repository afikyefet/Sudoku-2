import {
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { socialAPI } from '../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await socialAPI.getNotifications(1, 1);
      if (response.success && response.data) {
        // This is a simplified way to get unread count
        // In a real app, you'd have a dedicated endpoint for this
        const notifications = await socialAPI.getNotifications(1, 50);
        if (notifications.success && notifications.data) {
          const unread = notifications.data.items.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Discover',
      href: '/discover',
      icon: MagnifyingGlassIcon,
      description: 'Find amazing puzzles'
    },
    {
      name: 'My Puzzles',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Your personal collection'
    },
  ];

  const menuItems = user
    ? [
      { name: 'Discover', href: '/discover' },
      { name: 'My Puzzles', href: '/dashboard' },
      { name: 'Profile', href: '/profile' },
    ]
    : [
      { name: 'Login', href: '/login' },
      { name: 'Register', href: '/register' },
    ];

  return (
    <HeroNavbar
      onMenuOpenChange={setIsMenuOpen}
      className="bg-content1 border-b border-default-200"
      maxWidth="full"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-lg p-2">
              <span className="text-xl font-bold">🧩</span>
            </div>
            <p className="font-bold text-foreground text-xl">Sudoku Pro</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {user && navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavbarItem key={item.name} isActive={isActive}>
              <Link
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                  ? 'text-primary bg-primary/10 font-medium'
                  : 'text-foreground hover:text-primary hover:bg-default-100'
                  }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NavbarItem>
              <Button
                variant="light"
                isIconOnly
                className="relative"
                onPress={() => navigate('/notifications')}
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    content={unreadCount > 99 ? '99+' : unreadCount}
                    color="danger"
                    size="sm"
                    className="absolute -top-1 -right-1"
                  />
                )}
              </Button>
            </NavbarItem>

            {/* User Menu */}
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform hover:scale-105"
                    color="primary"
                    name={user.displayName || user.username}
                    size="sm"
                    src={user.avatar}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{user.displayName || user.username}</p>
                    <p className="text-small text-default-500">@{user.username}</p>
                  </DropdownItem>
                  <DropdownItem
                    key="profile"
                    startContent={<UserIcon className="w-4 h-4" />}
                    as={Link}
                    to="/profile"
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem
                    key="dashboard"
                    startContent={<HomeIcon className="w-4 h-4" />}
                    as={Link}
                    to="/dashboard"
                  >
                    My Puzzles
                  </DropdownItem>
                  <DropdownItem
                    key="discover"
                    startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                    as={Link}
                    to="/discover"
                  >
                    Discover
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    startContent={<Cog6ToothIcon className="w-4 h-4" />}
                    as={Link}
                    to="/settings"
                  >
                    Settings
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onClick={handleLogout}
                    className="text-danger"
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </div>
        ) : (
          <div className="flex gap-2">
            <NavbarItem className="hidden lg:flex">
              <Link to="/login">
                <Button
                  variant={location.pathname === '/login' ? 'solid' : 'light'}
                  color="primary"
                >
                  Login
                </Button>
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link to="/register">
                <Button
                  variant={location.pathname === '/register' ? 'solid' : 'ghost'}
                  color="primary"
                >
                  Sign Up
                </Button>
              </Link>
            </NavbarItem>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              to={item.href}
              className={`w-full text-lg ${location.pathname === item.href
                ? 'text-primary font-medium'
                : 'text-foreground'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {user && (
          <NavbarMenuItem>
            <Button
              color="danger"
              variant="flat"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              Log Out
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
};

export default Navbar;