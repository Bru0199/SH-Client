import logoImg from "../assets/logo.png";
import { useEffect, useRef, useState } from "react";
import {
  ClipboardList,
  Layers,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeft,
  PanelLeftOpen,
  PanelLeftClose,
  Puzzle,
  Star,
  Sun,
  Ticket,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitialSidebarState = () => {
    if (typeof window !== "undefined") return window.innerWidth > 900;
    return true;
  };
  const [isSidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e) => {
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  const sidebarRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const initials = user?.username?.[0]?.toUpperCase() || "A";

  useEffect(() => {
    if (!userDropdownOpen && !settingsDropdownOpen && !userMenuOpen) return;
    const handleClick = (event) => {
      const sidebar = sidebarRef.current;
      const settingsDropdown = settingsDropdownRef.current;
      const userDropdown = userDropdownRef.current;
      if (
        (sidebar && sidebar.contains(event.target)) ||
        (settingsDropdown && settingsDropdown.contains(event.target)) ||
        (userDropdown && userDropdown.contains(event.target))
      ) {
        return;
      }
      setUserDropdownOpen(false);
      setSettingsDropdownOpen(false);
      setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userDropdownOpen, settingsDropdownOpen, userMenuOpen]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    setUserDropdownOpen(false);
    setSettingsDropdownOpen(false);
  };

  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleClickOutside = (e) => {
      if (window.innerWidth > 900) return;
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="admin-layout">
      <aside
        ref={sidebarRef}
        className={`admin-sidebar flex flex-col h-screen min-h-0 ${isSidebarOpen ? "overflow-hidden" : "overflow-visible"} ${isSidebarOpen ? "open" : "closed"} ${!isSidebarOpen ? "items-center" : ""}`}
      >
        <div className="flex flex-col flex-1 h-full min-h-0 py-4 items-center gap-y-2">
          {isSidebarOpen ? (
            <div className="relative flex flex-row items-center w-full px-2 pt-2 pb-4">
              <span className="flex items-center justify-center w-16 h-16">
                <span style={{cursor: 'pointer'}} onClick={() => navigate('/')}> 
                  <Logo showName={true} />
                </span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-y-1">
              <span className="flex items-center justify-center w-10 h-10">
                <img
                  src={logoImg}
                  alt="Logo"
                  className="w-8 h-8 rounded-full object-cover logo-img"
                  style={{cursor: 'pointer'}}
                  onClick={() => navigate('/')}
                />
              </span>
              <button
                className="sidebar-toggle-btn closed flex items-center justify-center w-10 h-10 rounded-md"
                type="button"
                aria-label="Expand sidebar"
                onClick={toggleSidebar}
              >
                <span className="sidebar-toggle-icon closed">
                  <PanelLeft />
                </span>
                <span className="sidebar-toggle-icon open">
                  <PanelLeftOpen />
                </span>
              </button>
            </div>
          )}
          {isSidebarOpen && (
            <button
              className="sidebar-toggle-btn open absolute right-2.5 top-2.5 z-[100] flex h-8 w-8 items-center justify-center rounded-md"
              type="button"
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
            >
              <span className="sidebar-toggle-icon open">
                <PanelLeftOpen />
              </span>
              <span className="sidebar-toggle-icon close">
                <PanelLeftClose />
              </span>
            </button>
          )}

          <div
            className={`flex flex-col gap-y-1 w-full mt-0 ${isSidebarOpen ? "items-stretch" : "items-center justify-center"}`}
          >
            {isSidebarOpen && (
              <span className="sidebar-section-label px-4 py-1 text-left">
                Main
              </span>
            )}
            {[
              {
                to: "/admin",
                end: true,
                icon: LayoutDashboard,
                label: "Dashboard",
              },
              {
                to: "/admin/categories",
                end: false,
                icon: Layers,
                label: "Categories",
              },
              {
                to: "/admin/menu",
                end: false,
                icon: UtensilsCrossed,
                label: "Menu",
              },
              {
                to: "/admin/orders",
                end: false,
                icon: ClipboardList,
                label: "Orders",
              },
              {
                to: "/admin/addons",
                end: false,
                icon: Puzzle,
                label: "Addons",
              },
              {
                to: "/admin/coupons",
                end: false,
                icon: Ticket,
                label: "Coupons",
              },
            ].map(({ to, end, icon, label }) => {
              const IconComp = icon;
              return (
                <div
                  key={to}
                  className={!isSidebarOpen ? "relative group" : ""}
                >
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `admin-nav-link redesigned flex flex-row items-center gap-2 ${isSidebarOpen ? "w-full px-3 py-2 justify-start" : "w-10 h-10 justify-center"} rounded-md text-base font-medium ${isActive ? "active" : ""}`
                    }
                    onClick={handleNavClick}
                    title={!isSidebarOpen ? label : undefined}
                  >
                    <span className="flex items-center justify-center w-7">
                      <IconComp className="nav-icon w-6 h-6" />
                    </span>
                    {isSidebarOpen && (
                      <span className="nav-label text-xs font-medium">
                        {label}
                      </span>
                    )}
                  </NavLink>
                  {!isSidebarOpen && (
                    <span
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                      style={{
                        background: "var(--sidebar-surface)",
                        border: "1px solid var(--sidebar-border)",
                        color: "var(--sidebar-text)",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
            {isSidebarOpen && (
              <span className="sidebar-section-label px-4 py-1 text-left mt-2">
                Users & Reviews
              </span>
            )}
            {[
              { to: "/admin/users", icon: Users, label: "Users" },
              { to: "/admin/reviews", icon: Star, label: "Reviews" },
              // Profile and Sign Out only when sidebar is open
              ...(isSidebarOpen
                ? [
                    {
                      to: "/profile",
                      icon: User,
                      label: "Profile",
                      isProfile: true,
                    },
                    { icon: LogOut, label: "Sign out", isSignOut: true },
                  ]
                : []),
            ].map(({ to, icon, label, isProfile, isSignOut }) => {
              const IconComp = icon;
              if (isSignOut) {
                return (
                  <div
                    key={label}
                    className={!isSidebarOpen ? "relative group" : ""}
                  >
                    <button
                      className={`admin-nav-link redesigned flex flex-row items-center gap-2 ${isSidebarOpen ? "w-full px-3 py-2 justify-start" : "w-10 h-10 justify-center"} rounded-md text-base font-medium danger`}
                      type="button"
                      onClick={async () => {
                        await logout();
                        navigate("/");
                      }}
                      title={!isSidebarOpen ? label : undefined}
                    >
                      <span className="flex items-center justify-center w-7">
                        <IconComp className="nav-icon w-6 h-6" />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-label text-xs font-medium">
                          {label}
                        </span>
                      )}
                    </button>
                    {!isSidebarOpen && (
                      <span
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                        style={{
                          background: "var(--sidebar-surface)",
                          border: "1px solid var(--sidebar-border)",
                          color: "var(--sidebar-text)",
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                );
              }
              if (isProfile) {
                return (
                  <div
                    key={label}
                    className={!isSidebarOpen ? "relative group" : ""}
                  >
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `admin-nav-link redesigned flex flex-row items-center gap-2 ${isSidebarOpen ? "w-full px-3 py-2 justify-start" : "w-10 h-10 justify-center"} rounded-md text-base font-medium ${isActive ? "active" : ""}`
                      }
                      onClick={handleNavClick}
                      title={!isSidebarOpen ? label : undefined}
                    >
                      <span className="flex items-center justify-center w-7">
                        <IconComp className="nav-icon w-6 h-6" />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-label text-xs font-medium">
                          {label}
                        </span>
                      )}
                    </NavLink>
                    {!isSidebarOpen && (
                      <span
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                        style={{
                          background: "var(--sidebar-surface)",
                          border: "1px solid var(--sidebar-border)",
                          color: "var(--sidebar-text)",
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                );
              }
              // Users & Reviews
              return (
                <div
                  key={to}
                  className={!isSidebarOpen ? "relative group" : ""}
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `admin-nav-link redesigned flex flex-row items-center gap-2 ${isSidebarOpen ? "w-full px-3 py-2 justify-start" : "w-10 h-10 justify-center"} rounded-md text-base font-medium ${isActive ? "active" : ""}`
                    }
                    onClick={handleNavClick}
                    title={!isSidebarOpen ? label : undefined}
                  >
                    <span className="flex items-center justify-center w-7">
                      <IconComp className="nav-icon w-6 h-6" />
                    </span>
                    {isSidebarOpen && (
                      <span className="nav-label text-xs font-medium">
                        {label}
                      </span>
                    )}
                  </NavLink>
                  {!isSidebarOpen && (
                    <span
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                      style={{
                        background: "var(--sidebar-surface)",
                        border: "1px solid var(--sidebar-border)",
                        color: "var(--sidebar-text)",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className={`flex flex-col gap-2 w-full ${isSidebarOpen ? "items-stretch" : "items-center"} ${!isSidebarOpen ? "relative group" : ""}`}
          >
            <button
              className={`theme-toggle-btn flex items-center gap-1.5 rounded-[10px] py-1.5 w-full ${isSidebarOpen ? "justify-start px-3" : "justify-center px-2"}`}
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={
                !isSidebarOpen
                  ? theme === "dark"
                    ? "Dark mode"
                    : "Light mode"
                  : undefined
              }
            >
              {theme === "dark" ? (
                <Moon className="nav-icon" />
              ) : (
                <Sun className="nav-icon" />
              )}
              {isSidebarOpen && (
                <span className="nav-label">
                  {theme === "dark" ? "Dark" : "Light"} Mode
                </span>
              )}
            </button>
            {!isSidebarOpen && (
              <span
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                style={{
                  background: "var(--sidebar-surface)",
                  border: "1px solid var(--sidebar-border)",
                  color: "var(--sidebar-text)",
                }}
              >
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
            )}
          </div>

          <div
            className={`flex flex-col gap-2 w-full ${isSidebarOpen ? "items-stretch" : "items-center"}`}
          >
            {isSidebarOpen ? (
              <div className="flex items-center gap-3 px-3 py-2 min-w-0">
                <span className="avatar w-9 h-9 grid place-items-center rounded-full font-bold text-lg shrink-0">
                  {initials}
                </span>
                <div className="flex flex-col min-w-0 mr-2">
                  <span className="admin-user-name truncate">
                    {user?.username || "Admin"}
                  </span>
                  <span className="admin-user-role">
                    {user?.role || "admin"}
                  </span>
                </div>
                {/* Profile and Sign Out icons next to admin info */}
                <div className="flex flex-row gap-2 ml-auto">
                  <div className="relative group">
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        `admin-nav-link redesigned flex items-center justify-center w-9 h-9 rounded-md text-base font-medium ${isActive ? "active" : ""}`
                      }
                      onClick={handleNavClick}
                      title="Profile"
                    >
                      <User className="nav-icon w-6 h-6" />
                    </NavLink>
                    <span
                      className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                      style={{
                        background: "var(--sidebar-surface)",
                        border: "1px solid var(--sidebar-border)",
                        color: "var(--sidebar-text)",
                      }}
                    >
                      Profile
                    </span>
                  </div>
                  <div className="relative group">
                    <button
                      className="admin-nav-link redesigned flex items-center justify-center w-9 h-9 rounded-md text-base font-medium danger"
                      type="button"
                      onClick={async () => {
                        await logout();
                        navigate("/");
                      }}
                      title="Sign out"
                    >
                      <LogOut className="nav-icon w-6 h-6" />
                    </button>
                    <span
                      className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-[200] pointer-events-none shadow-md"
                      style={{
                        background: "var(--sidebar-surface)",
                        border: "1px solid var(--sidebar-border)",
                        color: "var(--sidebar-text)",
                      }}
                    >
                      Sign out
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <span className="avatar w-9 h-9 grid place-items-center rounded-full font-bold text-lg shrink-0">
                  {initials}
                </span>
                {/* Profile and Sign Out below avatar when sidebar is closed */}
                <div className="flex flex-col gap-1 mt-2">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `admin-nav-link redesigned flex flex-row items-center gap-2 w-10 h-10 justify-center rounded-md text-base font-medium ${isActive ? "active" : ""}`
                    }
                    onClick={handleNavClick}
                    title="Profile"
                  >
                    <span className="flex items-center justify-center w-7">
                      <User className="nav-icon w-6 h-6" />
                    </span>
                  </NavLink>
                  <button
                    className="admin-nav-link redesigned flex flex-row items-center gap-2 w-10 h-10 justify-center rounded-md text-base font-medium danger"
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate("/");
                    }}
                    title="Sign out"
                  >
                    <span className="flex items-center justify-center w-7">
                      <LogOut className="nav-icon w-6 h-6" />
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          role="presentation"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <main
        className={`admin-main redesigned min-w-0 w-full overflow-x-hidden px-3 py-4 sm:px-4 md:px-6 md:py-6 ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
