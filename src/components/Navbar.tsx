import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Languages, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVocabulary } from '@/context/VocabularyContext';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleLanguage, selectedLanguage, translate } = useVocabulary();
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // ✅ Ensure navbar updates when user logs in or out
  useEffect(() => {
    setCurrentUser(user);
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const isAdmin = !!currentUser?.id;

  const navLinks = [
    { name: translate('home'), path: '/' },
    { name: translate('vocabulary'), path: '/vocabulary' },
    { name: translate('requestword'), path: '/request-word' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card py-3 px-4 border-b border-slate-200/20">
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-semibold">
          <Languages className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LangoBridge
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.path) ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center space-x-1"
          >
            <span>{selectedLanguage === 'bangla' ? 'বাংলা' : '한국어'}</span>
            <Languages className="ml-1 h-4 w-4" />
          </Button>

          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{translate('credentials')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">{translate('dashboard')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {translate('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                {translate('login')}
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass-card">
            <div className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium py-2 transition-colors hover:text-primary ${
                    isActive(link.path) ? 'text-primary' : 'text-foreground/70'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  toggleLanguage();
                  setIsOpen(false);
                }}
                className="mt-4 flex items-center justify-center space-x-2"
              >
                <Languages className="h-4 w-4 mr-2" />
                <span>
                  {selectedLanguage === 'bangla'
                    ? translate('koreanWord')
                    : translate('banglaWord')}
                </span>
              </Button>

              {isAuthenticated && currentUser ? (
                <>
                  {isAdmin && (
                    <Button
                      asChild
                      variant="outline"
                      className="mt-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/admin">{translate('dashboard')}</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="mt-2 text-destructive"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {translate('logout')}
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    {translate('login')}
                  </Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
