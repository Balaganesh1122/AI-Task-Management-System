import { render, screen, fireEvent } from "../../test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskDetails from "../TaskDetails";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import api from "../../services/axios";

vi.mock("../../services/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock ResizeObserver
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("TaskDetails Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      // Task details API
      if (url === "/tasks/1") {
        return Promise.resolve({
          data: {
            id: "1",
            title: "Test Task Title",
            description: "Test Description",
            assignee: "Alice",
            assigneeAvatar: "",
            status: "Pending",
            priority: "High",
            tags: [],
            dueDate: "2026-10-10",
            createdDate: "2026-10-01",
            department: "Engineering",
            progress: 20,
            estimatedHours: 5,
            comments: [],
          },
        });
      }

      // Timeline API
      if (url === "/tasks/1/full-timeline") {
        return Promise.resolve({
          data: [],
        });
      }

      return Promise.resolve({
        data: [],
      });
    });
  });

  it("toggles edit mode correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks/1"]}>
        <Routes>
          <Route
            path="/tasks/:id"
            element={<TaskDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    // =====================================================
    // WAIT FOR TASK DATA
    // =====================================================

    expect(
      await screen.findByText("Test Task Title")
    ).toBeInTheDocument();

    // =====================================================
    // INITIAL STATE
    // =====================================================

    expect(
      screen.getByRole("button", {
        name: /Edit Task/i,
      })
    ).toBeInTheDocument();

    // =====================================================
    // CLICK EDIT TASK
    // =====================================================

    fireEvent.click(
      screen.getByRole("button", {
        name: /Edit Task/i,
      })
    );

    // =====================================================
    // EDIT MODE
    // =====================================================

    expect(
      screen.queryByRole("button", {
        name: /Edit Task/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Cancel/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Save Changes/i,
      })
    ).toBeInTheDocument();

    // =====================================================
    // TITLE BECOMES INPUT
    // =====================================================

    const titleInput =
      screen.getByDisplayValue("Test Task Title");

    expect(titleInput).toBeInTheDocument();

    // =====================================================
    // CHANGE TITLE
    // =====================================================

    fireEvent.change(titleInput, {
      target: {
        value: "New Task Title",
      },
    });

    expect(
      screen.getByDisplayValue("New Task Title")
    ).toBeInTheDocument();

    // =====================================================
    // CANCEL EDIT
    // =====================================================

    fireEvent.click(
      screen.getByRole("button", {
        name: /Cancel/i,
      })
    );

    // =====================================================
    // VERIFY CHANGES WERE REVERTED
    // =====================================================

    expect(
      screen.getByText("Test Task Title")
    ).toBeInTheDocument();

    expect(
      screen.queryByDisplayValue("New Task Title")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Edit Task/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /Save Changes/i,
      })
    ).not.toBeInTheDocument();
  });
});