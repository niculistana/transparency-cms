import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { host } from "../services/shared/Config";
import { type Role } from "../types/Role";
import { useAuthService } from "../services/AuthService";

export function LoginAs() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthService((state) => state.login);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${host}/roles`);
        if (!response.ok) {
          throw new Error("Failed to fetch roles");
        }
        const data = await response.json();
        setRoles(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleLoginAs = (roleName: string) => {
    setSelectedRole(roleName);
    login(roleName);
    // Redirect to home after short delay to show confirmation
    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login As
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Select a role to continue
        </p>

        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.role_id}
              onClick={() => handleLoginAs(role.role_name || "")}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedRole === role.role_name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {role.role_name}
                  </h3>
                  {role.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {role.description}
                    </p>
                  )}
                </div>
                {selectedRole === role.role_name && (
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedRole && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              Logged in as <strong>{selectedRole}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
