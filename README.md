# PayNex - 智能财务助手 🚀

## 项目简介 📝

PayNex是一款基于Vue 3开发的现代化个人财务管理系统，致力于为用户提供智能、便捷、安全的个人财务管理解决方案。通过直观的界面设计和强大的数据分析功能，帮助用户更好地掌控个人财务状况。

## 核心功能 ✨

### 1. 智能记账管理
- 📊 直观的收支记录界面
- 💱 多币种支持（¥、$、€、£）
- 🤖 智能交易分类系统
- 🏷️ 灵活的备注和标签功能

### 2. 预算规划
- 📈 可视化预算设置
- ⚡ 实时预算追踪
- ⚠️ 超支预警提醒
- 💡 智能预算建议

### 3. 数据分析与可视化
- 📊 收支趋势分析
- 📉 消费习惯分析
- 📌 交互式图表展示
- 📑 自定义报表生成

### 4. 个性化设置
- 🌓 深浅主题切换
- 💰 货币单位自定义
- 💾 数据导出备份
- ⚙️ 用户偏好设置

## 技术栈 🛠️

- 前端框架：Vue 3
- 构建工具：Vite
- 状态管理：Pinia
- UI组件库：Naive UI
- HTTP客户端：Axios
- 路由管理：Vue Router
- 图表库：ECharts
- 工具库：Lodash

## 快速开始 🚀

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.14.0

### 安装步骤

1. 克隆项目
```bash
git clone https://https://github.com/Travis007-t/AI-Financial-master
```

## 项目配置 ⚙️

1. 环境变量配置
   创建 `.env` 文件：
```
VITE_API_URL=http://localhost:3000/api
DEEPSEEK_API_KEY=your_deepseek_api_key
```

2. 数据库配置
   修改 `server/config/db.js` 中的数据库连接信息。

   
## 安装与使用
### 项目克隆
```bash
git clone https://https://github.com/Travis007-t/AI-Financial-master
```

### 前端

```bash
# 安装依赖
npm install
npm install lottie-web

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
mysql -u 用户名 -p AI-FINANCIAL-MASTER < database/schema.sql
```

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
## 使用指南 📖

1. 注册/登录账户
2. 设置个人偏好（货币单位、主题等）
3. 开始记录收支
4. 设置预算目标
5. 查看财务分析报告

## 安全特性 🔐

- JWT token认证
- 密码加密存储
- 安全的会话管理
- 数据备份功能

## 贡献指南 🤝

欢迎提交问题和改进建议！提交PR之前请确保：

1. 更新测试用例
2. 更新相关文档
3. 遵循代码规范
4. 添加必要的注释

## 开源许可 📄

本项目采用 [MIT](LICENSE) 许可证。

## 联系我们 📧

如有任何问题或建议，欢迎联系我们：
- Email: 2889584794@qq.com
- GitHub Issues: [提交问题](https://github.com/Travis007-t/AI-Financial-master/issues)

---

感谢使用 PayNex！希望它能帮助您更好地管理个人财务！ 🌟
