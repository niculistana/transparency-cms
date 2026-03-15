import { Send } from "lucide-react";

interface PublishButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  text?: string;
}

export const PublishButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
  text = "Publish",
}: PublishButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      type="button"
    >
      <Send className="h-4 w-4" />
      {loading ? "Publishing..." : text}
    </button>
  );
};
