"use client";

import { Card, Button, Tag, Select } from "antd";
import { Ticket } from "@acme/shared-models";

interface TicketCardProps {
  ticket: Ticket;
  users: any[];
  onAssign: (ticketId: number, userId: number | null) => void;
  onResolveAction: (ticket: Ticket, type: "resolve" | "unresolve") => void;
}

export const TicketCard = ({
  ticket,
  users,
  onAssign,
  onResolveAction,
}: TicketCardProps) => {
  return (
    <Card
      title={`Ticket ${ticket.id}`}
      variant="borderless"
      className="flex flex-col h-full"
    >
      <div className="mb-3">
        <span className="font-medium text-sm sm:text-base mr-2">Assignee:</span>
        <Select
          value={ticket.assigneeId ?? undefined}
          className="w-full sm:w-40"
          size="small"
          placeholder="Select user"
          allowClear
          onClick={(e) => e.stopPropagation()}
          onChange={(value) => onAssign(ticket.id, value ?? null)}
          options={users.map((user) => ({
            value: user.id,
            label: user.name,
          }))}
        />
      </div>

      <div className="flex-grow mb-4">
        <div>
          <span className="font-medium text-sm sm:text-base mr-2">
            Description:
          </span>
          <span className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">
            {ticket.description}
          </span>
        </div>
      </div>

      <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm sm:text-base">Status:</span>
          {ticket.completed ? (
            <Tag color="success" className="text-xs sm:text-sm">
              Resolved
            </Tag>
          ) : (
            <Tag color="error" className="text-xs sm:text-sm">
              Unresolved
            </Tag>
          )}
        </div>
        <div className="flex justify-end sm:justify-start">
          {ticket.completed ? (
            <Button
              danger
              type="primary"
              size="small"
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onResolveAction(ticket, "unresolve");
              }}
            >
              Unresolve
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onResolveAction(ticket, "resolve");
              }}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
