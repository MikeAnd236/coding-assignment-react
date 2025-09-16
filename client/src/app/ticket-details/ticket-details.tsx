import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket, User } from "@acme/shared-models";
import { message, Spin, Tag } from "antd";

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketRes, usersRes] = await Promise.all([
          fetch(`/api/tickets/${id}`),
          fetch(`/api/users`),
        ]);

        if (!ticketRes.ok) throw new Error("Ticket not found");

        setTicket(await ticketRes.json());
        setUsers(await usersRes.json());
      } catch (err: any) {
        message.error(err.message || "Error loading ticket");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (!ticket) return <p className="text-red-500 mt-10">Ticket not found</p>;

  const assignee = users.find((u) => u.id === ticket.assigneeId);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Ticket #{ticket.id}
      </h1>

      <div className="bg-white shadow-md rounded-2xl p-8 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Assignee</p>
          <p className="text-xl font-medium text-gray-800">
            {assignee ? (
              assignee.name
            ) : (
              <span className="text-gray-400">None</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-lg text-gray-700">{ticket.description}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          {ticket.completed ? (
            <Tag color="success" className="text-base px-3 py-1 mt-1">
              Resolved
            </Tag>
          ) : (
            <Tag color="error" className="text-base px-3 py-1 mt-1">
              Unresolved
            </Tag>
          )}
        </div>
      </div>
    </div>
  );
}
