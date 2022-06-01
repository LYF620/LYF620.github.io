---
title: Antd-Form 渲染问题
date: 2022-05-18 23:00
top: true
cover: true
toc: true
mathjax: true
summary: 'Antd-Form'
tags:
  - react
  - react源码
categories: Antd Design
img: '/medias/featureimages/23.jpg'
sitemap: true
---

# Form.item onChange 事件导致重新渲染问题

case 1:当渲染了多个 Form.Item 时，现象如下：![slow](/antd/slow.gif)

case 2:当渲染了单个 Form.Item 时，现象如下：![quick](/antd/quick.gif)

结合 performance 查看，当更新某一个 Form.item 时，触发了整个 Form 的更新重绘，下图是一个 Item 的更新栈：
![截屏2021-12-03_16.09.11](/antd/截屏2021-12-03_16.09.11.png)

根据 antd 文档的说法，form.Item 存在属性 shouldUpdate，可以控制组件是否更新

```js
<Form.Item
  shouldUpdate={(prevValues, curValues) =>
    prevValues.additional !== curValues.additional
  }
>
  {() => {
    return (
      <Form.Item name="other">
        <Input />
      </Form.Item>
    )
  }}
</Form.Item>
```

当 shouldUpdate 为 true 时，Form 的任意变化都会使该 Form.Item 重新渲染。反之，设置为 false 时，即不会触发更新
现象如下：![shouldUpdate-true](/antd/shouldUpdate-true.gif)

图中可以看到，这次更新只耗费了 14ms，并只存在一次更新，更新了当前点击的 switch 组件

引用 Antd 原文：

## shouldUpdate

Form 通过增量更新方式，只更新被修改的字段相关组件以达到性能优化目的。大部分场景下，你只需要编写代码或者与 dependencies 属性配合校验即可。而在某些特定场景，例如修改某个字段值后出现新的字段选项、或者纯粹希望表单任意变化都对某一个区域进行渲染。你可以通过 shouldUpdate 修改 Form.Item 的更新逻辑。

当 shouldUpdate 为 true 时，Form 的任意变化都会使该 Form.Item 重新渲染。这对于自定义渲染一些区域十分有帮助：

```js
<Form.Item shouldUpdate>
  {() => {
    return <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
  }}
</Form.Item>
```

当 shouldUpdate 为方法时，表单的每次数值更新都会调用该方法，提供原先的值与当前的值以供你比较是否需要更新。这对于是否根据值来渲染额外字段十分有帮助：

```js
<Form.Item
  shouldUpdate={(prevValues, curValues) =>
    prevValues.additional !== curValues.additional
  }
>
  {() => {
    return (
      <Form.Item name="other">
        <Input />
      </Form.Item>
    )
  }}
</Form.Item>
```

开发时，合理运用 shouldUpdate 即可避免无效更新，优化用户体验

附上 demo：

```js
import React from 'react'
import { Form, Input, Button, Space, Select, Checkbox, Switch } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { areas, sights, StyledLayout } from './StyleLayout'

const { Option } = Select

const AntForm = function AntForm() {
  const [form] = Form.useForm()
  const onFinish = (values) => {
    console.log('Received values of form:', values)
  }

  const handleChange = () => {
    form.setFieldsValue({ sights: [] })
  }

  return (
    <>
      <StyledLayout>
        <div className="content">
          <h1>Welcome to React{new Date().toLocaleDateString()}</h1>
          <Form
            form={form}
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="area"
              shouldUpdate={false}
              label="Area"
              rules={[{ required: true, message: 'Missing area' }]}
            >
              <Select options={areas} onChange={handleChange} />
            </Form.Item>
            <Form.List name="sights">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item
                        noStyle
                        shouldUpdate={
                          false
                          //   prevValues.area !== curValues.area ||
                          //   prevValues.sights !== curValues.sights
                        }
                      >
                        {() => (
                          <Form.Item
                            {...field}
                            shouldUpdate={false}
                            label="Sight"
                            name={[field.name, 'sight']}
                            fieldKey={[field.fieldKey, 'sight']}
                          >
                            <Select
                              //   disabled={!form.getFieldValue('area')}
                              style={{ width: 130 }}
                            >
                              {[
                                'Tiananmen',
                                'Great Wall',
                                'Oriental Pearl',
                                'The Bund',
                              ].map((item) => (
                                <Option key={item} value={item}>
                                  {item}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        )}
                      </Form.Item>
                      <Form.Item
                        shouldUpdate={false}
                        {...field}
                        label="Price"
                        name={[field.name, 'price']}
                        fieldKey={[field.fieldKey, 'price']}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        shouldUpdate={false}
                        label="Checkbox"
                        name={[field.name, 'Checkbox']}
                        fieldKey={[field.fieldKey, 'Checkbox']}
                      >
                        <Checkbox />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        shouldUpdate={false}
                        label="Checkbox1"
                        name={[field.name, 'Checkbox1']}
                        fieldKey={[field.fieldKey, 'Checkbox1']}
                      >
                        <Checkbox />
                      </Form.Item>

                      <Form.Item
                        shouldUpdate={false}
                        {...field}
                        label="Checkbox2"
                        name={[field.name, 'Checkbox2']}
                        fieldKey={[field.fieldKey, 'Checkbox2']}
                      >
                        <Checkbox />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        shouldUpdate={false}
                        label="Switch"
                        name={[field.name, 'Switch']}
                        fieldKey={[field.fieldKey, 'Switch']}
                      >
                        <Switch />
                      </Form.Item>

                      <Form.Item
                        shouldUpdate={false}
                        {...field}
                        label="Switch1"
                        name={[field.name, 'Switch1']}
                        fieldKey={[field.fieldKey, 'Switch1']}
                      >
                        <Switch />
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                        add()
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add sights
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </StyledLayout>
    </>
  )
}

export default AntForm
```
