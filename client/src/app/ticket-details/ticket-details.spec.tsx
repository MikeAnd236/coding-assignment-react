import { render, screen, waitFor } from "@testing-library/react";
import { TicketDetails } from "./ticket-details";
import { BrowserRouter } from "react-router-dom";

// Mock the fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock antd components to simplify testing
jest.mock("antd", () => ({
  message: {
    error: jest.fn(),
  },
  Spin: ({ size }: { size: string }) => (
    <div data-testid="spinner">Loading...</div>
  ),
  Tag: ({
    color,
    children,
    className,
  }: {
    color: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid={`tag-${color}`} className={className}>
      {children}
    </span>
  ),
}));

// Mock useParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
}));

describe("TicketDetails", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  it("should show loading spinner initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should display ticket details when data is loaded", async () => {
    const mockTicket = {
      id: 1,
      description: "Test ticket description",
      assigneeId: 1,
      completed: false,
    };

    const mockUsers = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTicket,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(`Ticket #${mockTicket.id}`)).toBeInTheDocument();
      expect(screen.getByText(mockTicket.description)).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByTestId("tag-error")).toHaveTextContent("Unresolved");
    });
  });

  it("should display resolved tag when ticket is completed", async () => {
    const mockTicket = {
      id: 1,
      description: "Test ticket description",
      assigneeId: 1,
      completed: true,
    };

    const mockUsers = [{ id: 1, name: "John Doe" }];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTicket,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("tag-success")).toHaveTextContent("Resolved");
    });
  });

  it("should display 'None' when no assignee", async () => {
    const mockTicket = {
      id: 1,
      description: "Test ticket description",
      assigneeId: null,
      completed: false,
    };

    const mockUsers = [{ id: 1, name: "John Doe" }];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTicket,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("None")).toBeInTheDocument();
    });
  });

  it("should show error message when ticket is not found", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  it("should handle case where assignee is not found in users list", async () => {
    const mockTicket = {
      id: 1,
      description: "Test ticket description",
      assigneeId: 999, // Non-existent user ID
      completed: false,
    };

    const mockUsers = [{ id: 1, name: "John Doe" }];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTicket,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

    render(
      <BrowserRouter>
        <TicketDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("None")).toBeInTheDocument();
    });
  });
});
