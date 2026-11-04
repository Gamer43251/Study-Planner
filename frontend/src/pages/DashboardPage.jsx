import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { api } from "../api";
import { DashboardView } from "../components/DashboardView";
import EmptyState from "../components/EmptyState";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/dashboard")
      .then((payload) => setDashboard(payload))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <Alert className="page-heading" variant="danger">
        {error}
      </Alert>
    );
  }
  if (!dashboard) {
    return <p className="page-heading">Loading progress...</p>;
  }
  if (dashboard.total_tasks === 0 && dashboard.modules.length === 0) {
    return (
      <div className="page-heading">
        <EmptyState
          title="No progress yet"
          message="Add a module and a task, then this dashboard will summarise the work that is left."
        />
      </div>
    );
  }
  return <DashboardView dashboard={dashboard} />;
}
