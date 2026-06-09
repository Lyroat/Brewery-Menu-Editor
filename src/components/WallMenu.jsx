import { useRef, useState, useMemo } from 'react'
import { Button, Checkbox, Space, Typography, Empty, Modal, Dropdown, message, ColorPicker, Select, Input, InputNumber } from 'antd'
import { DownloadOutlined, FileImageOutlined, FilePdfOutlined, EyeOutlined, LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

const { Title, Text } = Typography

function isColorDark(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

const DEFAULT_WALL_WIDTH = 540
const DEFAULT_WALL_HEIGHT = 180

export default function WallMenu({ menus }) {
  const [selectedKeys, setSelectedKeys] = useState([])
  const [bgColor, setBgColor] = useState('#1a1a2e')
  const [itemBgColors, setItemBgColors] = useState({})
  const [previewIndex, setPreviewIndex] = useState(null)
  const [fontSize, setFontSize] = useState('large')
  const [searchText, setSearchText] = useState('')
  const [wallWidth, setWallWidth] = useState(DEFAULT_WALL_WIDTH)
  const [wallHeight, setWallHeight] = useState(DEFAULT_WALL_HEIGHT)
  const [wallSizeMode, setWallSizeMode] = useState('default')
  const cardRefs = useRef({})

  const allBeers = useMemo(() => {
    const map = new Map()
    menus.forEach(menu => {
      menu.items.forEach(item => {
        if (!item.name) return
        const key = `${item.brand || ''}_${item.name}`
        if (!map.has(key)) {
          map.set(key, { ...item, _sourceMenu: menu.name })
        }
      })
    })
    return Array.from(map.values())
  }, [menus])

  const filteredBeers = useMemo(() => {
    if (!searchText.trim()) return allBeers.map((item, i) => ({ item, originalIndex: i }))
    const keyword = searchText.trim().toLowerCase()
    return allBeers
      .map((item, i) => ({ item, originalIndex: i }))
      .filter(({ item }) => item.name?.toLowerCase().includes(keyword))
  }, [allBeers, searchText])

  const selectedBeers = useMemo(() => {
    return allBeers.filter((_, i) => selectedKeys.includes(i))
  }, [allBeers, selectedKeys])

  const handleSelectAll = () => {
    if (selectedKeys.length === allBeers.length) {
      setSelectedKeys([])
    } else {
      setSelectedKeys(allBeers.map((_, i) => i))
    }
  }

  const handleToggle = (index) => {
    setSelectedKeys(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const sizeScale = Math.min(wallWidth / DEFAULT_WALL_WIDTH, wallHeight / DEFAULT_WALL_HEIGHT)
  const fontSizeMultiplier = fontSize === 'large' ? 1.25 : fontSize === 'medium' ? 1 : 0.8
  const fontScale = fontSizeMultiplier * sizeScale

  const renderWallCard = (item, index) => {
    const cardBg = itemBgColors[index] || bgColor
    const isDark = isColorDark(cardBg)
    const textColor = isDark ? '#ffffff' : '#1a1a1a'
    const subtleColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
    const accentColor = item._imageColor || (isDark ? '#e94560' : '#c0392b')
    const secondaryColor = item._imageColorSecondary || subtleColor
    const darkColor = item._imageColorDark || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)')
    const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
    const imgSide = wallHeight - Math.round(28 * sizeScale)
    const padH = Math.round(24 * sizeScale)
    const gap = Math.round(20 * sizeScale)

    return (
      <div
        key={index}
        ref={el => cardRefs.current[index] = el}
        style={{
          width: `${wallWidth}px`,
          height: `${wallHeight}px`,
          backgroundColor: cardBg,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${padH}px`,
          gap: `${gap}px`,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${borderColor}`,
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Image */}
        {item.image && (
          <div style={{
            width: `${imgSide}px`,
            height: `${imgSide}px`,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {(() => {
              const cw = item._cropW || 100
              const ch = item._cropH || 100
              return (
                <img src={item.image} alt="" style={{
                  position: 'absolute',
                  width: `${(100 / cw) * 100}%`,
                  height: `${(100 / ch) * 100}%`,
                  left: `${-((item._cropX || 0) / cw) * 100}%`,
                  top: `${-((item._cropY || 0) / ch) * 100}%`,
                  maxWidth: 'none',
                }} />
              )
            })()}
          </div>
        )}

        {/* Right: Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: `${4 * fontScale}px`, overflow: 'hidden' }}>
          {(item.brand || item.origin) && (
            <div style={{
              color: darkColor,
              fontSize: `${Math.round(11 * fontScale)}px`,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}>
              {item.brand && <span>{item.brand}</span>}
              {item.origin && <span style={{ fontWeight: 400, color: secondaryColor }}>{item.origin}</span>}
            </div>
          )}

          {item.name && (
            <div style={{
              color: accentColor,
              fontSize: `${Math.round(26 * fontScale)}px`,
              fontWeight: 800,
              lineHeight: 1.1,
              fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.name}
            </div>
          )}

          {(item.style || item.styleEn) && (
            <div style={{ lineHeight: 1.3 }}>
              {item.style && <div style={{ color: secondaryColor, fontSize: `${Math.round(12 * fontScale)}px` }}>{item.style}</div>}
              {item.styleEn && <div style={{ color: subtleColor, fontSize: `${Math.round(11 * fontScale)}px`, fontStyle: 'italic', marginTop: '1px' }}>{item.styleEn}</div>}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
            <div style={{ display: 'flex', gap: '10px', color: darkColor, fontSize: `${Math.round(11 * fontScale)}px` }}>
              {item.hops && <span>{item.hops}</span>}
              {item.abv && <span>{item.abv}%</span>}
              {item.ml && <span>{item.ml}mL</span>}
              {item.cupType && <span>{item.cupType}</span>}
            </div>
            {item.price && (
              <div style={{
                color: accentColor,
                fontSize: `${Math.round(22 * fontScale)}px`,
                fontWeight: 800,
                fontFamily: "'Playfair Display', serif",
              }}>
                <span style={{ fontSize: `${Math.round(12 * fontScale)}px`, fontWeight: 600 }}>¥</span>
                {item.price}
              </div>
            )}
          </div>
        </div>

        {/* Number - aligned above price area */}
        <div style={{
          position: 'absolute',
          top: `${Math.round(10 * sizeScale)}px`,
          right: `${padH}px`,
          color: accentColor,
          fontSize: `${Math.round(24 * fontScale)}px`,
          fontWeight: 800,
          fontFamily: "'Playfair Display', serif",
          opacity: 0.55,
        }}>
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>
    )
  }

  const handleExportSelected = async (format) => {
    if (selectedBeers.length === 0) {
      message.warning('请先选择要导出的酒款')
      return
    }
    message.loading('正在导出...', 0)

    try {
      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf')
        let pdf = null

        for (let i = 0; i < selectedBeers.length; i++) {
          const el = cardRefs.current[selectedKeys[i]]
          if (!el) continue
          const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 })
          const imgData = canvas.toDataURL('image/png')
          const w = canvas.width / 2
          const h = canvas.height / 2

          if (i === 0) {
            pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [w, h] })
          } else {
            pdf.addPage([w, h], 'landscape')
          }
          pdf.addImage(imgData, 'PNG', 0, 0, w, h)
        }
        pdf.save('墙贴酒单.pdf')
      } else {
        const zip = new JSZip()
        for (let i = 0; i < selectedBeers.length; i++) {
          const el = cardRefs.current[selectedKeys[i]]
          if (!el) continue
          const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 })
          const blob = await new Promise(resolve => canvas.toBlob(resolve))
          zip.file(`${String(i + 1).padStart(2, '0')}_${selectedBeers[i].name || '酒款'}.png`, blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, '墙贴酒单.zip')
      }
      message.destroy()
      message.success(`成功导出 ${selectedBeers.length} 张墙贴`)
    } catch (err) {
      message.destroy()
      message.error('导出失败: ' + err.message)
    }
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>墙贴酒单</Title>
          <Input
            placeholder="搜索酒名..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 180 }}
          />
        </Space>
        <Space>
          <Space size="small">
            <span>背景色:</span>
            <ColorPicker
              value={bgColor}
              onChange={(c) => setBgColor(c.toHexString())}
              presets={[{
                label: '推荐',
                colors: ['#1a1a2e', '#0d0d1a', '#0a0a0a', '#1e3a5f', '#2d1b69', '#f5f0e1', '#fafafa', '#ffffff'],
              }]}
            />
          </Space>
          <Space size="small">
            <span>字号:</span>
            <Select
              value={fontSize}
              onChange={setFontSize}
              style={{ width: 80 }}
              options={[
                { label: '大', value: 'large' },
                { label: '中', value: 'medium' },
                { label: '小', value: 'small' },
              ]}
            />
          </Space>
          <Space size="small">
            <span>尺寸:</span>
            <Select
              value={wallSizeMode}
              onChange={(val) => {
                setWallSizeMode(val)
                if (val === 'default') { setWallWidth(DEFAULT_WALL_WIDTH); setWallHeight(DEFAULT_WALL_HEIGHT) }
              }}
              style={{ width: 100 }}
              options={[
                { label: '默认 3:1', value: 'default' },
                { label: '自定义', value: 'custom' },
              ]}
            />
            {wallSizeMode === 'custom' && (
              <>
                <InputNumber value={wallWidth} onChange={v => setWallWidth(v || DEFAULT_WALL_WIDTH)} min={200} max={1500} size="small" style={{ width: 65 }} />
                <span>×</span>
                <InputNumber value={wallHeight} onChange={v => setWallHeight(v || DEFAULT_WALL_HEIGHT)} min={80} max={800} size="small" style={{ width: 65 }} />
                <span style={{ fontSize: 11, color: '#999' }}>px</span>
              </>
            )}
          </Space>
          <Button onClick={handleSelectAll}>
            {selectedKeys.length === allBeers.length ? '取消全选' : '全选'}
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'png', icon: <FileImageOutlined />, label: '导出 PNG' },
                { key: 'pdf', icon: <FilePdfOutlined />, label: '导出 PDF' },
              ],
              onClick: ({ key }) => handleExportSelected(key),
            }}
            trigger={['click']}
          >
            <Button type="primary" icon={<DownloadOutlined />} disabled={selectedKeys.length === 0}>
              导出选中 ({selectedKeys.length})
            </Button>
          </Dropdown>
        </Space>
      </div>

      {allBeers.length === 0 ? (
        <Empty description="暂无酒款，请先在编辑酒单中添加酒品" style={{ marginTop: 60 }} />
      ) : filteredBeers.length === 0 ? (
        <Empty description={`未找到 "${searchText}" 相关酒款`} style={{ marginTop: 60 }} />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, overflowX: 'auto' }}>
          {filteredBeers.map(({ item, originalIndex }) => (
            <div key={originalIndex} style={{ display: 'flex', alignItems: 'stretch', gap: 0, width: `calc(50% - 6px)`, minWidth: wallWidth + 44 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px',
                background: '#f5f5f5',
                borderRadius: '4px 0 0 4px',
                minWidth: 36,
              }}>
                <Checkbox
                  checked={selectedKeys.includes(originalIndex)}
                  onChange={() => handleToggle(originalIndex)}
                  style={{ transform: 'scale(1.3)' }}
                />
                <ColorPicker
                  value={itemBgColors[originalIndex] || bgColor}
                  onChange={(c) => setItemBgColors(prev => ({ ...prev, [originalIndex]: c.toHexString() }))}
                  size="small"
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                {renderWallCard(item, originalIndex)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <Modal
        open={previewIndex !== null}
        onCancel={() => setPreviewIndex(null)}
        footer={null}
        width={wallWidth + 48}
        style={{ top: 40 }}
        styles={{ body: { padding: 16, overflow: 'auto' } }}
        destroyOnClose
      >
        {previewIndex !== null && selectedBeers[previewIndex] && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {renderWallCard(selectedBeers[previewIndex], previewIndex)}
            {selectedBeers.length > 1 && (
              <Space>
                <Button icon={<LeftOutlined />} disabled={previewIndex <= 0} onClick={() => setPreviewIndex(p => p - 1)} />
                <span>{previewIndex + 1} / {selectedBeers.length}</span>
                <Button icon={<RightOutlined />} disabled={previewIndex >= selectedBeers.length - 1} onClick={() => setPreviewIndex(p => p + 1)} />
              </Space>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
