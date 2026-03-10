import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default RootLayout;
