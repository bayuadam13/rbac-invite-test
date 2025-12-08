import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout, Menu, Button, Avatar } from "antd";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) router.push("/");
    else setUser(u);
  }, []);

  if (!user) return null;

  // Menu with icons
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <AppstoreOutlined /> },
    { key: "products", label: "Products", icon: <ShoppingCartOutlined /> },
    { key: "orders", label: "Orders", icon: <OrderedListOutlined /> },
    { key: "invite", label: "Invite Users", icon: <TeamOutlined />, roles: ["admin", "manager"] },
    { key: "users", label: "Users", icon: <UserOutlined />, roles: ["admin"] },
  ];

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const handleMenuClick = (e) => {
    router.push(`/${e.key}`);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: "#1e1e2f",
          paddingTop: 20,
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            color: "white",
            textAlign: "center",
            marginBottom: 30,
            fontSize: collapsed ? 16 : 20,
            fontWeight: "bold",
          }}
        >
          {collapsed ? "RB" : "Admin Portal"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          style={{
            background: "transparent",
            fontSize: 15,
            fontWeight: 500,
          }}
          onClick={handleMenuClick}
          items={filteredMenu.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 600 }}>
            Welcome, {user.username}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <Avatar style={{ background: "#7265e6" }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>

            <Button
              type="primary"
              danger
              onClick={() => {
                localStorage.clear();
                router.push("/");
              }}
            >
              Logout
            </Button>
          </div>
        </Header>

        <Content style={{ margin: "24px", padding: 24, background: "#fff", borderRadius: 12 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700 }}>Dashboard Overview</h2>
          <p style={{ color: "#555", marginTop: 8 }}>
            Select a menu on the left to manage your application.
          </p>

          {/* Example content box */}
          <div
            style={{
              marginTop: 30,
              padding: 20,
              background: "#f5f7fb",
              borderRadius: 10,
              border: "1px solid #e3e6ef",
            }}
          >
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
