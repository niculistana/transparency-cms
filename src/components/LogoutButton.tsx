import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthService } from "../services/AuthService";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const logout = useAuthService((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/logout");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
};
