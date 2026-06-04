import { useState, useEffect } from 'react'
import { ConfigProvider, Layout, Tabs, Button, message, Tag, Space } from 'antd'
import { EditOutlined, EyeOutlined, SaveOutlined, LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import MenuEditor from './components/MenuEditor'
import MenuPreview from './components/MenuPreview'
import TemplateManager from './components/TemplateManager'
import LoginPage from './components/LoginPage'
import './App.css'

const { Header, Content } = Layout

const defaultFields = [
  { key: 'brand', label: '厂牌', type: 'text' },
  { key: 'name', label: '款名', type: 'text' },
  { key: 'style', label: '风格', type: 'text' },
  { key: 'styleEn', label: '风格（英文）', type: 'text' },
  { key: 'origin', label: '产地', type: 'text' },
  { key: 'abv', label: '酒精度', type: 'number' },
  { key: 'cupType', label: '杯型', type: 'select', options: ['大杯', '中杯', '小杯'] },
  { key: 'price', label: '定价', type: 'number' },
  { key: 'image', label: '宣传图片', type: 'image' },
]

const defaultTemplate = {
  name: '经典酒单模板',
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  accentColor: '#e94560',
  fontFamily: 'sans-serif',
  layout: 'card',
  canvasSize: { width: 400, height: 500 },
  backgroundImage: '',
  backgroundOpacity: 0.15,
}

const sampleMenus = [
  {
    id: 1,
    name: '精酿 IPA 专场',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '深色主题' },
    items: [
      { brand: '玄水屋', name: '七海大侦探', style: '双倍干投双倍西海岸IPA', styleEn: 'DDH DOUBLE WEST COAST IPA', origin: '西安', abv: 8.1, cupType: '大杯', price: 52, image: '' },
      { brand: '高大师', name: '婴儿肥', style: '印度淡色艾尔', styleEn: 'IPA', origin: '南京', abv: 5.5, cupType: '中杯', price: 38, image: '' },
      { brand: '牛啤堂', name: '帝都海盐', style: '古斯', styleEn: 'Gose', origin: '北京', abv: 4.2, cupType: '大杯', price: 45, image: '' },
    ],
  },
  {
    id: 2,
    name: '世涛与波特',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '深色主题', backgroundColor: '#0d0d1a', accentColor: '#f0a500' },
    items: [
      { brand: '酿酒狗', name: '东京*', style: '帝国世涛', styleEn: 'Imperial Stout', origin: '苏格兰', abv: 18.2, cupType: '小杯', price: 68, image: '' },
      { brand: '左手', name: '氮气牛奶世涛', style: '牛奶世涛', styleEn: 'Milk Stout', origin: '美国', abv: 6.0, cupType: '大杯', price: 48, image: '' },
    ],
  },
  {
    id: 3,
    name: '夏日小麦',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '清新主题', backgroundColor: '#f5f0e1', textColor: '#333333', accentColor: '#e67e22' },
    items: [
      { brand: '保拉纳', name: '小麦啤酒', style: '德式小麦', styleEn: 'Hefeweizen', origin: '德国', abv: 5.5, cupType: '大杯', price: 42, image: '' },
      { brand: '白熊', name: '白熊', style: '比利时小麦', styleEn: 'Witbier', origin: '比利时', abv: 4.7, cupType: '中杯', price: 35, image: '' },
      { brand: '鹅岛', name: '312城市小麦', style: '城市小麦', styleEn: 'Urban Wheat', origin: '美国', abv: 4.2, cupType: '大杯', price: 40, image: '' },
    ],
  },
  {
    id: 4,
    name: '酸啤探索',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '活力主题', backgroundColor: '#2d1b69', accentColor: '#e74c3c' },
    items: [
      { brand: '3泉', name: '老贵兹', style: '贵兹', styleEn: 'Gueuze', origin: '比利时', abv: 6.0, cupType: '中杯', price: 88, image: '' },
      { brand: '康帝隆', name: '克里克', style: '水果兰比克', styleEn: 'Kriek', origin: '比利时', abv: 5.0, cupType: '中杯', price: 78, image: '' },
    ],
  },
  {
    id: 5,
    name: '拉格畅饮',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '简约主题', backgroundColor: '#1e3a5f', accentColor: '#3498db' },
    items: [
      { brand: '朝日', name: '超爽', style: '超级干', styleEn: 'Super Dry', origin: '日本', abv: 5.0, cupType: '大杯', price: 28, image: '' },
      { brand: '百威', name: '百威', style: '美式拉格', styleEn: 'American Lager', origin: '美国', abv: 5.0, cupType: '大杯', price: 25, image: '' },
      { brand: '青岛', name: '青岛经典', style: '拉格', styleEn: 'Lager', origin: '中国', abv: 4.7, cupType: '大杯', price: 20, image: '' },
      { brand: '喜力', name: '喜力', style: '欧式拉格', styleEn: 'Euro Lager', origin: '荷兰', abv: 5.0, cupType: '大杯', price: 30, image: '' },
    ],
  },
]

