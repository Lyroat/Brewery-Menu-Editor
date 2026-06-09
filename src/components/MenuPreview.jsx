import { useRef, useState } from 'react'
import { Button, Card, Dropdown, Empty, Modal, Popconfirm, Space, Typography, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, FileImageOutlined, EyeOutlined, FilePdfOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

const { Text, Title } = Typography

function isColorDark(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export default function MenuPreview({
  menus,
  onEditMenu,
  onCreateMenu,
  onDeleteMenu,
}) {
  const menuRefs = useRef({})
  const [previewMenuId, setPreviewMenuId] = useState(null)
  const [previewPage, setPreviewPage] = useState(0)

  const getMenuLayout = (menu) => {
    const { template, items } = menu
    const cols = template.cols || 1
    const canvasWidth = template.canvasSize?.width || 794
    const canvasHeight = template.canvasSize?.height || 1123
    const padding = cols >= 2 ? 28 : 40
    const headerHeight = cols >= 2 ? 60 : 85
    const footerHeight = 20
    const availableHeight = canvasHeight - padding * 2 - headerHeight - footerHeight

    const baseItemHeight = cols === 1 ? 170 : cols === 2 ? 120 : 100
    const itemsPerCol = Math.max(2, Math.floor(availableHeight / baseItemHeight))
    const itemsPerPage = itemsPerCol * cols

    const itemHeight = Math.floor((availableHeight) / itemsPerCol)
    const maxImg = cols === 1 ? 140 : cols === 2 ? 100 : 75
    const imgSize = Math.min(Math.floor(itemHeight * 0.82), maxImg)

    const scale = itemHeight / baseItemHeight
    const baseName = cols === 1 ? 24 : cols === 2 ? 16 : 13
    const basePrice = cols === 1 ? 22 : cols === 2 ? 16 : 13
    const baseBrand = cols === 1 ? 11 : cols === 2 ? 9 : 8
    const baseMeta = cols === 1 ? 12 : cols === 2 ? 10 : 8
    const baseStyle = cols === 1 ? 13 : cols === 2 ? 11 : 9
    const nameFontSize = Math.round(baseName * Math.min(scale, 1.2))
    const priceFontSize = Math.round(basePrice * Math.min(scale, 1.2))
    const brandFontSize = Math.round(baseBrand * Math.min(scale, 1.2))
    const metaFontSize = Math.round(baseMeta * Math.min(scale, 1.2))
    const styleFontSize = Math.round(baseStyle * Math.min(scale, 1.2))

    const pages = []
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage))
    }
    if (pages.length === 0) pages.push([])

    return { cols, canvasWidth, canvasHeight, padding, headerHeight, itemHeight, imgSize, nameFontSize, priceFontSize, brandFontSize, metaFontSize, styleFontSize, pages, itemsPerPage }
  }

  const renderMenuContent = (menu, pageIndex = null) => {
    const { template, items } = menu
    const layout = getMenuLayout(menu)
    const { cols, canvasWidth, canvasHeight, padding, imgSize, nameFontSize, priceFontSize, brandFontSize, metaFontSize, styleFontSize, pages, itemHeight, itemsPerPage } = layout

    const isDark = isColorDark(template.backgroundColor)
    const subtleText = isDark
      ? 'rgba(255,255,255,0.45)'
      : 'rgba(0,0,0,0.4)'
    const dividerColor = isDark
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.06)'

    const itemGap = cols >= 2 ? 10 : 0
    const itemWidthStyle = cols === 1 ? '100%' : `calc(${100 / cols}% - ${itemGap * (cols - 1) / cols}px)`

    const borderColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'

    const renderItem = (item, globalIndex) => (
      <div key={globalIndex} style={{
        width: itemWidthStyle,
        height: `${itemHeight}px`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: cols >= 2 ? '4px' : '4px 0',
      }}>
        <div style={{
          display: 'flex',
          gap: `${Math.round(imgSize * 0.12)}px`,
          height: '100%',
          alignItems: 'center',
          position: 'relative',
          padding: `${Math.round(itemHeight * 0.06)}px ${Math.round(imgSize * 0.1)}px`,
          border: `1px solid ${borderColor}`,
          borderRadius: '4px',
          boxSizing: 'border-box',
        }}>
          {/* Number badge */}
          <div style={{
            position: 'absolute',
            top: Math.round(itemHeight * 0.06),
            right: `${priceFontSize * 2}px`,
            color: item._imageColor || template.accentColor,
            fontSize: `${priceFontSize}px`,
            fontWeight: 800,
            fontFamily: "'Playfair Display', serif",
            opacity: 0.6,
          }}>
            {String(globalIndex + 1).padStart(2, '0')}
          </div>

          {/* Left: Image or Placeholder */}
          <div style={{
            width: `${imgSize}px`,
            height: `${imgSize}px`,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {item.image ? (() => {
              const cw = item._cropW || 100
              const ch = item._cropH || 100
              return (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img src={item.image} alt="" style={{
                    position: 'absolute',
                    width: `${(100 / cw) * 100}%`,
                    height: `${(100 / ch) * 100}%`,
                    left: `${-((item._cropX || 0) / cw) * 100}%`,
                    top: `${-((item._cropY || 0) / ch) * 100}%`,
                    maxWidth: 'none',
                  }} />
                </div>
              )
            })() : (
              <div style={{
                width: '100%',
                height: '100%',
                background: isDark
                  ? `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`
                  : `linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.02) 100%)`,
                border: `1px solid ${dividerColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width={imgSize * 0.35} height={imgSize * 0.35} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
                  <path d="M7 2v2h1v9a4 4 0 0 0 3 3.87V19H9v2h6v-2h-2v-2.13A4 4 0 0 0 16 13V4h1V2H7zm2 2h6v4H9V4zm0 5h6v4a3 3 0 0 1-6 0V9z" fill={template.textColor} />
                </svg>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', paddingRight: priceFontSize + 6, overflow: 'hidden' }}>
            {(item.brand || item.origin || item.hops) && (
              <div style={{
                color: item._imageColorDark || template.accentColor,
                fontSize: `${brandFontSize}px`,
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
              }}>
                {item.brand && <span>{item.brand}</span>}
                {item.origin && (
                  <span style={{ color: item._imageColorSecondary || subtleText, fontSize: `${brandFontSize - 1}px`, fontWeight: 400 }}>
                    {item.origin}
                  </span>
                )}
                {item.hops && (
                  <span style={{ color: item._imageColorSecondary || subtleText, fontSize: `${brandFontSize - 1}px`, fontWeight: 400 }}>
                    {item.hops}
                  </span>
                )}
              </div>
            )}

            {item.name && (
              <div style={{
                color: item._imageColor || template.accentColor,
                fontSize: `${nameFontSize}px`,
                fontWeight: 800,
                lineHeight: 1.15,
                margin: '2px 0',
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
                {item.style && <div style={{ color: item._imageColorSecondary || template.textColor, fontSize: `${styleFontSize}px`, opacity: 0.9 }}>{item.style}</div>}
                {item.styleEn && <div style={{ color: item._imageColorSecondary || subtleText, fontSize: `${styleFontSize - 1}px`, fontStyle: 'italic', opacity: 0.65, marginTop: '1px' }}>{item.styleEn}</div>}
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginTop: '2px',
            }}>
              <div style={{ display: 'flex', gap: '10px', fontSize: `${metaFontSize}px`, color: item._imageColorDark || subtleText, letterSpacing: '0.5px' }}>
                {item.abv && <span>{item.abv}%</span>}
                {item.ml && <span>{item.ml}mL</span>}
                {item.cupType && <span>{item.cupType}</span>}
              </div>
              {item.price && (
                <div style={{
                  color: item._imageColor || template.accentColor,
                  fontSize: `${priceFontSize}px`,
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  fontFamily: "'Playfair Display', serif",
                }}>
                  <span style={{ fontSize: `${Math.round(priceFontSize * 0.54)}px`, fontWeight: 600 }}>¥</span>
                  {item.price}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )

    const renderPage = (pageItems, pIdx) => (
      <div
        key={pIdx}
        ref={pIdx === 0 ? (el => menuRefs.current[menu.id] = el) : undefined}
        className="menu-export-preview"
        data-menu-id={menu.id}
        data-page={pIdx}
        style={{
          backgroundColor: template.backgroundColor,
          fontFamily: template.fontFamily,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          position: 'relative',
          overflow: 'hidden',
          padding: `${padding}px`,
          boxSizing: 'border-box',
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

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: cols >= 2 ? '12px' : '18px' }}>
          <div style={{ color: subtleText, fontSize: cols >= 3 ? '8px' : '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
            CRAFT BEER MENU{pages.length > 1 ? ` · ${pIdx + 1}/${pages.length}` : ''}
          </div>
          <h1 style={{
            color: template.textColor,
            fontSize: cols >= 3 ? '20px' : cols === 2 ? '24px' : '30px',
            fontWeight: 700,
            margin: '0 0 6px 0',
            lineHeight: 1.1,
            fontFamily: "'Playfair Display', 'Noto Serif SC', serif",
          }}>
            {menu.name}
          </h1>
          <div style={{ width: '36px', height: '2px', background: template.accentColor }} />
        </div>

        {/* Beer List */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: cols >= 2 ? 'flex' : 'block',
          flexWrap: cols >= 2 ? 'wrap' : undefined,
          columnGap: cols >= 2 ? `${itemGap}px` : undefined,
          rowGap: 0,
          alignContent: 'flex-start',
        }}>
          {pageItems.map((item, idx) => renderItem(item, pIdx * itemsPerPage + idx))}
        </div>

        {pageItems.length === 0 && (
          <div style={{ textAlign: 'center', color: subtleText, padding: '60px 0', position: 'relative', zIndex: 1, fontSize: '14px' }}>
            暂无酒品
          </div>
        )}
      </div>
    )

    if (pageIndex !== null) {
      const pi = Math.min(pageIndex, pages.length - 1)
      return renderPage(pages[pi], pi)
    }

    return (
      <div ref={el => menuRefs.current[menu.id] = el}>
        {pages.map((pageItems, pIdx) => renderPage(pageItems, pIdx))}
      </div>
    )
  }

  const handleExportSingle = async (menuId) => {
    const container = menuRefs.current[menuId]
    if (!container) return

    try {
      const pages = container.querySelectorAll('[data-page]')
      const targets = pages.length > 0 ? Array.from(pages) : [container]
      const menu = menus.find(m => m.id === menuId)

      for (let i = 0; i < targets.length; i++) {
        const canvas = await html2canvas(targets[i], { backgroundColor: null, scale: 2 })
        await new Promise(resolve => {
          canvas.toBlob((blob) => {
            const suffix = targets.length > 1 ? `_第${i + 1}页` : ''
            saveAs(blob, `${menu.name}${suffix}.png`)
            resolve()
          })
        })
      }
      message.success(`"${menu.name}" 已导出 (${targets.length} 页)`)
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
    const container = menuRefs.current[menuId]
    if (!container) return

    try {
      message.loading('正在生成 PDF...', 0)
      const pages = container.querySelectorAll('[data-page]')
      const targets = pages.length > 0 ? Array.from(pages) : [container]
      const menu = menus.find(m => m.id === menuId)

      const { jsPDF } = await import('jspdf')
      let pdf = null

      for (let i = 0; i < targets.length; i++) {
        const canvas = await html2canvas(targets[i], { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true })
        const imgData = canvas.toDataURL('image/png')
        const w = canvas.width / 2
        const h = canvas.height / 2

        if (i === 0) {
          pdf = new jsPDF({
            orientation: w > h ? 'landscape' : 'portrait',
            unit: 'px',
            format: [w, h],
          })
        } else {
          pdf.addPage([w, h], w > h ? 'landscape' : 'portrait')
        }
        pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      }

      pdf.save(`${menu.name}.pdf`)
      message.destroy()
      message.success(`"${menu.name}" PDF 已导出 (${targets.length} 页)`)
    } catch (err) {
      message.destroy()
      message.error('PDF 导出失败，请确保已安装 jspdf 依赖')
    }
  }

  const handleExportAllPdf = async () => {
    message.loading('正在导出所有酒单 PDF...', 0)
    try {
      for (const menu of menus) {
        await handleExportPdf(menu.id)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      message.destroy()
      message.success(`成功导出 ${menus.length} 个酒单 PDF`)
    } catch (err) {
      message.destroy()
      message.error('导出失败: ' + err.message)
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
    const isDark = isColorDark(template.backgroundColor)
    const subtleText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
    const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

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
        <div className="thumbnail-header" style={{ position: 'relative', zIndex: 1, borderBottom: 'none', paddingBottom: 0, marginBottom: '6px' }}>
          <div style={{ color: subtleText, fontSize: 5, letterSpacing: '1.5px', marginBottom: '2px', textAlign: 'left' }}>
            CRAFT BEER
          </div>
          <div style={{ color: template.textColor, fontSize: 10, fontWeight: 700, textAlign: 'left', fontFamily: 'serif' }}>
            {menu.name}
          </div>
          <div style={{ width: '14px', height: '2px', background: template.accentColor, marginTop: '3px' }} />
        </div>
        <div className="thumbnail-content" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0' }}>
          {items.length > 0 ? (
            items.slice(0, 3).map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '6px',
                padding: '5px 0',
                borderTop: index > 0 ? `1px solid ${divider}` : 'none',
                alignItems: 'center',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  flexShrink: 0,
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}>
                  {item.image ? (
                    <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
                        <path d="M7 2v2h1v9a4 4 0 0 0 3 3.87V19H9v2h6v-2h-2v-2.13A4 4 0 0 0 16 13V4h1V2H7z" fill={template.textColor} />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.brand && <div style={{ color: template.accentColor, fontSize: 5, fontWeight: 700, letterSpacing: '0.5px' }}>{item.brand}</div>}
                  {item.name && <div style={{ color: template.textColor, fontSize: 8, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>}
                </div>
                {item.price && <div style={{ color: template.accentColor, fontSize: 8, fontWeight: 800, flexShrink: 0 }}>¥{item.price}</div>}
              </div>
            ))
          ) : (
            <div className="thumbnail-empty" style={{ color: template.textColor }}>
              暂无酒品
            </div>
          )}
          {items.length > 3 && (
            <div style={{ color: subtleText, fontSize: 6, textAlign: 'center', paddingTop: '3px', borderTop: `1px solid ${divider}` }}>
              +{items.length - 3} more
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
          <Dropdown
            menu={{
              items: [
                { key: 'png', icon: <FileImageOutlined />, label: '导出全部 PNG' },
                { key: 'pdf', icon: <FilePdfOutlined />, label: '导出全部 PDF' },
              ],
              onClick: ({ key }) => {
                if (key === 'png') handleExportAll()
                else handleExportAllPdf()
              },
            }}
            trigger={['click']}
          >
            <Button icon={<DownloadOutlined />}>
              导出全部
            </Button>
          </Dropdown>
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
              onClick={() => { setPreviewPage(0); setPreviewMenuId(menu.id) }}
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={(e) => { e.stopPropagation(); setPreviewPage(0); setPreviewMenuId(menu.id) }}
                >
                  预览
                </Button>,
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={(e) => { e.stopPropagation(); onEditMenu(menu.id) }}
                >
                  编辑
                </Button>,
                <Dropdown
                  menu={{
                    items: [
                      { key: 'png', icon: <FileImageOutlined />, label: '导出图片 (PNG)' },
                      { key: 'pdf', icon: <FilePdfOutlined />, label: '导出 PDF' },
                    ],
                    onClick: ({ key, domEvent }) => {
                      domEvent.stopPropagation()
                      if (key === 'png') handleExportSingle(menu.id)
                      else handleExportPdf(menu.id)
                    },
                  }}
                  trigger={['click']}
                >
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  >
                    导出
                  </Button>
                </Dropdown>,
                <Popconfirm
                  title="确定删除此酒单？"
                  onConfirm={(e) => { e.stopPropagation(); onDeleteMenu(menu.id) }}
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

      {/* 预览弹窗 */}
      <Modal
        open={!!previewMenuId}
        onCancel={() => { setPreviewMenuId(null); setPreviewPage(0) }}
        footer={null}
        width={(() => {
          if (!previewMenuId) return 'auto'
          const menu = menus.find(m => m.id === previewMenuId)
          const w = menu?.template?.canvasSize?.width || 794
          return Math.min(w + 48, window.innerWidth * 0.92)
        })()}
        style={{ top: 20 }}
        styles={{ body: { padding: '16px', maxHeight: '85vh', overflow: 'auto' } }}
        destroyOnClose
      >
        {previewMenuId && (() => {
          const menu = menus.find(m => m.id === previewMenuId)
          if (!menu) return null
          const layout = getMenuLayout(menu)
          const totalPages = layout.pages.length
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ overflow: 'auto', maxWidth: '100%' }}>
                {renderMenuContent(menu, previewPage)}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, paddingBottom: 8, userSelect: 'none', position: 'sticky', bottom: 0, background: '#fff', width: '100%', justifyContent: 'center', zIndex: 10 }}>
                  <Button
                    icon={<LeftOutlined />}
                    disabled={previewPage <= 0}
                    onClick={() => setPreviewPage(p => p - 1)}
                  />
                  <span style={{ fontSize: 14, minWidth: 60, textAlign: 'center' }}>
                    {previewPage + 1} / {totalPages}
                  </span>
                  <Button
                    icon={<RightOutlined />}
                    disabled={previewPage >= totalPages - 1}
                    onClick={() => setPreviewPage(p => p + 1)}
                  />
                </div>
              )}
            </div>
          )
        })()}
      </Modal>

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
