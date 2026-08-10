import { render, screen, fireEvent } from "../../test-utils";
import { describe, it, expect, vi } from "vitest";
import Reports from "../Reports";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../hooks/useApi", () => ({
  useReports: () => ({
    data: {
      completionRate: 89,
      avgDuration: 3.2,
      onTimeDelivery: 76,
      teamUtilization: 72,
      productivityData: [],
      weeklyData: [],
      teamPerformance: [],
      priorityDist: [
        { name: "High", value: 4, color: "#EF4444" },
        { name: "Medium", value: 3, color: "#F59E0B" },
        { name: "Low", value: 3, color: "#22C55E" },
      ],
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),

  useIndividualPerformance: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("recharts", async (importOriginal) => {
  const mod = await importOriginal<typeof import("recharts")>();

  return {
    ...mod,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

describe("Reports Component", () => {
  it("tabs switch correctly and update the view", () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    // Initial tab should be Weekly
    expect(
      screen.getByText("Weekly Performance Briefing")
    ).toBeInTheDocument();

    // Employee Performance section should not be visible initially
    expect(
      screen.queryByText("Detailed Employee Performance Metrics")
    ).not.toBeInTheDocument();

    // Click Employee Performance tab
    const employeeTab = screen.getByRole("button", {
      name: "Employee Performance",
    });

    fireEvent.click(employeeTab);

    // Employee Performance content should now appear
    expect(
      screen.getByText("Detailed Employee Performance Metrics")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Employee Performance Performance Briefing")
    ).toBeInTheDocument();

    // Weekly content should no longer be the active report
    expect(
      screen.queryByText("Weekly Performance Briefing")
    ).not.toBeInTheDocument();
  });
});