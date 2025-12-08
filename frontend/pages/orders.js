import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Select,
} from "antd";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(JSON.parse(localStorage.getItem("user")));
      setToken(localStorage.getItem("access"));
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProducts();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/products/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      message.error("Failed to load products");
    }
  };

  const openModal = (order = null) => {
    setEditingOrder(order);
    form.resetFields();

    if (order) {
      form.setFieldsValue({
        product: order.product,
        quantity: order.quantity,
      });
    }

    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingOrder) {
        await axios.put(
          `http://127.0.0.1:8000/api/orders/${editingOrder.id}/`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Order updated");
      } else {
        await axios.post("http://127.0.0.1:8000/api/orders/", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("Order added");
      }

      setModalVisible(false);
      fetchOrders();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/orders/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Deleted");
      fetchOrders();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const baseColumns = [
    {
      title: "Product",
      dataIndex: "product_name",
      width: 250,
      render: (_, r) => r.product_name || `Product #${r.product}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 140,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      width: 220,
      render: (v) => new Date(v).toLocaleString(),
    },
  ];

  const actionColumn = {
    title: "Actions",
    width: 200,
    render: (_, record) => (
      <>
        <Button onClick={() => openModal(record)} style={{ marginRight: 8 }}>
          Edit
        </Button>
        {user?.role === "admin" && (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        )}
      </>
    ),
  };

  const columns =
    user?.role === "staff" ? baseColumns : [...baseColumns, actionColumn];

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
        Orders
      </h1>

      <Card
        style={{
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {user?.role === "admin" && (
          <Button
            type="primary"
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            + Add Order
          </Button>
        )}

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          style={{ background: "white", borderRadius: 10 }}
        />
      </Card>

      <Modal
        title={editingOrder ? "Edit Order" : "Add Order"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText={editingOrder ? "Update" : "Add Order"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Product"
            name="product"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select product">
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Quantity required" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
