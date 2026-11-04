import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { STATUS_LABELS } from "../api";

export default function TaskForm({ initial, onSubmit, submitLabel = "Save task" }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [status, setStatus] = useState(initial?.status ?? "todo");
  const [minutes, setMinutes] = useState(initial?.estimated_minutes ?? 60);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title must not be empty.");
      return;
    }
    if (!deadline) {
      setError("Deadline is required.");
      return;
    }
    const estimated = Number(minutes);
    if (!Number.isInteger(estimated) || estimated <= 0) {
      setError("Estimated minutes must be a positive whole number.");
      return;
    }
    setError("");
    onSubmit({
      title: title.trim(),
      details: details.trim(),
      deadline: new Date(deadline).toISOString(),
      status,
      estimated_minutes: estimated,
    });
  }

  return (
    <Form onSubmit={handleSubmit} className="bg-white border rounded p-4">
      {error ? (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      ) : null}
      <Form.Group className="mb-3" controlId="task-title">
        <Form.Label>Title</Form.Label>
        <Form.Control value={title} onChange={(event) => setTitle(event.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="task-details">
        <Form.Label>Details</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="task-deadline">
        <Form.Label>Deadline</Form.Label>
        <Form.Control
          type="datetime-local"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="task-status">
        <Form.Label>Status</Form.Label>
        <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3" controlId="task-minutes">
        <Form.Label>Estimated minutes</Form.Label>
        <Form.Control
          type="number"
          min="1"
          step="1"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
        />
      </Form.Group>
      <Button type="submit">{submitLabel}</Button>
    </Form>
  );
}
