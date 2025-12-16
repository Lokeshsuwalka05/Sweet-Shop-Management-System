import { useAuth } from "@/contexts/AuthContext";
import { Candy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "../../public/sweet.svg";

function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };
  const { user, logout, isAdmin } = useAuth();
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Sweet Shop Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">Sweet Shop</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName}!
              </span>
            )}
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                size="sm"
              >
                Admin Panel
              </Button>
            )}
            {user && (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
