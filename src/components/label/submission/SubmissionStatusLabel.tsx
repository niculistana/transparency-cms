import { CheckCircle, Clock, XCircle, Eye } from "lucide-react";

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "under_review";

interface SubmissionStatusLabelProps {
  status: SubmissionStatus;
}

const statusConfig = {
  pending: {
    label: "Pending",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
    icon: XCircle,
  },
  under_review: {
    label: "Under Review",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    icon: Eye,
  },
};

export function SubmissionStatusLabel({ status }: SubmissionStatusLabelProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 border ${config.bgColor} ${config.textColor} ${config.borderColor} font-serif text-sm font-semibold`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}
