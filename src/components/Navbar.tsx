import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-card/70 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-md">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground">CodeEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link
              to="/tracks"
              className="relative text-muted-foreground font-bold hover:text-foreground transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Tracks
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="relative text-muted-foreground font-bold hover:text-foreground transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="border-border text-foreground  hover:to-purple-500/90 text-black px-5 py-6 text-sm font-medium rounded-full shadow-xl shadow-primary/30 hover:scale-[1.03] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center ring-2 ring-primary/30">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="border-border text-foreground  hover:to-purple-500/90 text-black px-5 py-5 text-sm font-medium rounded-full shadow-xl shadow-primary/30 hover:scale-[1.03] transition"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-br from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-5 py-5 text-sm font-medium rounded-full shadow-xl shadow-black/30 hover:scale-[1.03] transition"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-xl border border-border bg-card shadow-lg animate-fade-in">
            <div className="flex flex-col gap-4 p-4 text-sm">
              <Link
                to="/tracks"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tracks
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              <div className="border-t border-border pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="block py-1 text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="mt-2 text-destructive text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("/signup");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
