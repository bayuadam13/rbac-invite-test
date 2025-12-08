import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Card,
} from "antd";
import axios from "axios";
import { getProducts } from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Local storage values
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false); // <-- FIX

  // Load user/token once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(JSON.parse(localStorage.getItem("user")));
      setToken(localStorage.getItem("access"));
      setReady(true);
    }
  }, []);

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getProducts(token);
      setProducts(res.data);
    } catch (err) {
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch after token is loaded
  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const openModal = (product = null) => {
    setEditingProduct(product);
    form.resetFields();
    if (product) form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await axios.put(
          `http://127.0.0.1:8000/api/products/${editingProduct.id}/`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Product updated");
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/products/`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Product added");
      }

      setModalVisible(false);
      fetchProducts();
    } catch (err) {
      message.error(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Deleted");
      fetchProducts();
    } catch (err) {
      message.error(err.response?.data?.detail || "Delete failed");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: 200 },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (v) => <b>${v}</b>,
      width: 120,
    },
  ];

 if (user?.role !== "staff") {
  columns.push({
    title: "Actions",
    key: "actions",
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
  });
}


  if (!ready) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
        Products
      </h1>

      <Card
        style={{
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {user?.role === "admin" && (
          <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
            + Add Product
          </Button>
        )}

        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          style={{ background: "white", borderRadius: 10 }}
        />
      </Card>

      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        okText={editingProduct ? "Update" : "Add Product"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Product name required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Price required" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
