import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Row, Stack } from "react-bootstrap";
import { api } from "../api";
import EmptyState from "../components/EmptyState";

export default function ModuleListPage() {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    try {
      setModules(await api("/modules"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmRemove() {
    if (!pendingDelete) {
      return;
    }
    try {
      await api(`/modules/${pendingDelete.id}`, { method: "DELETE" });
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <Stack direction="horizontal" className="page-heading" gap={3}>
        <h1 className="h3 mb-0 me-auto">Modules</h1>
        <Button as={Link} to="/modules/new">
          New module
        </Button>
      </Stack>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {pendingDelete ? (
        <Alert variant="warning">
          Delete {pendingDelete.name} and its tasks?
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
      {loading ? <p>Loading modules...</p> : null}
      {!loading && !error && modules.length === 0 ? (
        <EmptyState
          title="No modules yet"
          message="Add a module to start tracking coursework and deadlines."
          action={
            <Button as={Link} to="/modules/new">
              Add a module
            </Button>
          }
        />
      ) : null}
      {modules.length > 0 ? (
        <Row className="g-3">
          {modules.map((module) => (
            <Col md={6} lg={4} key={module.id}>
              <Card className="module-card">
                <Card.Body>
                  <Badge bg="light" text="dark" className="mb-2">
                    {module.code}
                  </Badge>
                  <Card.Title>{module.name}</Card.Title>
                  <Card.Text className="text-secondary">{module.credits} credits</Card.Text>
                  <Stack direction="horizontal" gap={2}>
                    <Button as={Link} to={`/modules/${module.id}`} size="sm">
                      Open
                    </Button>
                    <Button as={Link} to={`/modules/${module.id}/edit`} size="sm" variant="outline-secondary">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setPendingDelete(module)}>
                      Delete
                    </Button>
                  </Stack>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}
    </>
  );
}
