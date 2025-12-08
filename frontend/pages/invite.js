import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  message,
  Card,
  Space
} from "antd";
import {
  getInvitations,
  sendInvitation,
  resendInvitation,
  revokeInvitation
} from "../services/api";

export default function InviteUsers() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  const fetchInvitations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getInvitations(token);
      setInvitations(res.data);
    } catch (err) {
      message.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const onFinish = async (values) => {
    try {
      await sendInvitation(token, values);
      message.success("Invitation sent!");
      form.resetFields();
      fetchInvitations();
    } catch (err) {
      message.error("Send failed");
    }
  };

  const handleResend = async (id) => {
    try {
      await resendInvitation(token, id);
      message.success("Invitation resent!");
    } catch (err) {
      message.error("Failed to resend");
    }
  };

  const handleRevoke = async (id) => {
    try {
      await revokeInvitation(token, id);
      message.success("Invitation revoked");
      fetchInvitations();
    } catch (err) {
      message.error("Failed to revoke");
    }
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Token", dataIndex: "token", key: "token" },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      render: (used) => (used ? "Yes" : "No"),
    },
    { title: "Expires At", dataIndex: "expires_at", key: "expires_at" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleResend(record.id)}
            disabled={record.used}
          >
            Resend
          </Button>

          <Button
            size="small"
            danger
            onClick={() => handleRevoke(record.id)}
            disabled={record.used}
          >
            Revoke
          </Button>
        </Space>
      ),
    },

  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
        Invite Users
      </h1>

      <Card
        style={{
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Enter email to invite" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Send Invitation
          </Button>
        </Form>
      </Card>

      <Card
        style={{
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          dataSource={invitations}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          style={{ background: "white", borderRadius: 10 }}
        />
      </Card>
    </div>
  );
}
