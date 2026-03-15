import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings, MoreVertical, FileText } from "lucide-react";

export const HeaderActions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <Link
                to="/pages"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Pages
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
