import { Badge, Card, Col, Row, Table } from "react-bootstrap";

function percent(ratio) {
  return `${Math.round(ratio * 100)}%`;
}

export function DashboardView({ dashboard }) {
  return (
    <>
      <div className="page-heading">
        <h1 className="h3">Progress</h1>
        <p className="text-secondary mb-0">
          {dashboard.completed_tasks} of {dashboard.total_tasks} tasks done
        </p>
      </div>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="h6 text-secondary">Completion</Card.Title>
              <p className="display-6 mb-0">{percent(dashboard.completion_ratio)}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="h6 text-secondary">Overdue</Card.Title>
              <p className="display-6 mb-0">{dashboard.overdue_tasks.length}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="h6 text-secondary">Due in 7 days</Card.Title>
              <p className="display-6 mb-0">{dashboard.due_within_7_days.length}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <h2 className="h5">Modules</h2>
      <Table responsive bordered className="task-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Completion</th>
            <th>Overdue</th>
            <th>Minutes left</th>
          </tr>
        </thead>
        <tbody>
          {dashboard.modules.map((module) => (
            <tr key={module.module_id}>
              <td>{module.name}</td>
              <td>{percent(module.completion_ratio)}</td>
              <td>{module.overdue_count}</td>
              <td>{module.remaining_minutes}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2 className="h5">Overdue tasks</h2>
      {dashboard.overdue_tasks.length === 0 ? (
        <p className="text-secondary">Nothing is overdue.</p>
      ) : (
        <ul>
          {dashboard.overdue_tasks.map((task) => (
            <li key={task.id}>
              {task.title} <Badge bg="danger">{task.deadline}</Badge>
            </li>
          ))}
        </ul>
      )}
      <h2 className="h5">Next four weeks</h2>
      <Table responsive bordered className="task-table">
        <thead>
          <tr>
            <th>Week starting</th>
            <th>Open minutes</th>
          </tr>
        </thead>
        <tbody>
          {dashboard.weekly_load.map((week) => (
            <tr key={week.week_index}>
              <td>{week.start}</td>
              <td>{week.estimated_minutes}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
