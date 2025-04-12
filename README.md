# 个人财务管理系统

一个基于Vue 3的个人财务管理系统，帮助用户记录收入和支出、设置预算目标、生成财务报表以及分析财务状况。

## 功能特点

- **用户认证**
  - 用户注册和登录
  - 基于JWT的身份验证
  - 安全存储用户密码

- **收支记录管理**
  - 添加、编辑和删除收入和支出记录
  - 支持分类（如餐饮、交通、娱乐等）
  - 添加备注和日期信息

- **财务仪表盘**
  - 显示本月收入、支出和净余额
  - 最近交易记录快速查看
  - 支出分类饼图展示

- **预算管理**
  - 设置各类别的预算上限
  - 实时预算使用进度显示
  - 预算超支提醒

- **财务分析**
  - 按不同时间范围（本月、上月、近3个月等）查看财务数据
  - 收支趋势图表分析
  - 支出分类分析

- **个性化设置**
  - 货币单位切换
  - 主题切换（明暗模式）
  - 数据导出功能

## 技术栈

### 前端
- Vue 3 + Composition API
- Vue Router 进行路由管理
- Pinia 进行状态管理
- ECharts 数据可视化
- Naive UI 组件库
- Axios 进行HTTP请求
- Vite 作为构建工具

### 后端
- Node.js + Express
- MySQL 数据库
- JSON Web Token (JWT) 身份验证
- Bcrypt 密码加密

## 安装与使用

### 前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 配置数据库
# 1. 创建MySQL数据库
# 2. 导入 database/schema.sql
# 3. 配置 .env 文件

# 启动服务器
npm run dev
```

## 数据库配置

1. 创建MySQL数据库：

```sql
CREATE DATABASE finance_management;
```

2. 在项目根目录创建`.env`文件并配置数据库信息：

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=finance_management
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
```

3. 导入数据库结构：

```bash
mysql -u 用户名 -p finance_management < database/schema.sql
```

## 项目结构

```
/
├── src/                   # 前端源代码
│   ├── assets/            # 静态资源文件
│   ├── components/        # 组件
│   ├── config/            # 配置文件
│   ├── router/            # 路由配置
│   ├── services/          # API服务
│   ├── stores/            # Pinia存储
│   ├── views/             # 页面视图
│   ├── App.vue            # 根组件
│   └── main.js            # 应用入口
├── server/                # 后端源代码
│   ├── config/            # 服务器配置
│   ├── middleware/        # 中间件
│   ├── routes/            # API路由
│   └── index.js           # 服务器入口
├── database/              # 数据库相关文件
│   └── schema.sql         # 数据库结构
├── public/                # 静态资源
└── package.json           # 项目配置
```

## 数据库表结构

本系统使用MySQL数据库，主要包含以下表：

1. **users** - 用户信息
   - id: 用户ID
   - username: 用户名
   - password: 加密密码
   - email: 邮箱
   - created_at: 创建时间
   - updated_at: 更新时间

2. **transactions** - 交易记录
   - id: 交易ID
   - user_id: 用户ID
   - type: 类型（收入/支出）
   - category: 分类
   - amount: 金额
   - date: 日期
   - note: 备注
   - created_at: 创建时间
   - updated_at: 更新时间

3. **budgets** - 预算设置
   - id: 预算ID
   - user_id: 用户ID
   - category: 分类
   - amount: 预算金额
   - created_at: 创建时间
   - updated_at: 更新时间

4. **settings** - 用户设置
   - id: 设置ID
   - user_id: 用户ID
   - currency: 货币符号
   - theme: 主题设置
   - created_at: 创建时间
   - updated_at: 更新时间

5. **categories** - 交易类别
   - id: 类别ID
   - user_id: 用户ID
   - name: 类别名称
   - type: 类型（收入/支出）
   - is_default: 是否为默认类别
   - created_at: 创建时间

## 许可证

MIT © 2025
