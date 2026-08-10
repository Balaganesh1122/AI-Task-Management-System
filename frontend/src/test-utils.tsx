import React from "react";
import {
  render as rtlRender,
  type RenderOptions,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export * from "@testing-library/react";

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export const TestQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export const render = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return rtlRender(ui, {
    wrapper: TestQueryProvider,
    ...options,
  });
};