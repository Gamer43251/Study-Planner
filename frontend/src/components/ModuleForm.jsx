import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";

export default function ModuleForm({ initial, onSubmit, submitLabel = "Save module" }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [credits, setCredits] = useState(initial?.credits ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Name and code must not be empty.");
      return;
    }
    const creditValue = Number(credits);
    if (!Number.isInteger(creditValue) || creditValue <= 0) {
      setError("Credits must be a positive whole number.");
      return;
    }
    setError("");
    onSubmit({ name: name.trim(), code: code.trim(), credits: creditValue });
  }

  return (
    <Form onSubmit={handleSubmit} className="bg-white border rounded p-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Form.Group className="mb-3" controlId="module-name">
        <Form.Label>Name</Form.Label>
        <Form.Control value={name} onChange={(event) => setName(event.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="module-code">
        <Form.Label>Code</Form.Label>
        <Form.Control value={code} onChange={(event) => setCode(event.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="module-credits">
        <Form.Label>Credits</Form.Label>
        <Form.Control
          type="number"
          min="1"
          step="1"
          value={credits}
          onChange={(event) => setCredits(event.target.value)}
        />
      </Form.Group>
      <Button type="submit">{submitLabel}</Button>
    </Form>
  );
}
