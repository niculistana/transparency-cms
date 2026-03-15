import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";

interface EditSubmissionButtonProps {
  to: string;
  className?: string;
}

export const EditSubmissionButton = ({
  to,
  className = "",
}: EditSubmissionButtonProps) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors ${className}`}
    >
      <Pencil className="h-4 w-4" />
      Edit Submission
    </Link>
  );
};
