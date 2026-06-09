import { useState, useEffect } from 'react'
import { ConfigProvider, Layout, Tabs, message } from 'antd'
import { EditOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons'
import MenuEditor from './components/MenuEditor'
import MenuPreview from './components/MenuPreview'
import WallMenu from './components/WallMenu'
import { extractPalette } from './utils/extractPalette'
import './App.css'

const { Header, Content } = Layout

const defaultFields = [
  { key: 'brand', label: '厂牌', type: 'text' },
  { key: 'origin', label: '产地', type: 'text' },
  { key: 'name', label: '啤酒商品名', type: 'text' },
  { key: 'style', label: '类型（中文）', type: 'text' },
  { key: 'styleEn', label: '类型（英文）', type: 'text' },
  { key: 'hops', label: '啤酒花', type: 'text' },
  { key: 'abv', label: '酒精度', type: 'number', unit: '%' },
  { key: 'cupType', label: '杯型大小', type: 'text' },
  { key: 'ml', label: '毫升', type: 'number', unit: 'mL' },
  { key: 'price', label: '售价', type: 'number', unit: '¥' },
  { key: 'image', label: '宣传图', type: 'image' },
]

const defaultTemplate = {
  name: '经典酒单模板',
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  accentColor: '#e94560',
  fontFamily: 'sans-serif',
  layout: 'card',
  sizePreset: 'a4-portrait-1',
  canvasSize: { width: 794, height: 1123 },
  cols: 1,
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
      { brand: '玄水屋', origin: '中国', name: '七海大侦探', style: '双倍干投双倍西海岸IPA', styleEn: 'DDH DOUBLE WEST COAST IPA', hops: 'Citra, Mosaic', abv: 8.1, cupType: '大杯', ml: 473, price: 52, image: '' },
      { brand: '高大师', origin: '中国', name: '婴儿肥', style: '印度淡色艾尔', styleEn: 'IPA', hops: 'Cascade', abv: 5.5, cupType: '中杯', ml: 330, price: 38, image: '' },
      { brand: '牛啤堂', origin: '中国', name: '帝都海盐', style: '古斯', styleEn: 'Gose', hops: 'Saaz', abv: 4.2, cupType: '大杯', ml: 473, price: 45, image: '' },
    ],
  },
  {
    id: 2,
    name: '世涛与波特',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '深色主题', backgroundColor: '#0d0d1a', accentColor: '#f0a500' },
    items: [
      { brand: '酿酒狗', origin: '苏格兰', name: '东京*', style: '帝国世涛', styleEn: 'Imperial Stout', hops: 'Sorachi Ace', abv: 18.2, cupType: '小杯', ml: 200, price: 68, image: '' },
      { brand: '左手', origin: '美国', name: '氮气牛奶世涛', style: '牛奶世涛', styleEn: 'Milk Stout', hops: 'Magnum', abv: 6.0, cupType: '大杯', ml: 473, price: 48, image: '' },
    ],
  },
  {
    id: 3,
    name: '夏日小麦',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '清新主题', backgroundColor: '#f5f0e1', textColor: '#333333', accentColor: '#e67e22' },
    items: [
      { brand: '保拉纳', origin: '德国', name: '小麦啤酒', style: '德式小麦', styleEn: 'Hefeweizen', hops: 'Hallertau', abv: 5.5, cupType: '大杯', ml: 500, price: 42, image: '' },
      { brand: '白熊', origin: '比利时', name: '白熊', style: '比利时小麦', styleEn: 'Witbier', hops: 'Saaz', abv: 4.7, cupType: '中杯', ml: 330, price: 35, image: '' },
      { brand: '鹅岛', origin: '美国', name: '312城市小麦', style: '城市小麦', styleEn: 'Urban Wheat', hops: 'Cascade', abv: 4.2, cupType: '大杯', ml: 473, price: 40, image: '' },
    ],
  },
  {
    id: 4,
    name: '酸啤探索',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '活力主题', backgroundColor: '#2d1b69', accentColor: '#e74c3c' },
    items: [
      { brand: '3泉', origin: '比利时', name: '老贵兹', style: '贵兹', styleEn: 'Gueuze', hops: 'Aged Hops', abv: 6.0, cupType: '中杯', ml: 375, price: 88, image: '' },
      { brand: '康帝隆', origin: '比利时', name: '克里克', style: '水果兰比克', styleEn: 'Kriek', hops: 'Aged Hops', abv: 5.0, cupType: '中杯', ml: 375, price: 78, image: '' },
    ],
  },
  {
    id: 5,
    name: '拉格畅饮',
    fields: [...defaultFields],
    template: { ...defaultTemplate, name: '简约主题', backgroundColor: '#1e3a5f', accentColor: '#3498db' },
    items: [
      { brand: '朝日', origin: '日本', name: '超爽', style: '超级干', styleEn: 'Super Dry', hops: 'Saaz', abv: 5.0, cupType: '大杯', ml: 500, price: 28, image: '' },
      { brand: '百威', origin: '美国', name: '百威', style: '美式拉格', styleEn: 'American Lager', hops: 'Hallertau', abv: 5.0, cupType: '大杯', ml: 473, price: 25, image: '' },
      { brand: '青岛', origin: '中国', name: '青岛经典', style: '拉格', styleEn: 'Lager', hops: 'Saaz', abv: 4.7, cupType: '大杯', ml: 500, price: 20, image: '' },
      { brand: '喜力', origin: '荷兰', name: '喜力', style: '欧式拉格', styleEn: 'Euro Lager', hops: 'Saaz', abv: 5.0, cupType: '大杯', ml: 330, price: 30, image: '' },
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
  const [activeTab, setActiveTab] = useState('edit')

  useEffect(() => {
    localStorage.setItem('menu_editor_menus', JSON.stringify(menus))
  }, [menus])

  useEffect(() => {
    let needsUpdate = false
    const itemsToProcess = []
    menus.forEach((menu, mi) => {
      menu.items.forEach((item, ii) => {
        if (item.image && !item._imageColorSecondary) {
          needsUpdate = true
          const crop = (item._cropW && item._cropW < 100)
            ? { x: item._cropX || 0, y: item._cropY || 0, w: item._cropW, h: item._cropH || item._cropW }
            : undefined
          itemsToProcess.push({ mi, ii, image: item.image, crop })
        }
      })
    })
    if (!needsUpdate) return
    Promise.all(itemsToProcess.map(({ image, crop }) => extractPalette(image, crop))).then(results => {
      setMenus(prev => {
        const updated = JSON.parse(JSON.stringify(prev))
        itemsToProcess.forEach(({ mi, ii }, idx) => {
          const palette = results[idx]
          if (palette && updated[mi]?.items[ii]) {
            updated[mi].items[ii]._imageColor = palette.primary
            updated[mi].items[ii]._imageColorSecondary = palette.secondary
            updated[mi].items[ii]._imageColorDark = palette.dark
          }
        })
        return updated
      })
    })
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

  const activeMenu = menus.find(m => m.id === activeMenuId)

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
    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenuId) return m
      const updated = [...m.items]
      if (typeof key === 'object') {
        updated[index] = { ...updated[index], ...key }
      } else {
        updated[index] = { ...updated[index], [key]: value }
      }
      return { ...m, items: updated }
    }))
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
      key: 'wall',
      label: (
        <span>
          <PictureOutlined />
          墙贴酒单
        </span>
      ),
      children: (
        <WallMenu menus={menus} />
      ),
    },
  ]

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#e94560' } }}>
      <Layout className="app-layout">
        <Header className="app-header">
          <h1>酒单编辑器</h1>
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
