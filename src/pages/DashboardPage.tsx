import { Header } from "../components/Header";
import { SecondaryHeader } from "../components/SecondaryHeader";
import { DocumentsPage } from "./DocumentsPage";
import { PendingDocumentsSection } from "../sections/PendingDocumentsSection";
import { ActivitySidebar } from "../sections/ActivitySidebar";
import { useAuthService } from "../services/AuthService";

export function DashboardPage() {
  const currentRole = useAuthService((state) => state.currentRole);

  // Show pending documents section only for ADMIN, AUTHOR, and EDIT roles
  const canViewPendingDocuments =
    currentRole && ["ADMIN", "AUTHOR", "EDIT"].includes(currentRole);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <SecondaryHeader />
      {canViewPendingDocuments && <PendingDocumentsSection />}
      <DocumentsPage />
      <ActivitySidebar />
    </div>
  );
}
