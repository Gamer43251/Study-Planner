import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { api } from "../api";
import ModuleForm from "../components/ModuleForm";

export default function ModuleFormPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(moduleId);
  const [initial, setInitial] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) {
      return;
    }
    api(`/modules/${moduleId}`)
      .then((module) => {
        setInitial(module);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [editing, moduleId]);

  async function save(payload) {
    setError("");
    try {
      const saved = editing
        ? await api(`/modules/${moduleId}`, { method: "PATCH", body: payload })
        : await api("/modules", { method: "POST", body: payload });
      navigate(`/modules/${saved.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="page-heading">
        <Link to={editing ? `/modules/${moduleId}` : "/"}>Back</Link>
        <h1 className="h3 mt-2">{editing ? "Edit module" : "New module"}</h1>
      </div>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {loading ? <p>Loading module...</p> : null}
      {!loading && (!editing || initial) ? (
        <ModuleForm
          initial={initial ?? undefined}
          onSubmit={save}
          submitLabel={editing ? "Update module" : "Create module"}
        />
      ) : null}
    </>
  );
}
