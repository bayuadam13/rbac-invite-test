import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
} from "antd";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/api";

const { Option } = Select;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(JSON.parse(localStorage.getItem("user")));
      setToken(localStorage.getItem("access"));
    }
  }, []);

  useEffect(() => {
    if (user && token) fetchUsers();
  }, [user, token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(token);
      const sorted = res.data.sort((a, b) => a.id - b.id);
      setUsers(sorted);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.role,
      is_active: record.is_active,
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await updateUser(token, editing.id, values);
        message.success("User updated");
      } else {
        await createUser(token, values);
        message.success("User created");
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (user && user.id === id) {
      message.error("You cannot delete your own account");
      return;
    }
    try {
      await deleteUser(token, id);
      message.success("User deleted");
      fetchUsers();
    } catch {
      message.error("Delete failed");
    }
  };

  if (!user) return <div>Loading...</div>;
  if (user.role !== "admin") return <div>Not authorized</div>;

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Username", dataIndex: "username", key: "username", width: 180 },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role", width: 120 },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (v) => (v ? "Yes" : "No"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <>
          <Button onClick={() => openEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Popconfirm
            title="Delete user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
        Users
      </h1>

      <Card
        style={{
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Button
          type="primary"
          onClick={openCreate}
          style={{ marginBottom: 16 }}
        >
          + Add User
        </Button>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          style={{ background: "white", borderRadius: 10 }}
        />
      </Card>

      <Modal
        title={editing ? "Edit User" : "Add User"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="staff">Staff</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            help="Fill only if you want to set/reset password"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="is_active" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
