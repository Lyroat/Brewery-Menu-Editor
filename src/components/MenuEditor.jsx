import { useState } from 'react'
import { Table, Button, Input, InputNumber, Select, Space, Modal, Form, Popconfirm, Upload, Card, List, Tag, message } from 'antd'
import { PlusOutlined, DeleteOutlined, UploadOutlined, BgColorsOutlined, PlayCircleOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

export default function MenuEditor({
  menuItems,
  fields,
  templates,
  currentTemplate,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddField,
  onDeleteField,
  onTemplateChange,
  onGenerate,
  onImportItems,
  menuName,
  onMenuNameChange,
}) {
  const [addFieldVisible, setAddFieldVisible] = useState(false)
  const [templateVisible, setTemplateVisible] = useState(false)
  const [form] = Form.useForm()

  const handleAddField = () => {
    form.validateFields().then(values => {
      onAddField({
        key: values.key,
        label: values.label,
        type: values.type,
        options: values.type === 'select' ? values.options?.split(',').map(s => s.trim()) : undefined,
      })
      form.resetFields()
      setAddFieldVisible(false)
    })
  }

  const handleImageUpload = (index, file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      onUpdateItem(index, 'image', e.target.result)
    }
    reader.readAsDataURL(file)
    return false
  }

  const handleSelectTemplate = (tmpl) => {
    onTemplateChange(tmpl)
    setTemplateVisible(false)
    message.success(`已选择模板: ${tmpl.name}`)
  }

  const handleDownloadTemplate = () => {
    const headers = fields
      .filter(field => field.type !== 'image')
      .map(field => field.label)

    const exampleRow = {}
    fields.forEach(field => {
      if (field.type !== 'image') {
        if (field.type === 'number') {
          exampleRow[field.label] = 0
        } else if (field.type === 'select' && field.options?.length > 0) {
          exampleRow[field.label] = field.options[0]
        } else {
          exampleRow[field.label] = ''
        }
      }
    })

    const ws = XLSX.utils.json_to_sheet([exampleRow], { header: headers })

    const colWidths = headers.map(h => ({ wch: Math.max(h.length * 2, 12) }))
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '酒单模板')
    XLSX.writeFile(wb, '酒单导入模板.xlsx')
    message.success('模板下载成功')
  }

  const handleExportExcel = () => {
    if (menuItems.length === 0) {
      message.warning('没有数据可导出')
      return
    }

    const exportData = menuItems.map(item => {
      const row = {}
      fields.forEach(field => {
        if (field.type !== 'image') {
          row[field.label] = item[field.key] || ''
        }
      })
      return row
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '酒单数据')
    XLSX.writeFile(wb, '酒单数据.xlsx')
    message.success('导出成功')
  }

  const handleImportExcel = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        if (jsonData.length === 0) {
          message.warning('Excel 文件为空')
          return
        }

        const fieldMap = {}
        fields.forEach(field => {
          fieldMap[field.label] = field.key
        })

        const importedItems = jsonData.map(row => {
          const item = {}
          Object.keys(row).forEach(label => {
            const key = fieldMap[label]
            if (key) {
              item[key] = row[label]
            }
          })
          fields.forEach(field => {
            if (!(field.key in item)) {
              item[field.key] = field.type === 'number' ? 0 : ''
            }
          })
          return item
        })

        onImportItems(importedItems)
        message.success(`成功导入 ${importedItems.length} 条数据`)
      } catch (err) {
        message.error('导入失败: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  const handleGenerate = () => {
    if (menuItems.length === 0) {
      message.warning('请先添加酒品数据')
      return
    }
    onGenerate()
    message.success('酒单已生成，请查看预览')
  }

  const columns = fields.map(field => ({
    title: (
      <Space>
        {field.label}
        {field.key !== 'brand' && field.key !== 'name' && (
          <Popconfirm
            title="确定删除此字段？"
            onConfirm={() => onDeleteField(field.key)}
          >
            <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} />
          </Popconfirm>
        )}
      </Space>
    ),
    dataIndex: field.key,
    key: field.key,
    width: field.type === 'image' ? 150 : 120,
    render: (text, record, index) => {
      if (field.type === 'image') {
        return (
          <Upload
            beforeUpload={(file) => handleImageUpload(index, file)}
            showUploadList={false}
            accept="image/*"
          >
            {text ? (
              <img src={text} alt="" style={{ width: 80, height: 80, objectFit: 'cover' }} />
            ) : (
              <Button icon={<UploadOutlined />} size="small">上传</Button>
            )}
          </Upload>
        )
      }
      if (field.type === 'number') {
        return (
          <InputNumber
            value={text}
            onChange={(value) => onUpdateItem(index, field.key, value)}
            style={{ width: '100%' }}
          />
        )
      }
      if (field.type === 'select') {
        return (
          <Select
            value={text}
            onChange={(value) => onUpdateItem(index, field.key, value)}
            options={field.options?.map(o => ({ label: o, value: o }))}
            style={{ width: '100%' }}
          />
        )
      }
      return (
        <Input
          value={text}
          onChange={(e) => onUpdateItem(index, field.key, e.target.value)}
        />
      )
    },
  }))

  columns.push({
    title: '操作',
    key: 'action',
    width: 80,
    render: (_, record, index) => (
      <Popconfirm
        title="确定删除此酒品？"
        onConfirm={() => onDeleteItem(index)}
      >
        <Button type="link" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    ),
  })

  return (
    <div className="menu-editor">
      <div className="editor-toolbar">
        <Space>
          <Input
            value={menuName}
            onChange={(e) => onMenuNameChange(e.target.value)}
            style={{ width: 200, fontWeight: 'bold' }}
            placeholder="酒单名称"
          />
          <Button
            icon={<BgColorsOutlined />}
            onClick={() => setTemplateVisible(true)}
          >
            选择模板
          </Button>
          <Tag color="blue">模板: {currentTemplate.name}</Tag>
        </Space>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            下载模板
          </Button>
          <Upload
            beforeUpload={handleImportExcel}
            showUploadList={false}
            accept=".xlsx,.xls"
          >
            <Button icon={<FileExcelOutlined />}>
              导入 Excel
            </Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
            导出 Excel
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setAddFieldVisible(true)}>
            添加字段
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddItem}>
            添加酒品
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleGenerate}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            生成酒单
          </Button>
        </Space>
      </div>

      <Table
        dataSource={menuItems}
        columns={columns}
        rowKey={(_, index) => index}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="middle"
      />

      {/* 添加字段弹窗 */}
      <Modal
        title="添加新字段"
        open={addFieldVisible}
        onOk={handleAddField}
        onCancel={() => setAddFieldVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="字段标识"
            rules={[{ required: true, message: '请输入字段标识' }]}
          >
            <Input placeholder="例如: brewery" />
          </Form.Item>
          <Form.Item
            name="label"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="例如: 酿酒厂" />
          </Form.Item>
          <Form.Item
            name="type"
            label="字段类型"
            rules={[{ required: true, message: '请选择字段类型' }]}
          >
            <Select
              options={[
                { label: '文本', value: 'text' },
                { label: '数字', value: 'number' },
                { label: '下拉选择', value: 'select' },
                { label: '图片', value: 'image' },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'select' && (
                <Form.Item
                  name="options"
                  label="选项（逗号分隔）"
                  rules={[{ required: true, message: '请输入选项' }]}
                >
                  <Input placeholder="例如: 大杯,中杯,小杯" />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* 选择模板弹窗 */}
      <Modal
        title="选择模板"
        open={templateVisible}
        onCancel={() => setTemplateVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={templates}
          renderItem={(tmpl) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSelectTemplate(tmpl)}
                >
                  使用
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={tmpl.name}
                description={
                  <Space>
                    <span style={{
                      display: 'inline-block',
                      width: 24,
                      height: 24,
                      backgroundColor: tmpl.backgroundColor,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }} />
                    <span style={{
                      display: 'inline-block',
                      width: 24,
                      height: 24,
                      backgroundColor: tmpl.accentColor,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }} />
                    <Tag>{tmpl.layout === 'card' ? '卡片式' : '列表式'}</Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}
