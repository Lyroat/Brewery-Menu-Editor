import { useRef } from 'react'
import { Button, Card, Empty, Popconfirm, Space, Typography, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, FileImageOutlined, PrinterOutlined, FilePdfOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

const { Text, Title } = Typography

export default function MenuPreview({
  menus,
  onEditMenu,
  onCreateMenu,
  onDeleteMenu,
}) {
  const menuRefs = useRef({})

  const renderMenuContent = (menu) => {
    const { template, items, fields } = menu

    return (
      <div
        ref={el => menuRefs.current[menu.id] = el}
        className="menu-export-preview"
        style={{
          backgroundColor: template.backgroundColor,
          fontFamily: template.fontFamily,
          padding: '40px',
          width: '400px',
          minHeight: '500px',
          position: 'relative',
          overflow: 'hidden',
        }}
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
        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: template.accentColor, fontSize: '36px', margin: '0 0 16px 0' }}>
            {menu.name}
          </h1>
          <div style={{ width: '100px', borderTop: `3px solid ${template.accentColor}`, margin: '0 auto' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                gap: '16px',
              }}
            >
              {item.image && (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                {item.brand && <div style={{ color: template.accentColor, fontSize: '14px', fontWeight: 600 }}>{item.brand}</div>}
                {item.name && <div style={{ color: template.textColor, fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>{item.name}</div>}
                {item.style && <div style={{ color: template.textColor, fontSize: '14px', opacity: 0.9 }}>{item.style}</div>}
                {item.styleEn && <div style={{ color: template.textColor, fontSize: '12px', opacity: 0.7 }}>{item.styleEn}</div>}
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', opacity: 0.8, color: template.textColor }}>
                  {item.origin && <span>{item.origin}</span>}
                  {item.abv && <span>{item.abv}% ABV</span>}
                </div>
                {item.price && <div style={{ color: template.accentColor, fontSize: '24px', fontWeight: 700, marginTop: '8px' }}>¥{item.price}</div>}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', color: template.textColor, opacity: 0.5, padding: '40px 0' }}>
              暂无酒品
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleExportSingle = async (menuId) => {
    const el = menuRefs.current[menuId]
    if (!el) return

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
      })
      canvas.toBlob((blob) => {
        const menu = menus.find(m => m.id === menuId)
        saveAs(blob, `${menu.name}.png`)
        message.success(`"${menu.name}" 已导出`)
      })
    } catch (err) {
      message.error('导出失败: ' + err.message)
    }
  }

  const handlePrintSingle = async (menuId) => {
    const el = menuRefs.current[menuId]
    if (!el) return

    const menu = menus.find(m => m.id === menuId)
    const printWindow = window.open('', '_blank', `width=${el.offsetWidth + 80},height=${el.offsetHeight + 80}`)
    if (!printWindow) {
      message.error('请允许弹出窗口以使用打印功能')
      return
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML || `<link rel="stylesheet" href="${s.href}">`)
      .join('\n')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"><title>${menu.name}</title>${styles}</head>
        <body style="margin:0;display:flex;justify-content:center;align-items:flex-start;padding:20px;">
          ${el.outerHTML}
          <script>window.onload=()=>{window.print();window.close()}<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleExportPdf = async (menuId) => {
    const el = menuRefs.current[menuId]
    if (!el) return

    try {
      message.loading('正在生成 PDF...', 0)
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      const imgData = canvas.toDataURL('image/png')

      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      const menu = menus.find(m => m.id === menuId)
      pdf.save(`${menu.name}.pdf`)
      message.destroy()
      message.success(`"${menu.name}" PDF 已导出`)
    } catch (err) {
      message.destroy()
      message.error('PDF 导出失败，请确保已安装 jspdf 依赖')
    }
  }

  const handleExportAll = async () => {
    message.loading('正在导出所有酒单...', 0)

    try {
      for (const menu of menus) {
        const el = menuRefs.current[menu.id]
        if (!el) continue

        const canvas = await html2canvas(el, {
          backgroundColor: null,
          scale: 2,
        })

        await new Promise((resolve) => {
          canvas.toBlob((blob) => {
            saveAs(blob, `${menu.name}.png`)
            resolve()
          })
        })

        await new Promise(resolve => setTimeout(resolve, 500))
      }

      message.destroy()
      message.success(`成功导出 ${menus.length} 个酒单`)
    } catch (err) {
      message.destroy()
      message.error('导出失败: ' + err.message)
    }
  }

  const renderMenuThumbnail = (menu) => {
    const { template, items } = menu

    return (
      <div
        className="menu-thumbnail"
        style={{
          backgroundColor: template.backgroundColor,
          fontFamily: template.fontFamily,
          position: 'relative',
          overflow: 'hidden',
        }}
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
        <div className="thumbnail-header" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: template.accentColor, fontSize: 14, fontWeight: 'bold' }}>
            {menu.name}
          </div>
        </div>
        <div className="thumbnail-content" style={{ position: 'relative', zIndex: 1 }}>
          {items.length > 0 ? (
            items.slice(0, 3).map((item, index) => (
              <div key={index} className="thumbnail-item">
                {item.image && (
                  <div className="thumbnail-item-image">
                    <img src={item.image} alt="" />
                  </div>
                )}
                <div className="thumbnail-item-info">
                  {item.brand && (
                    <div style={{ color: template.accentColor, fontSize: 8 }}>
                      {item.brand}
                    </div>
                  )}
                  {item.name && (
                    <div style={{ color: template.textColor, fontSize: 10, fontWeight: 'bold' }}>
                      {item.name}
                    </div>
                  )}
                  {item.price && (
                    <div style={{ color: template.accentColor, fontSize: 10 }}>
                      ¥{item.price}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="thumbnail-empty" style={{ color: template.textColor }}>
              暂无酒品
            </div>
          )}
          {items.length > 3 && (
            <div className="thumbnail-more" style={{ color: template.textColor }}>
              +{items.length - 3} 更多...
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="menu-preview-list">
      <div className="preview-header">
        <Title level={4} style={{ margin: 0 }}>我的酒单 ({menus.length})</Title>
        <Space>
          <Button
            icon={<FileImageOutlined />}
            onClick={handleExportAll}
          >
            导出全部 PNG
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateMenu}
          >
            新建酒单
          </Button>
        </Space>
      </div>

      {menus.length > 0 ? (
        <div className="menu-grid-list">
          {menus.map(menu => (
            <Card
              key={menu.id}
              className="menu-card-item"
              hoverable
              onClick={() => onEditMenu(menu.id)}
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditMenu(menu.id)
                  }}
                >
                  编辑
                </Button>,
                <Button
                  type="link"
                  icon={<PrinterOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrintSingle(menu.id)
                  }}
                >
                  打印
                </Button>,
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportSingle(menu.id)
                  }}
                >
                  PNG
                </Button>,
                <Button
                  type="link"
                  icon={<FilePdfOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportPdf(menu.id)
                  }}
                >
                  PDF
                </Button>,
                <Popconfirm
                  title="确定删除此酒单？"
                  onConfirm={(e) => {
                    e.stopPropagation()
                    onDeleteMenu(menu.id)
                  }}
                  onCancel={(e) => e.stopPropagation()}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <div className="menu-card-content">
                {renderMenuThumbnail(menu)}
                <div className="menu-card-info">
                  <Text strong>{menu.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {menu.items.length} 款酒品
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          description="暂无酒单"
          style={{ marginTop: 80 }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateMenu}>
            创建第一个酒单
          </Button>
        </Empty>
      )}

      {/* 隐藏的导出用预览区域 */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {menus.map(menu => (
          <div key={menu.id}>
            {renderMenuContent(menu)}
          </div>
        ))}
      </div>
    </div>
  )
}
