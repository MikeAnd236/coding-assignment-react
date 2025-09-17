import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Tickets } from "./tickets";
import { BrowserRouter } from "react-router-dom";

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock("antd", () => ({
  Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Col: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    type?: string;
  }) => (
    <button onClick={onClick} data-type={type}>
      {children}
    </button>
  ),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Spin: ({
    spinning,
    children,
    tip,
  }: {
    spinning: boolean;
    children: React.ReactNode;
    tip?: string;
  }) => (
    <div>
      {spinning && <div data-testid="spinner">{tip}</div>}
      {!spinning && children}
    </div>
  ),
}));

jest.mock("client/src/components/ResolveTicketModal", () => ({
  ResolveTicketModal: ({
    open,
    onCancel,
  }: {
    open: boolean;
    onCancel: () => void;
  }) => (open ? <div data-testid="resolve-modal">Resolve Modal</div> : null),
}));

jest.mock("client/src/components/CreateTicketModal", () => ({
  CreateTicketModal: ({
    open,
    onCancel,
  }: {
    open: boolean;
    onCancel: () => void;
  }) => (open ? <div data-testid="create-modal">Create Modal</div> : null),
}));

jest.mock("client/src/components/TicketCard", () => ({
  TicketCard: ({ ticket }: { ticket: any }) => (
    <div data-testid={`ticket-card-${ticket.id}`}>
      Ticket #{ticket.id} - {ticket.description}
    </div>
  ),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Tickets", () => {
  const mockTickets = [
    { id: 1, description: "Test ticket 1", assigneeId: 1, completed: false },
    { id: 2, description: "Test ticket 2", assigneeId: null, completed: true },
  ];

  const mockUsers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  it("should render successfully with initial props", () => {
    const { baseElement } = render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it("should display loading spinner initially", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();
  });

  it("should fetch tickets on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/tickets");
    });
  });

  it("should display tickets after loading", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Ticket #1 - Test ticket 1")).toBeInTheDocument();
      expect(screen.getByText("Ticket #2 - Test ticket 2")).toBeInTheDocument();
    });
  });

  it("should handle fetch error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  });

  it("should open create ticket modal when button is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    const createButton = screen.getByText("Ticket");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("create-modal")).toBeInTheDocument();
    });
  });

  it("should navigate to ticket details when card is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const ticketCard = screen.getByTestId("ticket-card-1");
      fireEvent.click(ticketCard);
      expect(mockNavigate).toHaveBeenCalledWith("/1");
    });
  });

  it("should handle assign user successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    const updatedTicket = {
      id: 1,
      description: "Test ticket 1",
      assigneeId: 2,
      completed: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTicket,
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/tickets");
    });
  });

  it("should handle unassign user", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    const updatedTicket = {
      id: 1,
      description: "Test ticket 1",
      assigneeId: null,
      completed: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTicket,
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/tickets");
    });
  });

  it("should handle assign user error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    mockFetch.mockRejectedValueOnce(new Error("Assign error"));

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/tickets");
    });
  });

  it("should display empty state when no tickets", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <Tickets tickets={[]} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("ticket-card-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ticket-card-2")).not.toBeInTheDocument();
    });
  });

  it("should refresh tickets after modal actions", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    const newTicket = {
      id: 3,
      description: "New ticket",
      assigneeId: null,
      completed: false,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [...mockTickets, newTicket],
    });

    render(
      <BrowserRouter>
        <Tickets tickets={mockTickets} users={mockUsers} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
