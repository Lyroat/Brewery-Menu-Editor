import { useState } from 'react'
import { Card, Form, Input, Button, Tabs, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'naburanne',
  role: 'admin',
}

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const getUsers = () => {
    const users = localStorage.getItem('menu_editor_users')
    return users ? JSON.parse(users) : []
  }

  const saveUsers = (users) => {
    localStorage.setItem('menu_editor_users', JSON.stringify(users))
  }

  const handleLogin = (values) => {
    setLoading(true)

    setTimeout(() => {
      const { username, password } = values

      // 检查管理员账号
      if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
        message.success('管理员登录成功')
        onLogin({ username, role: 'admin' })
        setLoading(false)
        return
      }

      // 检查普通用户账号
      const users = getUsers()
      const user = users.find(u => u.username === username && u.password === password)

      if (user) {
        message.success('登录成功')
        onLogin({ username, role: 'user' })
      } else {
        message.error('账号或密码错误')
      }

      setLoading(false)
    }, 500)
  }

  const handleRegister = (values) => {
    setLoading(true)

    setTimeout(() => {
      const { username, password, confirmPassword } = values

      if (password !== confirmPassword) {
        message.error('两次密码输入不一致')
        setLoading(false)
        return
      }

      // 检查是否是管理员账号
      if (username === ADMIN_ACCOUNT.username) {
        message.error('该用户名已被占用')
        setLoading(false)
        return
      }

      // 检查用户是否已存在
      const users = getUsers()
      if (users.find(u => u.username === username)) {
        message.error('该用户名已存在')
        setLoading(false)
        return
      }

      // 注册新用户
      const newUser = { username, password, role: 'user', createdAt: new Date().toISOString() }
      users.push(newUser)
      saveUsers(users)

      message.success('注册成功，请登录')
      setActiveTab('login')
      setLoading(false)
    }, 500)
  }

  const loginForm = (
    <Form onFinish={handleLogin} size="large">
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入账号' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="账号" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} icon={<LoginOutlined />} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form onFinish={handleRegister} size="large">
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入账号' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="账号" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        rules={[{ required: true, message: '请确认密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} icon={<UserAddOutlined />} block>
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: loginForm,
    },
    {
      key: 'register',
      label: '注册',
      children: registerForm,
    },
  ]

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2} style={{ margin: 0, color: '#e94560' }}>酒单编辑器</Title>
          <Text type="secondary">精酿酒馆酒单设计工具</Text>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
        />
      </Card>
    </div>
  )
}
