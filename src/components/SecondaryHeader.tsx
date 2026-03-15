import { Link, useLocation } from "react-router-dom";
import { FileText, File } from "lucide-react";

export const SecondaryHeader = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/documents") {
      return (
        location.pathname === "/dashboard" || location.pathname === "/documents"
      );
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    const base = "inline-flex items-center gap-2 px-4 py-2 transition-colors";
    const active = isActive(path)
      ? "bg-blue-600 text-white"
      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200";
    return `${base} ${active}`;
  };

  return (
    <div className="w-full bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
        <nav className="flex items-center gap-2">
          <Link to="/dashboard" className={linkClass("/documents")}>
            <FileText className="h-4 w-4" />
            Documents
          </Link>
          <Link to="/pages" className={linkClass("/pages")}>
            <File className="h-4 w-4" />
            Pages
          </Link>
        </nav>
      </div>
    </div>
  );
};
