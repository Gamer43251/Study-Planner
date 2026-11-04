import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import TaskForm from "../components/TaskForm";

describe("TaskForm", () => {
  test("requires a title before saving", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /save task/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/title/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits trimmed task fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), "  Read chapter 2  ");
    await user.type(screen.getByLabelText(/deadline/i), "2026-11-20T17:00");
    await user.click(screen.getByRole("button", { name: /save task/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe("Read chapter 2");
    expect(payload.status).toBe("todo");
    expect(payload.estimated_minutes).toBe(60);
    expect(payload.deadline).toBe(new Date("2026-11-20T17:00").toISOString());
  });
});
