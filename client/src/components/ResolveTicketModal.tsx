import { Modal, Tag, message } from "antd";
import { Ticket } from "@acme/shared-models";

interface ResolveTicketModalProps {
  open: boolean;
  actionType: "resolve" | "unresolve";
  ticket: Ticket | null;
  onConfirm: (updatedTicket: Ticket) => void;
  onCancel: () => void;
}

export function ResolveTicketModal({
  open,
  actionType,
  ticket,
  onConfirm,
  onCancel,
}: ResolveTicketModalProps) {
  const handleOk = async () => {
    if (!ticket) return;
    try {
      let res: Response;

      if (actionType === "resolve") {
        res = await fetch(`/api/tickets/${ticket.id}/complete`, {
          method: "PUT",
        });
      } else {
        res = await fetch(`/api/tickets/${ticket.id}/complete`, {
          method: "DELETE",
        });
      }

      if (!res.ok) throw new Error("Failed to update ticket");

      const text = await res.text();
      let updatedTicket: Ticket;
      if (text) {
        updatedTicket = JSON.parse(text);
      } else {
        updatedTicket = {
          ...ticket,
          completed: actionType === "resolve",
        };
      }

      onConfirm(updatedTicket);
      message.success(
        `Ticket ${ticket.id} ${
          actionType === "resolve" ? "resolved" : "unresolved"
        } successfully`
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to update ticket status");
    }
  };

  return (
    <Modal
      open={open}
      title={`${actionType === "resolve" ? "Resolve" : "Unresolve"} Ticket ${
        ticket?.id
      }`}
      onOk={handleOk}
      onCancel={onCancel}
      okText={actionType === "resolve" ? "Resolve" : "Unresolve"}
      cancelText="Cancel"
    >
      <p>
        Are you sure you want to mark this ticket as{" "}
        {actionType === "resolve" ? (
          <Tag color="success">Resolved</Tag>
        ) : (
          <Tag color="error">Unresolved</Tag>
        )}
        ?
      </p>
      <p>
        <strong>Description:</strong> {ticket?.description}
      </p>
    </Modal>
  );
}
