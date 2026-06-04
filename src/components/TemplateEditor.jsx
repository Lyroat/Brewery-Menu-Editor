import { useState, useCallback } from 'react'
import { Button, ColorPicker, InputNumber, Input, Space, Slider, Typography, message, Tooltip, Divider, Select } from 'antd'
import {
  SaveOutlined, UndoOutlined, RedoOutlined,
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  ZoomInOutlined, ZoomOutOutlined,
  BoldOutlined, PictureOutlined, FormOutlined,
} from '@ant-design/icons'

const { Text } = Typography

const defaultLayoutItems = [
  { id: 'title', label: '标题', type: 'title', text: '精酿酒单', x: 20, y: 20, width: 360, height: 60, fontSize: 36, fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'center', color: '#ffffff' },
  { id: 'brand', label: '厂牌', type: 'field', text: '厂牌名', x: 20, y: 100, width: 180, height: 40, fontSize: 14, fontFamily: 'sans-serif', fontWeight: 'normal', textAlign: 'left', color: '#e94560' },
  { id: 'name', label: '款名', type: 'field', text: '啤酒名称', x: 20, y: 150, width: 250, height: 50, fontSize: 20, fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'left', color: '#ffffff' },
  { id: 'style', label: '风格', type: 'field', text: '啤酒风格', x: 20, y: 210, width: 200, height: 30, fontSize: 14, fontFamily: 'sans-serif', fontWeight: 'normal', textAlign: 'left', color: '#ffffff' },
  { id: 'styleEn', label: '风格（英文）', type: 'field', text: 'Style Name', x: 20, y: 250, width: 200, height: 25, fontSize: 12, fontFamily: 'sans-serif', fontWeight: 'normal', textAlign: 'left', color: '#999999' },
  { id: 'origin', label: '产地', type: 'field', text: '产地', x: 20, y: 290, width: 100, height: 30, fontSize: 13, fontFamily: 'sans-serif', fontWeight: 'normal', textAlign: 'left', color: '#ffffff' },
  { id: 'abv', label: '酒精度', type: 'field', text: '5.0%', x: 130, y: 290, width: 100, height: 30, fontSize: 13, fontFamily: 'sans-serif', fontWeight: 'normal', textAlign: 'left', color: '#ffffff' },
  { id: 'price', label: '定价', type: 'field', text: '¥38', x: 280, y: 100, width: 100, height: 50, fontSize: 24, fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'right', color: '#e94560' },
  { id: 'image', label: '宣传图片', type: 'image', text: '', x: 280, y: 160, width: 100, height: 120, fontSize: 12, fontFamily: 'sans-serif', fontWeight: 'normal', textAlign: 'center', color: '#ffffff' },
]

