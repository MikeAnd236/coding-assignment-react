import { Row, Col, Button, message, Spin } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket } from "@acme/shared-models";
import { ResolveTicketModal } from "client/src/components/ResolveTicketModal";
import { CreateTicketModal } from "client/src/components/CreateTicketModal";
import { TicketCard } from "client/src/components/TicketCard";

export function Tickets({
  tickets: initialTickets,
  users,
}: {
  tickets: Ticket[];
  users: any[];
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [actionType, setActionType] = useState<"resolve" | "unresolve">(
    "resolve"
  );

  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      message.error("Error loading tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAssignUser = async (ticketId: number, userId: number | null) => {
    try {
      let res;
      if (userId === null) {
        res = await fetch(`/api/tickets/${ticketId}/unassign`, {
          method: "PUT",
        });
      } else {
        res = await fetch(`/api/tickets/${ticketId}/assign/${userId}`, {
          method: "PUT",
        });
      }

      if (!res.ok) throw new Error("Failed to update assignee");

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, assigneeId: userId } : t))
      );

      if (userId) {
        const assignedUser = users.find((u) => u.id === userId);
        message.success(
          `Ticket ${ticketId} assigned to ${
            assignedUser?.name ?? "user"
          } successfully`
        );
      } else {
        message.success(`Ticket ${ticketId} unassigned successfully`);
      }
    } catch (err) {
      console.error(err);
      message.error("Error while updating assignee");
    }
  };

  const openResolveModal = (ticket: Ticket, type: "resolve" | "unresolve") => {
    setSelectedTicket(ticket);
    setActionType(type);
    setResolveModalOpen(true);
  };

  const handleCardClick = (ticketId: number) => {
    navigate(`/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 lg:p-6">
      <div className="p-5">
        <h1 className="text-4xl">Tickets</h1>
        <Button type="primary" className="mt-5" onClick={() => setOpen(true)}>
          Ticket
        </Button>

        <CreateTicketModal
          open={open}
          onOk={(newTicket) => {
            setTickets((prev) => [...prev, newTicket]);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />

        <ResolveTicketModal
          open={resolveModalOpen}
          actionType={actionType}
          ticket={selectedTicket}
          onConfirm={(updatedTicket) => {
            setTickets((prev) =>
              prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
            );
            setResolveModalOpen(false);
          }}
          onCancel={() => setResolveModalOpen(false)}
        />

        <Spin spinning={loading} tip="Loading tickets...">
          <Row gutter={[16, 16]} className="mt-10">
            {tickets.map((t) => (
              <Col key={t.id} xs={24} sm={12} md={12} lg={8} xl={8}>
                <div
                  onClick={() => handleCardClick(t.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <TicketCard
                    ticket={t}
                    users={users}
                    onAssign={handleAssignUser}
                    onResolveAction={openResolveModal}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </div>
  );
}
