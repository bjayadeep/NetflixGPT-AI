import { useState, useEffect } from "react";
import { Search, Heart, ChevronDown, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Page } from "../types/movie";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: Page) => void;
  myListCount: number;
}

export function Navbar({ currentPage, onNavigate, myListCount }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayName = currentUser?.displayName?.trim();
  const fallbackName = currentUser?.email?.split("@")[0] || "User";
  const profileName = displayName || currentUser?.email || fallbackName;
  const initials = (displayName || fallbackName)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/60 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
          : "bg-gradient-to-b from-black/85 via-black/45 to-transparent backdrop-blur-[2px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 md:px-12 md:py-4">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="brand-gradient-text text-2xl font-bold tracking-tight drop-shadow-[0_0_18px_rgba(229,9,20,0.32)]"
            aria-label="Go to home"
          >
            NETFLIXGPT
          </button>

          <div className="hidden items-center gap-5 md:flex">
            <NavLink
              active={currentPage === "home"}
              onClick={() => onNavigate("home")}
            >
              Home
            </NavLink>
            <NavLink
              active={currentPage === "gpt-search"}
              onClick={() => onNavigate("gpt-search")}
            >
              GPT Search
            </NavLink>
            <NavLink
              active={currentPage === "movies"}
              onClick={() => onNavigate("movies")}
            >
              Movies
            </NavLink>
            <NavLink
              active={currentPage === "tv-shows"}
              onClick={() => onNavigate("tv-shows")}
            >
              TV Shows
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            onClick={() => onNavigate("gpt-search")}
            className={`hidden h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15 hover:text-white sm:grid ${
              currentPage === "gpt-search" ? "text-white ring-1 ring-white/25" : ""
            }`}
            aria-label="Open GPT Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("my-list")}
            className="group relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
            aria-label="My List"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                currentPage === "my-list" ? "fill-red-600 text-red-600" : ""
              }`}
            />
            {myListCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {myListCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              className="group flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/10 py-1 pl-1 pr-2 backdrop-blur-md transition-all hover:bg-white/15"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={displayName || "User avatar"}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_8px_20px_rgba(236,72,153,0.28)]">
                  <span className="text-sm font-semibold text-white">
                    {initials || "U"}
                  </span>
                </div>
              )}
              <ChevronDown
                className={`w-4 h-4 text-white/80 group-hover:text-white transition-all duration-300 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-72 rounded-xl border border-white/10 bg-zinc-950/95 p-2 text-white shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                >
                  <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t border-white/10 bg-zinc-950/95" />
                  <div className="flex items-center gap-3 rounded-lg px-3 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
                      <User className="h-5 w-5 text-white/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-normal uppercase tracking-[0.18em] text-white/40">
                        Signed in as
                      </p>
                      <p className="truncate text-sm font-medium">
                        {profileName}
                      </p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-white/10" />
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setProfileOpen(false);
                  }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-200 transition-all duration-200 hover:scale-[1.01] hover:bg-red-500/15 hover:text-red-100"
                >
                    <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

interface NavLinkProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavLink({ children, active, onClick }: NavLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative py-2 text-[13px] font-medium transition-colors ${
        active ? "text-white" : "text-white/70 hover:text-white"
      }`}
    >
      {children}
      <span className="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-white/70 transition-all duration-300 group-hover:w-full" />
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-red-600 to-pink-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}
