# Entry Task H5 (Umi + TypeScript)

移动端活动分享应用（登录/列表/详情/个人页），基于 `@umijs/max`（Umi 4）+ React + TypeScript，包管理器 yarn。

当前 React 版本：18.x。

## 项目内容

### 目录结构

```
src/
  assets/             # 图片、svg 等静态资源
  components/         # 通用组件（Loading/Toast/InfiniteList/StickyMenu/Carousel...）
  layouts/            # Layout（BasicLayout）
  locales/            # i18n 文案
  models/             # Umi useModel（auth/ui）
  pages/              # 页面（login/list/detail/me）
  services/           # API 封装（基于自写 fetch client）
  store/              # Redux store（search/user）
  utils/              # storage 等工具
```

### 环境要求

- Node.js `>=16`
- Yarn `>=1.22`

### 安装与启动

```bash
yarn install

yarn dev        # 本地开发：max dev
yarn build      # 构建产物
yarn lint       # ESLint：eslint --ext .ts,.tsx,.js src
yarn typecheck  # max setup && tsc --noEmit
```

### 后端与环境变量

- API 前缀固定为 `/api/v1`（在请求层统一处理）。
- API Host 通过 `.env` 的 `API_BASE` 配置（构建时注入）。
- 请求会在 header 注入 `X-BLACKCAT-TOKEN`（token 存在 `sessionStorage`）。

## 路由与页面

路由配置在 `.umirc.ts`：

- `/login`：登录页（中/英切换、Toast 提示、防重复提交）。
- `/list`：活动列表页（筛选抽屉、无限滚动、空态/错误重试）。
- `/events/:id`：活动详情页（轮播图、吸顶菜单、锚定滚动、点赞/参加/评论、评论无限滚动）。
- `/me`：个人页（吸顶菜单切换 liked/going/past + 列表无限滚动）。

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

## 移动端适配（REM：1rem = 16px）

本项目使用 `postcss-pxtorem` 做「px → rem」转换，但 **不注入 flexible 动态修改根字号**，因此 `1rem` 保持浏览器默认的 `16px`（见 `.umirc.ts`）。
本项目使用 `postcss-pxtorem` 做「px → rem」转换，但 **不注入 flexible 动态修改根字号**，因此 `1rem` 保持浏览器默认的 `16px`（见 `.umirc.ts`）。
本项目使用 `postcss-pxtorem` 做「px → rem」转换，但 **不注入 flexible 动态修改根字号**，因此 `1rem` 保持浏览器默认的 `16px`（见 `.umirc.ts`）。
本项目使用 `postcss-pxtorem` 做「px → rem」转换，但 **不注入 flexible 动态修改根字号**，因此 `1rem` 保持浏览器默认的 `16px`（见 `.umirc.ts`）。
本项目使用 `postcss-pxtorem` 做「px → rem」转换，但 **不注入 flexible 动态修改根字号**，因此 `1rem` 保持浏览器默认的 `16px`（见 `.umirc.ts`）。

开发约定：

- 样式优先用设计稿 `px` 写，构建时自动转换；尽量不要手写 `rem`。
- iPhone 刘海屏等安全区场景：`position: fixed` 的底部组件可加 `padding-bottom: env(safe-area-inset-bottom)`；如需沉浸式全屏再在 `viewport` 配置 `viewport-fit=cover`。

## 具体功能实现设计

### 1) 无限滚动不定高虚拟列表（Variable Height Virtual List）

设计要点（对应需求：transform + IntersectionObserver + ResizeObserver）：

- **只渲染可视区**：根据 `scrollTop` 与容器高度计算 `[startIndex,endIndex]`，并加 `overscan` 扩展渲染窗口。
- **不定高测量**：每个渲染行使用 `ResizeObserver` 获取真实高度，写入 `heightsRef[index]`；高度变化时触发重新计算。
- **前缀和定位**：根据 `heightsRef` 与 `estimatedItemHeight` 生成 `offsets[]/totalHeight`，二分查找起止 index（避免线性扫描）。
- **transform 位移**：外层使用 `vil-spacer` 撑起总高度；内层 `vil-inner` 通过 `translate3d(0, offsets[startIndex], 0)` 把渲染窗口移动到正确位置。
- **无限加载**：在总高度底部放置 sentinel，使用 `IntersectionObserver`（`root` 指向滚动容器）在接近底部时触发 `onLoadMore`。

### 2) 无限滚动列表（Infinite Scroll List）

- 用 `IntersectionObserver` 监听底部 sentinel；
- 当 `entry.isIntersecting && !loading && hasMore && !error` 时触发 `onLoadMore`；
- 支持 empty/error/retry/end/loading 等状态展示；
- `rootMargin: 120px` 提前预取，减少触底等待感。

页面侧分页策略：

- 使用 `offsetRef` 维护已加载数量，`PAGE_SIZE` 控制每页条数；
- `loadingRef` 防并发；`requestIdRef` 防“乱序覆盖”；
- reset 时清空列表与 offset，并可配合 `startLoading/stopLoading` 显示全局 Loading。

### 3) Loading 实现

- **组件 Loading**：`<Loading fullscreen />` 或 `<Loading text="..." />`。
- **全局 Loading**：通过模块级事件总线维护 `loadingCount`：
  - `startLoading()` 计数 +1，`stopLoading()` 计数 -1；
  - `GlobalLoadingOverlay` 订阅状态并在 `loadingCount>0` 时展示全屏遮罩；
  - `BasicLayout` 全局挂载了 `<GlobalLoadingOverlay />`。

### 4) 错误拦截（Error Interception）

本项目有两层“错误/鉴权”处理：

- **自写 fetch client（实际被 services 使用）**
  - 统一注入 token；
  - 非 2xx 构造 `ApiError` 并 `throw`；
  - 401/403 触发未授权处理：清 token/user 并跳转登录（带 redirect）。

页面侧通常用 `try/catch` 把错误落到 UI（error 文案 / Retry / Toast）。

### 5) Toast 处理

- 用 `ReactDOM.createPortal` 渲染到 `document.body`，避免受父容器 overflow/transform 影响；
- 支持 `anchorId`：根据锚点元素 `getBoundingClientRect().bottom` 把 toast 固定在某个组件下方（详情页底部操作条会用到）。
- 支持 `anchorId`：根据锚点元素 `getBoundingClientRect().bottom` 把 toast 固定在某个组件下方（详情页底部操作条会用到）。
- 支持 `anchorId`：根据锚点元素 `getBoundingClientRect().bottom` 把 toast 固定在某个组件下方（详情页底部操作条会用到）。
- 支持 `anchorId`：根据锚点元素 `getBoundingClientRect().bottom` 把 toast 固定在某个组件下方（详情页底部操作条会用到）。
