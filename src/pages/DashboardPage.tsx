import { Header } from "../components/Header";
import { DocumentsPage } from "./DocumentsPage";

export function DashboardPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <DocumentsPage />
    </div>
  );
}