export default function TemplateEditor({ template, onTemplateChange, onSave }) {
  const [canvasSize, setCanvasSize] = useState(template.canvasSize || { width: 400, height: 500 })
  const [selectedItem, setSelectedItem] = useState(null)
  const [layoutItems, setLayoutItems] = useState(defaultLayoutItems)
  const [history, setHistory] = useState([defaultLayoutItems])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [dragState, setDragState] = useState(null)
  const [canvasResizeState, setCanvasResizeState] = useState(null)

  const saveToHistory = useCallback((newItems) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newItems])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setLayoutItems([...history[historyIndex - 1]])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setLayoutItems([...history[historyIndex + 1]])
    }
  }

  const handleMouseDown = useCallback((e, item, type) => {
    e.stopPropagation()
    setSelectedItem(item)
    setDragState({
      id: item.id,
      type: type,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      origW: item.width,
      origH: item.height,
    })
  }, [])

  const handleCanvasResizeStart = useCallback((e, mode) => {
    e.stopPropagation()
    setCanvasResizeState({
      startX: e.clientX,
      startY: e.clientY,
      origW: canvasSize.width,
      origH: canvasSize.height,
      mode, // 'corner' | 'width' | 'height'
    })
  }, [canvasSize])

  const handleMouseMove = useCallback((e) => {
    if (dragState) {
      const dx = e.clientX - dragState.startX
      const dy = e.clientY - dragState.startY

      setLayoutItems(prev => prev.map(item => {
        if (item.id !== dragState.id) return item

        if (dragState.type === 'move') {
          return {
            ...item,
            x: Math.max(0, Math.round(dragState.origX + dx)),
            y: Math.max(0, Math.round(dragState.origY + dy)),
          }
        } else if (dragState.type === 'resize') {
          return {
            ...item,
            width: Math.max(30, Math.round(dragState.origW + dx)),
            height: Math.max(20, Math.round(dragState.origH + dy)),
          }
        }
        return item
      }))
    }

    if (canvasResizeState) {
      const dx = e.clientX - canvasResizeState.startX
      const dy = e.clientY - canvasResizeState.startY
      const newSize = { ...canvasSize }

      if (canvasResizeState.mode === 'corner' || canvasResizeState.mode === 'width') {
        newSize.width = Math.max(200, Math.round(canvasResizeState.origW + dx))
      }
      if (canvasResizeState.mode === 'corner' || canvasResizeState.mode === 'height') {
        newSize.height = Math.max(200, Math.round(canvasResizeState.origH + dy))
      }

      setCanvasSize(newSize)
    }
  }, [dragState, canvasResizeState])

  const handleMouseUp = useCallback(() => {
    if (dragState) {
      saveToHistory(layoutItems)
      setDragState(null)
    }
    if (canvasResizeState) {
      onTemplateChange({ ...template, canvasSize: { ...canvasSize } })
      setCanvasResizeState(null)
    }
  }, [dragState, canvasResizeState, layoutItems, saveToHistory, canvasSize, template, onTemplateChange])

  const handleItemUpdate = (key, value) => {
    if (!selectedItem) return
    const newItems = layoutItems.map(item =>
      item.id === selectedItem.id ? { ...item, [key]: value } : item
    )
    setLayoutItems(newItems)
    setSelectedItem({ ...selectedItem, [key]: value })
    saveToHistory(newItems)
  }

  const handleCanvasClick = () => {
    setSelectedItem(null)
  }

  const handleCanvasSizeChange = (newSize) => {
    setCanvasSize(newSize)
    onTemplateChange({ ...template, canvasSize: newSize })
  }

  const handleSave = () => {
    const templateData = {
      ...template,
      canvasSize,
      layoutItems,
    }
    onSave(templateData)
    message.success('模板布局已保存')
  }

  const handleZoomIn = () => setZoom(z => Math.min(z + 10, 200))
  const handleZoomOut = () => setZoom(z => Math.max(z - 10, 50))

  const renderLayoutItem = (item) => {
    const isSelected = selectedItem?.id === item.id

    return (
      <div
        key={item.id}
        style={{
          position: 'absolute',
          left: item.x,
          top: item.y,
          width: item.width,
          height: item.height,
          border: isSelected ? '2px solid #1890ff' : '1px dashed rgba(255,255,255,0.4)',
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          justifyContent: item.textAlign === 'center' ? 'center' : item.textAlign === 'right' ? 'flex-end' : 'flex-start',
          padding: '4px 8px',
          boxSizing: 'border-box',
          backgroundColor: isSelected ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
          userSelect: 'none',
        }}
        onMouseDown={(e) => handleMouseDown(e, item, 'move')}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: item.fontSize,
            fontFamily: item.fontFamily || template.fontFamily,
            fontWeight: item.fontWeight,
            textAlign: item.textAlign,
            color: item.color || template.textColor,
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: item.type === 'image' ? 'normal' : 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {item.type === 'image' ? '📷 图片' : (item.text || `{${item.label}}`)}
        </div>
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              right: -4,
              bottom: -4,
              width: 10,
              height: 10,
              backgroundColor: '#1890ff',
              cursor: 'nwse-resize',
              borderRadius: 2,
            }}
            onMouseDown={(e) => handleMouseDown(e, item, 'resize')}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="template-editor"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 顶部工具栏 */}
      <div className="template-editor-toolbar">
        <Space>
          <Tooltip title="撤销">
            <Button icon={<UndoOutlined />} onClick={handleUndo} disabled={historyIndex === 0} size="small" />
          </Tooltip>
          <Tooltip title="重做">
            <Button icon={<RedoOutlined />} onClick={handleRedo} disabled={historyIndex === history.length - 1} size="small" />
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="放大">
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
          </Tooltip>
          <Tooltip title="缩小">
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
          </Tooltip>
          <Text style={{ marginLeft: 8, fontSize: 12 }}>{zoom}%</Text>
          <Divider type="vertical" />
          <Text style={{ fontSize: 12 }}>酒单尺寸:</Text>
          <InputNumber
            value={canvasSize.width}
            onChange={(v) => handleCanvasSizeChange({ ...canvasSize, width: v })}
            min={300}
            max={1200}
            size="small"
            style={{ width: 65 }}
          />
          <Text style={{ fontSize: 12 }}>x</Text>
          <InputNumber
            value={canvasSize.height}
            onChange={(v) => handleCanvasSizeChange({ ...canvasSize, height: v })}
            min={300}
            max={1200}
            size="small"
            style={{ width: 65 }}
          />
        </Space>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="small">
          保存模板
        </Button>
      </div>

      <div className="template-editor-body">
        {/* 左侧元素面板 */}
        <div className="template-editor-elements">
          <div className="panel-header">
            <FormOutlined /> 元素列表
          </div>
          <div className="element-list">
            {layoutItems.map(item => (
              <div
                key={item.id}
                className={`element-item ${selectedItem?.id === item.id ? 'active' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                {item.type === 'image' ? <PictureOutlined /> : <FormOutlined />}
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div className="panel-header">模板样式</div>
          <div className="style-panel">
            <div className="style-item">
              <Text style={{ fontSize: 12 }}>背景色</Text>
              <ColorPicker
                value={template.backgroundColor}
                onChange={(color) => onTemplateChange({ ...template, backgroundColor: color.toHexString() })}
                size="small"
              />
            </div>
            <div className="style-item">
              <Text style={{ fontSize: 12 }}>文字色</Text>
              <ColorPicker
                value={template.textColor}
                onChange={(color) => onTemplateChange({ ...template, textColor: color.toHexString() })}
                size="small"
              />
            </div>
            <div className="style-item">
              <Text style={{ fontSize: 12 }}>强调色</Text>
              <ColorPicker
                value={template.accentColor}
                onChange={(color) => onTemplateChange({ ...template, accentColor: color.toHexString() })}
                size="small"
              />
            </div>
          </div>
        </div>

        {/* 中间画布区域 */}
        <div className="template-editor-canvas-area">
          <div
            className="canvas-container"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center top',
            }}
          >
            <div
              className="template-editor-canvas"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                backgroundColor: template.backgroundColor,
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={handleCanvasClick}
            >
              {template.backgroundImage && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${template.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: template.backgroundOpacity ?? 0.15,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
              )}
              {layoutItems.map(item => renderLayoutItem(item))}
              {/* 右边拖拽手柄 - 单独调整宽度 */}
              <div
                style={{
                  position: 'absolute',
                  right: -5,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 10,
                  height: 48,
                  backgroundColor: '#1677ff',
                  cursor: 'ew-resize',
                  borderRadius: '5px 0 0 5px',
                  zIndex: 1000,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(22,119,255,0.4)',
                }}
                onMouseDown={(e) => handleCanvasResizeStart(e, 'width')}
                onClick={(e) => e.stopPropagation()}
              />
              {/* 下边拖拽手柄 - 单独调整高度 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 48,
                  height: 10,
                  backgroundColor: '#1677ff',
                  cursor: 'ns-resize',
                  borderRadius: '0 0 5px 5px',
                  zIndex: 1000,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(22,119,255,0.4)',
                }}
                onMouseDown={(e) => handleCanvasResizeStart(e, 'height')}
                onClick={(e) => e.stopPropagation()}
              />
              {/* 右下角拖拽手柄 - 同时调整宽高 */}
              <div
                style={{
                  position: 'absolute',
                  right: -7,
                  bottom: -7,
                  width: 18,
                  height: 18,
                  backgroundColor: '#52c41a',
                  cursor: 'nwse-resize',
                  borderRadius: 3,
                  zIndex: 1000,
                  border: '2px solid white',
                  boxShadow: '0 3px 8px rgba(82,196,26,0.5)',
                }}
                onMouseDown={(e) => handleCanvasResizeStart(e, 'corner')}
                onClick={(e) => e.stopPropagation()}
              />
              {/* 酒单尺寸显示 */}
              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  pointerEvents: 'none',
                  zIndex: 999,
                }}
              >
                酒单尺寸: {canvasSize.width} x {canvasSize.height}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="template-editor-properties">
          {selectedItem ? (
            <>
              <div className="panel-header">属性设置 - {selectedItem.label}</div>
              <div className="property-panel">
                {selectedItem.type !== 'image' && (
                  <div className="property-group">
                    <Text type="secondary" style={{ fontSize: 12 }}>文案内容</Text>
                    <div className="property-field">
                      <Input.TextArea
                        value={selectedItem.text || ''}
                        onChange={(e) => handleItemUpdate('text', e.target.value)}
                        placeholder="输入文案内容"
                        rows={2}
                        size="small"
                        style={{ fontSize: 12 }}
                      />
                    </div>
                  </div>
                )}
                <Divider style={{ margin: '10px 0' }} />
                <div className="property-group">
                  <Text type="secondary" style={{ fontSize: 12 }}>位置与尺寸</Text>
                  <div className="property-row">
                    <div className="property-field">
                      <Text style={{ fontSize: 12 }}>X</Text>
                      <InputNumber
                        value={selectedItem.x}
                        onChange={(v) => handleItemUpdate('x', v)}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="property-field">
                      <Text style={{ fontSize: 12 }}>Y</Text>
                      <InputNumber
                        value={selectedItem.y}
                        onChange={(v) => handleItemUpdate('y', v)}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div className="property-row">
                    <div className="property-field">
                      <Text style={{ fontSize: 12 }}>宽</Text>
                      <InputNumber
                        value={selectedItem.width}
                        onChange={(v) => handleItemUpdate('width', v)}
                        min={20}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="property-field">
                      <Text style={{ fontSize: 12 }}>高</Text>
                      <InputNumber
                        value={selectedItem.height}
                        onChange={(v) => handleItemUpdate('height', v)}
                        min={20}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="property-group">
                  <Text type="secondary" style={{ fontSize: 12 }}>文字样式</Text>
                  <div className="property-field">
                    <Text style={{ fontSize: 12 }}>字体</Text>
                    <Select
                      value={selectedItem.fontFamily || template.fontFamily}
                      onChange={(v) => handleItemUpdate('fontFamily', v)}
                      options={[
                        { label: '无衬线', value: 'sans-serif' },
                        { label: '衬线', value: 'serif' },
                        { label: '等宽', value: 'monospace' },
                        { label: '手写', value: 'cursive' },
                      ]}
                      size="small"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="property-field">
                    <Text style={{ fontSize: 12 }}>字号: {selectedItem.fontSize}px</Text>
                    <Slider
                      value={selectedItem.fontSize}
                      onChange={(v) => handleItemUpdate('fontSize', v)}
                      min={10}
                      max={72}
                    />
                  </div>
                  <div className="property-row">
                    <Tooltip title="粗体">
                      <Button
                        icon={<BoldOutlined />}
                        type={selectedItem.fontWeight === 'bold' ? 'primary' : 'default'}
                        onClick={() => handleItemUpdate('fontWeight', selectedItem.fontWeight === 'bold' ? 'normal' : 'bold')}
                        size="small"
                      />
                    </Tooltip>
                    <Button.Group size="small">
                      <Button
                        icon={<AlignLeftOutlined />}
                        type={selectedItem.textAlign === 'left' ? 'primary' : 'default'}
                        onClick={() => handleItemUpdate('textAlign', 'left')}
                      />
                      <Button
                        icon={<AlignCenterOutlined />}
                        type={selectedItem.textAlign === 'center' ? 'primary' : 'default'}
                        onClick={() => handleItemUpdate('textAlign', 'center')}
                      />
                      <Button
                        icon={<AlignRightOutlined />}
                        type={selectedItem.textAlign === 'right' ? 'primary' : 'default'}
                        onClick={() => handleItemUpdate('textAlign', 'right')}
                      />
                    </Button.Group>
                  </div>
                  <div className="property-field">
                    <Text style={{ fontSize: 12 }}>颜色</Text>
                    <ColorPicker
                      value={selectedItem.color || template.textColor}
                      onChange={(color) => handleItemUpdate('color', color.toHexString())}
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                  点击元素进行编辑
                </Text>
                <Divider style={{ margin: '12px 0' }} />
                <div className="panel-header" style={{ textAlign: 'left' }}>酒单尺寸</div>
                <div className="property-panel" style={{ textAlign: 'left' }}>
                  <div className="property-row">
                    <div className="property-field">
                      <Text style={{ fontSize: 12 }}>宽</Text>
                      <InputNumber
                        value={canvasSize.width}
                        onChange={(v) => handleCanvasSizeChange({ ...canvasSize, width: v })}
                        min={200}
                        max={1200}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="property-field">
                      <Text style={{ fontSize: 12 }}>高</Text>
                      <InputNumber
                        value={canvasSize.height}
                        onChange={(v) => handleCanvasSizeChange({ ...canvasSize, height: v })}
                        min={200}
                        max={1200}
                        size="small"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    右边蓝色手柄拖拽调宽度，下边手柄调高度，右下角绿色手柄同时调整宽高
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
