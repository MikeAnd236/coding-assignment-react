import { Modal, Form, Input, Button, message } from "antd";
import React, { useState } from "react";
import { Ticket } from "@acme/shared-models";

interface CreateTicketModalProps {
  open: boolean;
  onOk: (newTicket: Ticket) => void;
  onCancel: () => void;
}

export function CreateTicketModal({
  open,
  onOk,
  onCancel,
}: CreateTicketModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create ticket");

      const newTicket: Ticket = await res.json();

      message.success(`Ticket #${newTicket.id} created successfully! 🎉`);

      form.resetFields();
      onOk(newTicket);
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Error creating ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Create Ticket"
      onCancel={onCancel}
      width="90%"
      style={{ maxWidth: 600 }}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleCreate}
        >
          Create
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        labelCol={{ xs: { span: 24 }, sm: { span: 6 } }}
        wrapperCol={{ xs: { span: 24 }, sm: { span: 18 } }}
      >
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter ticket description"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
