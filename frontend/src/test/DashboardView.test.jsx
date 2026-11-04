import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { DashboardView } from "../components/DashboardView";

const dashboard = {
  completion_ratio: 0.5,
  total_tasks: 2,
  completed_tasks: 1,
  overdue_tasks: [
    {
      id: 1,
      title: "Essay",
      deadline: "2026-11-01",
      estimated_minutes: 30,
      module_id: 1,
    },
  ],
  due_within_7_days: [],
  modules: [
    {
      module_id: 1,
      name: "Cloud",
      completion_ratio: 0.5,
      overdue_count: 1,
      remaining_minutes: 30,
    },
  ],
  weekly_load: [
    { week_index: 0, start: "2026-11-04", estimated_minutes: 30 },
    { week_index: 1, start: "2026-11-11", estimated_minutes: 0 },
    { week_index: 2, start: "2026-11-18", estimated_minutes: 0 },
    { week_index: 3, start: "2026-11-25", estimated_minutes: 0 },
  ],
};

describe("DashboardView", () => {
  test("renders completion, the overdue task, and the module", () => {
    render(<DashboardView dashboard={dashboard} />);

    expect(screen.getAllByText("50%")).toHaveLength(2);
    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
    expect(screen.getByText("2026-11-04")).toBeInTheDocument();
  });
});
