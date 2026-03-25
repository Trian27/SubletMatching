import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function Navbar() {
  const { user, isConfigured } = useAuth();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-red-600" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
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
              className="px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
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
        </div>

        <Link
          to="/"
          className="text-lg font-semibold text-slate-900"
        >
          Sublet Finder
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

