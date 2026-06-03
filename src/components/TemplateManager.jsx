import { useState } from 'react'
import { Button, Card, ColorPicker, Input, List, Modal, Select, Space, Typography, message } from 'antd'
import { SaveOutlined, FolderOpenOutlined, EditOutlined } from '@ant-design/icons'
import TemplateEditor from './TemplateEditor'

const { Text } = Typography

export default function TemplateManager({
  templates,
  currentTemplate,
  onSave,
  onLoad,
  onTemplateChange,
}) {
  const [saveVisible, setSaveVisible] = useState(false)
  const [editorVisible, setEditorVisible] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const handleSave = () => {
    if (!templateName.trim()) {
      message.warning('请输入模板名称')
      return
    }
    onSave(templateName)
    setTemplateName('')
    setSaveVisible(false)
  }

  const handleColorChange = (key, color) => {
    onTemplateChange({
      ...currentTemplate,
      [key]: color.toHexString(),
    })
  }

  const handleEditorSave = (templateData) => {
    onTemplateChange(templateData)
    setEditorVisible(false)
  }

  return (
    <div className="template-manager">
      <div className="template-section">
        <h3>当前模板设置</h3>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div className="template-setting">
              <Text>模板名称:</Text>
              <Input
                value={currentTemplate.name}
                onChange={(e) => onTemplateChange({ ...currentTemplate, name: e.target.value })}
                style={{ width: 200 }}
              />
            </div>
            <div className="template-setting">
              <Text>背景颜色:</Text>
              <ColorPicker
                value={currentTemplate.backgroundColor}
                onChange={(color) => handleColorChange('backgroundColor', color)}
              />
            </div>
            <div className="template-setting">
              <Text>文字颜色:</Text>
              <ColorPicker
                value={currentTemplate.textColor}
                onChange={(color) => handleColorChange('textColor', color)}
              />
            </div>
            <div className="template-setting">
              <Text>强调颜色:</Text>
              <ColorPicker
                value={currentTemplate.accentColor}
                onChange={(color) => handleColorChange('accentColor', color)}
              />
            </div>
            <div className="template-setting">
              <Text>字体:</Text>
              <Select
                value={currentTemplate.fontFamily}
                onChange={(value) => onTemplateChange({ ...currentTemplate, fontFamily: value })}
                options={[
                  { label: '无衬线', value: 'sans-serif' },
                  { label: '衬线', value: 'serif' },
                  { label: '等宽', value: 'monospace' },
                  { label: '手写', value: 'cursive' },
                ]}
                style={{ width: 200 }}
              />
            </div>
            <div className="template-setting">
              <Text>布局:</Text>
              <Select
                value={currentTemplate.layout}
                onChange={(value) => onTemplateChange({ ...currentTemplate, layout: value })}
                options={[
                  { label: '卡片式', value: 'card' },
                  { label: '列表式', value: 'list' },
                ]}
                style={{ width: 200 }}
              />
            </div>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditorVisible(true)}
              >
                编辑布局
              </Button>
              <Button
                icon={<SaveOutlined />}
                onClick={() => setSaveVisible(true)}
              >
                保存为新模板
              </Button>
            </Space>
          </Space>
        </Card>
      </div>

      <div className="template-section">
        <h3>已保存的模板</h3>
        <List
          dataSource={templates}
          renderItem={(tmpl, index) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<FolderOpenOutlined />}
                  onClick={() => onLoad(tmpl)}
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
                      width: 20,
                      height: 20,
                      backgroundColor: tmpl.backgroundColor,
                      border: '1px solid #d9d9d9',
                    }} />
                    <span style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      backgroundColor: tmpl.accentColor,
                      border: '1px solid #d9d9d9',
                    }} />
                    <Text type="secondary">{tmpl.fontFamily}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* 保存模板弹窗 */}
      <Modal
        title="保存模板"
        open={saveVisible}
        onOk={handleSave}
        onCancel={() => setSaveVisible(false)}
      >
        <Input
          placeholder="请输入模板名称"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </Modal>

      {/* 模板编辑器弹窗 */}
      <Modal
        open={editorVisible}
        onCancel={() => setEditorVisible(false)}
        footer={null}
        width="95%"
        style={{ top: 10 }}
        styles={{
          body: { padding: 0, height: '75vh', overflow: 'hidden' }
        }}
        destroyOnClose
      >
        <TemplateEditor
          template={currentTemplate}
          onTemplateChange={onTemplateChange}
          onSave={handleEditorSave}
        />
      </Modal>
    </div>
  )
}
