import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Form, Input, Button, message, Card, Typography } from "antd";

const { Title } = Typography;

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!token) {
      message.error("Invalid invitation token.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/invitations/accept/",
        {
          token,
          username: values.username,
          password: values.password,
        }
      );
      message.success("Invitation accepted! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data.detail) {
        message.error(err.response.data.detail);
      } else {
        message.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Accept Invitation
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Choose a username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Choose a password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Accept Invitation
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
