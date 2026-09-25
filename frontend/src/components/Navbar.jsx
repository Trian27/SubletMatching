import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function Navbar() {
  const { user, isConfigured } = useAuth();

  const linkClass = ({ isActive }) =>
    `px-2 py-2 text-sm font-medium transition-colors sm:px-3 ${
      isActive ? "text-red-600" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-8">
          {!user ? (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={async () => {
                if (!isConfigured || !supabase) return;
                await supabase.auth.signOut();
              }}
              className="px-2 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:px-3"
            >
              Logout
            </button>
          )}
          <NavLink to="/" end className={linkClass}>
            Listings
          </NavLink>
          <NavLink to="/favorites" className={linkClass}>
            Favorites
          </NavLink>
          <NavLink to="/inbox" className={linkClass}>
            Inbox
          </NavLink>
        </div>

        <Link
          to="/"
          className="text-base font-semibold text-slate-900 sm:text-lg"
        >
          Sublet Finder
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