const createNewMenu = (name = '新酒单') => ({
  id: Date.now(),
  name,
  items: [],
  fields: [...defaultFields],
  template: { ...defaultTemplate },
})

function App() {
  const [user, setUser] = useState(null)
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('menu_editor_menus')
    return saved ? JSON.parse(saved) : sampleMenus
  })
  const [activeMenuId, setActiveMenuId] = useState(() => {
    const savedMenus = localStorage.getItem('menu_editor_menus')
    if (savedMenus) {
      const parsed = JSON.parse(savedMenus)
      return parsed.length > 0 ? parsed[0].id : sampleMenus[0].id
    }
    return sampleMenus[0].id
  })
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('menu_editor_templates')
    return saved ? JSON.parse(saved) : [defaultTemplate]
  })
  const [activeTab, setActiveTab] = useState('edit')

  useEffect(() => {
    localStorage.setItem('menu_editor_menus', JSON.stringify(menus))
  }, [menus])

  useEffect(() => {
    localStorage.setItem('menu_editor_templates', JSON.stringify(templates))
  }, [templates])

  useEffect(() => {
    const savedUser = localStorage.getItem('menu_editor_current_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])

  const pushUndo = () => {
    const menu = menus.find(m => m.id === activeMenuId)
    if (menu) {
      setUndoStack(prev => [...prev.slice(-49), {
        items: JSON.parse(JSON.stringify(menu.items)),
        fields: JSON.parse(JSON.stringify(menu.fields)),
      }])
      setRedoStack([])
    }
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const menu = menus.find(m => m.id === activeMenuId)
    const prevState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, {
      items: JSON.parse(JSON.stringify(menu.items)),
      fields: JSON.parse(JSON.stringify(menu.fields)),
    }])
    updateActiveMenu({ items: prevState.items, fields: prevState.fields })
    setUndoStack(prev => prev.slice(0, -1))
    message.info('已撤销')
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const menu = menus.find(m => m.id === activeMenuId)
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, {
      items: JSON.parse(JSON.stringify(menu.items)),
      fields: JSON.parse(JSON.stringify(menu.fields)),
    }])
    updateActiveMenu({ items: nextState.items, fields: nextState.fields })
    setRedoStack(prev => prev.slice(0, -1))
    message.info('已重做')
  }

  useEffect(() => {
    const handler = (e) => {
      if (activeTab !== 'edit') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undoStack, redoStack, activeTab, activeMenuId, menus])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('menu_editor_current_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('menu_editor_current_user')
    message.success('已退出登录')
  }

  const activeMenu = menus.find(m => m.id === activeMenuId)
  const isAdmin = user?.role === 'admin'

  const updateActiveMenu = (updates) => {
    setMenus(menus.map(m => m.id === activeMenuId ? { ...m, ...updates } : m))
  }

  const handleAddItem = () => {
    pushUndo()
    const newItem = {}
    activeMenu.fields.forEach(f => {
      newItem[f.key] = f.type === 'number' ? 0 : ''
    })
    updateActiveMenu({ items: [...activeMenu.items, newItem] })
  }

  const handleUpdateItem = (index, key, value) => {
    const updated = [...activeMenu.items]
    updated[index] = { ...updated[index], [key]: value }
    updateActiveMenu({ items: updated })
  }

  const handleDeleteItem = (index) => {
    pushUndo()
    updateActiveMenu({ items: activeMenu.items.filter((_, i) => i !== index) })
  }

  const handleAddField = (field) => {
    pushUndo()
    updateActiveMenu({
      fields: [...activeMenu.fields, field],
      items: activeMenu.items.map(item => ({ ...item, [field.key]: '' })),
    })
  }

  const handleDeleteField = (key) => {
    pushUndo()
    updateActiveMenu({
      fields: activeMenu.fields.filter(f => f.key !== key),
      items: activeMenu.items.map(item => {
        const newItem = { ...item }
        delete newItem[key]
        return newItem
      }),
    })
  }

  const handleSaveTemplate = (name) => {
    const newTemplate = { ...activeMenu.template, name }
    setTemplates([...templates, newTemplate])
    message.success(`模板 "${name}" 已保存`)
  }

  const handleLoadTemplate = (tmpl) => {
    updateActiveMenu({ template: tmpl })
    message.success(`已加载模板 "${tmpl.name}"`)
  }

  const handleImportItems = (items) => {
    pushUndo()
    updateActiveMenu({ items: [...activeMenu.items, ...items] })
  }

  const handleCreateMenu = () => {
    const newMenu = createNewMenu(`酒单 ${menus.length + 1}`)
    setMenus([...menus, newMenu])
    setActiveMenuId(newMenu.id)
    setActiveTab('edit')
    message.success('新酒单已创建')
  }

  const handleDeleteMenu = (menuId) => {
    if (menus.length <= 1) {
      message.warning('至少保留一个酒单')
      return
    }
    const newMenus = menus.filter(m => m.id !== menuId)
    setMenus(newMenus)
    if (activeMenuId === menuId) {
      setActiveMenuId(newMenus[0].id)
    }
    message.success('酒单已删除')
  }

  const handleEditMenu = (menuId) => {
    setActiveMenuId(menuId)
    setActiveTab('edit')
    setUndoStack([])
    setRedoStack([])
  }

  const handleGenerate = () => {
    setActiveTab('preview')
  }

  if (!user) {
    return (
      <ConfigProvider theme={{ token: { colorPrimary: '#e94560' } }}>
        <LoginPage onLogin={handleLogin} />
      </ConfigProvider>
    )
  }

  const tabItems = [
    {
      key: 'edit',
      label: (
        <span>
          <EditOutlined />
          编辑酒单
        </span>
      ),
      children: (
        <MenuEditor
          menuItems={activeMenu.items}
          fields={activeMenu.fields}
          templates={templates}
          currentTemplate={activeMenu.template}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddField={handleAddField}
          onDeleteField={handleDeleteField}
          onTemplateChange={(tmpl) => updateActiveMenu({ template: tmpl })}
          onGenerate={handleGenerate}
          onImportItems={handleImportItems}
          menuName={activeMenu.name}
          onMenuNameChange={(name) => updateActiveMenu({ name })}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      ),
    },
    {
      key: 'preview',
      label: (
        <span>
          <EyeOutlined />
          酒单列表
        </span>
      ),
      children: (
        <MenuPreview
          menus={menus}
          onEditMenu={handleEditMenu}
          onCreateMenu={handleCreateMenu}
          onDeleteMenu={handleDeleteMenu}
        />
      ),
    },
    {
      key: 'template',
      label: (
        <span>
          {isAdmin ? <SettingOutlined /> : <SaveOutlined />}
          {isAdmin ? '系统配置' : '模板管理'}
        </span>
      ),
      children: (
        <TemplateManager
          templates={templates}
          currentTemplate={activeMenu?.template || defaultTemplate}
          onSave={handleSaveTemplate}
          onLoad={handleLoadTemplate}
          onTemplateChange={(tmpl) => updateActiveMenu({ template: tmpl })}
          isAdmin={isAdmin}
        />
      ),
    },
  ]

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#e94560' } }}>
      <Layout className="app-layout">
        <Header className="app-header">
          <h1>酒单编辑器</h1>
          <Space>
            <Tag color={isAdmin ? 'red' : 'blue'} icon={isAdmin ? <SettingOutlined /> : <UserOutlined />}>
              {isAdmin ? '管理员' : '用户'}: {user.username}
            </Tag>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#fff' }}>
              退出
            </Button>
          </Space>
        </Header>
        <Content className="app-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App
