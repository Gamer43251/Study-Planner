import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { api, toDateTimeLocal } from "../api";
import TaskForm from "../components/TaskForm";

export default function TaskFormPage() {
  const { moduleId, taskId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(taskId);
  const [initial, setInitial] = useState(null);
  const [ownerModuleId, setOwnerModuleId] = useState(moduleId ?? null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) {
      return;
    }
    api(`/tasks/${taskId}`)
      .then((task) => {
        setOwnerModuleId(String(task.module_id));
        setInitial({
          ...task,
          deadline: toDateTimeLocal(task.deadline),
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [editing, taskId]);

  async function save(payload) {
    setError("");
    const targetModuleId = ownerModuleId;
    try {
      if (editing) {
        await api(`/tasks/${taskId}`, { method: "PATCH", body: payload });
      } else {
        await api("/tasks", { method: "POST", body: { ...payload, module_id: Number(moduleId) } });
      }
      navigate(`/modules/${targetModuleId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-heading">
        <Link to={ownerModuleId ? `/modules/${ownerModuleId}` : "/"}>Back to module</Link>
        <h1 className="h3 mt-2">{editing ? "Edit task" : "New task"}</h1>
      </div>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {loading ? <p>Loading task...</p> : null}
      {!loading && (!editing || initial) ? (
        <TaskForm
          initial={initial ?? undefined}
          onSubmit={save}
          submitLabel={editing ? "Update task" : "Create task"}
        />
      ) : null}
    </>
  );
}
