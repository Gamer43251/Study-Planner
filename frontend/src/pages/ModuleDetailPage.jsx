import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Button, Stack, Table } from "react-bootstrap";
import { STATUS_LABELS, STATUS_VARIANTS, api, formatWhen } from "../api";
import EmptyState from "../components/EmptyState";

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    try {
      const [moduleRecord, taskRecords] = await Promise.all([
        api(`/modules/${moduleId}`),
        api(`/tasks?module_id=${moduleId}`),
      ]);
      setModule(moduleRecord);
      setTasks(taskRecords);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [moduleId]);

  async function confirmRemove() {
    if (!pendingDelete) {
      return;
    }
    try {
      await api(`/tasks/${pendingDelete.id}`, { method: "DELETE" });
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="page-heading">Loading module...</p>;
  }

  return (
    <>
      <div className="page-heading">
        <Link to="/">All modules</Link>
        {module ? (
          <>
            <Stack direction="horizontal" className="mt-2" gap={2}>
              <h1 className="h3 mb-0 me-auto">{module.name}</h1>
              <Button as={Link} to={`/modules/${module.id}/edit`} variant="outline-secondary" size="sm">
                Edit module
              </Button>
            </Stack>
            <p className="text-secondary mb-0">
              <Badge bg="light" text="dark" className="me-2">
                {module.code}
              </Badge>
              {module.credits} credits
            </p>
          </>
        ) : null}
      </div>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {pendingDelete ? (
        <Alert variant="warning">
          Delete "{pendingDelete.title}"?
          <div className="mt-2">
            <Button size="sm" variant="danger" className="me-2" onClick={confirmRemove}>
              Confirm delete
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
          </div>
        </Alert>
      ) : null}
      {module ? (
        <>
          <Stack direction="horizontal" className="mb-3">
            <h2 className="h5 mb-0 me-auto">Tasks</h2>
            <Button as={Link} to={`/modules/${module.id}/tasks/new`} size="sm">
              New task
            </Button>
          </Stack>
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              message="Add a deadline so this module shows up in your plan."
              action={
                <Button as={Link} to={`/modules/${module.id}/tasks/new`}>
                  Add a task
                </Button>
              }
            />
          ) : (
            <Table responsive bordered hover className="task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Minutes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div>{task.title}</div>
                      {task.details ? <div className="text-secondary small">{task.details}</div> : null}
                    </td>
                    <td>{formatWhen(task.deadline)}</td>
                    <td>
                      <Badge bg={STATUS_VARIANTS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                    </td>
                    <td>{task.estimated_minutes}</td>
                    <td className="text-nowrap">
                      <Button as={Link} to={`/tasks/${task.id}/edit`} size="sm" variant="outline-secondary" className="me-2">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setPendingDelete(task)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      ) : null}
    </>
  );
}
