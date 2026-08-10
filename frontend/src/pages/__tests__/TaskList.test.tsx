import { render, screen, fireEvent } from "../../test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskList from "../TaskList";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/axios";

vi.mock("../../services/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("TaskList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      if (url === "/tasks") {
        return Promise.resolve({
          data: [
            {
              id: "1",
              title: "Fix login bug",
              description: "Fix authentication login issue",
              assignee: "Alice",
              assigneeAvatar: "",
              department: "Engineering",
              status: "Pending",
              priority: "High",
              tags: [],
              dueDate: "2026-10-10",
              createdDate: "2026-10-01",
              progress: 20,
              estimatedHours: 4,
            },
            {
              id: "2",
              title: "Update documentation",
              description: "Update project documentation",
              assignee: "Bob",
              assigneeAvatar: "",
              department: "Engineering",
              status: "Completed",
              priority: "Low",
              tags: [],
              dueDate: "2026-10-10",
              createdDate: "2026-10-01",
              progress: 100,
              estimatedHours: 2,
            },
            {
              id: "3",
              title: "Database migration",
              description: "Migrate the project database",
              assignee: "Alice",
              assigneeAvatar: "",
              department: "Engineering",
              status: "In Progress",
              priority: "High",
              tags: [],
              dueDate: "2026-10-10",
              createdDate: "2026-10-01",
              progress: 60,
              estimatedHours: 6,
            },
          ],
        });
      }

      return Promise.resolve({
        data: [],
      });
    });
  });

  it("filters work correctly", async () => {
    render(
      <MemoryRouter>
        <TaskList />
      </MemoryRouter>
    );

    // Wait for API data to render
    expect(
      await screen.findByText("Fix login bug")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Update documentation")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Database migration")
    ).toBeInTheDocument();

    // =====================================================
    // SEARCH FILTER
    // =====================================================

    const searchInput = screen.getByPlaceholderText(
      "Search tasks or assignees..."
    );

    fireEvent.change(searchInput, {
      target: { value: "Fix" },
    });

    expect(
      screen.getByText("Fix login bug")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Update documentation")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Database migration")
    ).not.toBeInTheDocument();

    // Reset search
    fireEvent.change(searchInput, {
      target: { value: "" },
    });

    // =====================================================
    // STATUS FILTER
    // =====================================================

    const statusDropdown =
      screen.getByDisplayValue("All Status");

    fireEvent.change(statusDropdown, {
      target: { value: "Completed" },
    });

    expect(
      screen.queryByText("Fix login bug")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Update documentation")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Database migration")
    ).not.toBeInTheDocument();

    // Reset status
    fireEvent.change(statusDropdown, {
      target: { value: "All" },
    });

    // =====================================================
    // PRIORITY FILTER
    // =====================================================

    const priorityDropdown =
      screen.getByDisplayValue("All Priority");

    fireEvent.change(priorityDropdown, {
      target: { value: "Low" },
    });

    expect(
      screen.queryByText("Fix login bug")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Update documentation")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Database migration")
    ).not.toBeInTheDocument();
  });
});