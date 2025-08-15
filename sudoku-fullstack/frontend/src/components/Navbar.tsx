import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user
    ? [
        { name: 'Dashboard', href: '/dashboard' },
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

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {user && (
          <NavbarItem isActive={location.pathname === '/dashboard'}>
            <Link
              to="/dashboard"
              className={`${
                location.pathname === '/dashboard'
                  ? 'text-primary font-medium'
                  : 'text-foreground'
              } hover:text-primary transition-colors`}
            >
              Dashboard
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user.email}
                  size="sm"
                  src=""
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem key="dashboard" as={Link} to="/dashboard">
                  Dashboard
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
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
              className={`w-full text-lg ${
                location.pathname === item.href
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