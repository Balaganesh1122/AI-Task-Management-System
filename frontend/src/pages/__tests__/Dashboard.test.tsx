import { render, screen, waitFor } from "../../test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "../Dashboard";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/axios";

// Mock recharts
vi.mock("recharts", async (importOriginal) => {
  const OriginalRecharts =
    await importOriginal<typeof import("recharts")>();

  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: any) => (
      <div>{children}</div>
    ),
  };
});

// Mock API
vi.mock("../../services/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      switch (url) {
        case "/dashboard/summary":
          return Promise.resolve({
            data: {
              tasks: [
                {
                  id: "1",
                  title: "Build Authentication API",
                  description:
                    "Implement authentication and authorization APIs",
                  status: "In Progress",
                  dueDate: "2026-10-10",
                  priority: "High",
                  assignee: "Test User",
                  department: "Engineering",
                },
                {
                  id: "2",
                  title: "Create Analytics Dashboard",
                  description:
                    "Create dashboard analytics and reporting",
                  status: "Completed",
                  dueDate: "2026-10-10",
                  priority: "Medium",
                  assignee: "Test User",
                  department: "Engineering",
                },
                {
                  id: "3",
                  title: "Fix Overdue Tasks",
                  description:
                    "Review and resolve overdue tasks",
                  status: "Overdue",
                  dueDate: "2026-10-10",
                  priority: "High",
                  assignee: "Test User",
                  department: "Engineering",
                },
                {
                  id: "4",
                  title: "Implement Redis Cache",
                  description:
                    "Implement Redis caching for task APIs",
                  status: "In Progress",
                  dueDate: "2026-10-10",
                  priority: "Medium",
                  assignee: "Test User",
                  department: "Engineering",
                },
              ],
            },
          });

        case "/performance/resources":
          return Promise.resolve({
            data: [],
          });

        case "/sla-compliance":
          return Promise.resolve({
            data: [],
          });

        case "/risk-predictions":
          return Promise.resolve({
            data: [],
          });

        case "/performance/individual":
          return Promise.resolve({
            data: [],
          });

        default:
          return Promise.resolve({
            data: [],
          });
      }
    });
  });

  it("KPI cards render with correct data from API", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for Dashboard to finish loading
    await waitFor(() => {
      expect(
        screen.getByText("Total Tasks")
      ).toBeInTheDocument();
    });

    // Confirm Dashboard called the correct API
    expect(api.get).toHaveBeenCalledWith(
      "/dashboard/summary"
    );

    // =====================================================
    // TOTAL TASKS
    // =====================================================

    const totalTasksLabel =
      screen.getByText("Total Tasks");

    expect(totalTasksLabel).toBeInTheDocument();

    const totalTasksCard =
      totalTasksLabel.parentElement;

    expect(totalTasksCard).toHaveTextContent("4");

    // =====================================================
    // IN PROGRESS
    // =====================================================

    const inProgressLabels =
      screen.getAllByText("In Progress");

    expect(inProgressLabels.length).toBeGreaterThan(0);

    const inProgressKpi = inProgressLabels.find(
      (element) => {
        const parentText =
          element.parentElement?.textContent || "";

        return parentText.includes("2");
      }
    );

    expect(inProgressKpi).toBeDefined();

    expect(
      inProgressKpi?.parentElement
    ).toHaveTextContent("2");

    // =====================================================
    // COMPLETED
    // =====================================================

    const completedLabels =
      screen.getAllByText("Completed");

    expect(completedLabels.length).toBeGreaterThan(0);

    const completedKpi = completedLabels.find(
      (element) => {
        const parentText =
          element.parentElement?.textContent || "";

        return parentText.includes("1");
      }
    );

    expect(completedKpi).toBeDefined();

    expect(
      completedKpi?.parentElement
    ).toHaveTextContent("1");

    // =====================================================
    // OVERDUE
    // =====================================================

    const overdueLabels =
      screen.getAllByText("Overdue");

    expect(overdueLabels.length).toBeGreaterThan(0);

    const overdueKpi = overdueLabels.find(
      (element) => {
        const parentText =
          element.parentElement?.textContent || "";

        return parentText.includes("1");
      }
    );

    expect(overdueKpi).toBeDefined();

    expect(
      overdueKpi?.parentElement
    ).toHaveTextContent("1");
  });
});