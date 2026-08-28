# Melody Auth 接入指南（auth.sakuraink.net）

本文档说明如何将你自己的系统/应用接入到已部署的 Melody Auth 认证服务。

| 服务 | 地址 |
| ---- | ---- |
| 认证服务器（OAuth/OIDC） | `https://auth.sakuraink.net` |
| 管理后台 | `https://admin.sakuraink.net` |

---

## 1. 概述

Melody Auth 是一个自托管的 OAuth 2.0 / OIDC 认证系统，支持两种接入方式：

| 接入方式 | 适用场景 | 认证流程 | 需要什么凭证 |
| -------- | -------- | -------- | ------------ |
| **前端应用（SPA / 移动端）** | 浏览器端应用、手机 App | PKCE 授权码流程 | `clientId`（无密钥） |
| **后端服务（S2S）** | 你自己的服务器 / 微服务 | `client_credentials` | `clientId` + `clientSecret` |

认证令牌使用 **RS256** 算法签名的 JWT，后端可通过 JWKS 端点验签。

---

## 2. 核心端点速查

所有端点都基于 `https://auth.sakuraink.net`。

### 2.1 OAuth / OIDC 端点

| 端点 | 方法 | 用途 |
| ---- | ---- | ---- |
| `/.well-known/openid-configuration` | GET | OIDC 发现文档（包含 issuer、各端点地址） |
| `/.well-known/jwks.json` | GET | JWKS 公钥（用于验签 access token） |
| `/oauth2/v1/authorize` | GET | 授权端点（发起登录/注册/授权） |
| `/oauth2/v1/token` | POST | 令牌端点（换 access token / refresh token） |
| `/oauth2/v1/userinfo` | GET | 获取当前用户信息（需 Bearer access token） |
| `/oauth2/v1/revoke` | POST | 撤销令牌 |
| `/oauth2/v1/logout` | GET | 登出 |

### 2.2 服务端管理 API（S2S）

| 端点前缀 | 用途 |
| -------- | ---- |
| `/api/v1/users` | 用户管理 |
| `/api/v1/apps` | 应用管理 |
| `/api/v1/roles` | 角色管理 |
| `/api/v1/scopes` | 权限范围管理 |
| `/api/v1/orgs` / `/api/v1/org-groups` | 组织管理 |
| `/api/v1/user-attributes` | 用户自定义属性 |
| `/api/v1/logs` | 日志 |
| `/api/v1/swagger` | S2S REST API 在线文档（Swagger UI） |

> 完整 S2S API 文档：打开 `https://auth.sakuraink.net/api/v1/swagger`

---

## 3. 第一步：注册一个「应用」

在接入任何系统前，需要先在管理后台为它创建一个应用（即 OAuth 客户端），拿到 `clientId`（和 S2S 应用的 `clientSecret`）。

1. 用超级管理员账号登录 `https://admin.sakuraink.net`
2. 左侧菜单进入 **「应用」(Apps)**
3. 点击 **「创建应用」**，填写：

| 字段 | 说明 |
| ---- | ---- |
| Name | 应用名称（自定义） |
| Type | 应用类型：`spa`（前端）或 `s2s`（后端服务） |
| Scopes | 该应用被允许请求的权限范围 |
| Redirect URIs | 仅 SPA 需要：登录成功后允许跳转回的地址（**精确匹配，含协议**） |

4. 创建后：
   - **SPA 应用**：记录 `clientId`（SPA 使用 PKCE，无 clientSecret）
   - **S2S 应用**：记录 `clientId` 和 `clientSecret`（**clientSecret 只显示一次，请立即保存**）

---

## 4. 方式一：前端应用接入（PKCE，推荐）

前端应用无需保存任何密钥，通过 PKCE 授权码流程接入。推荐直接使用官方 SDK，它会自动处理 code verifier、token 换取、自动刷新等细节。

官方 SDK（均已发布到 npm）：

| 框架 | 包名 | 文档 |
| ---- | ---- | ---- |
| React | `@melody-auth/react` | [react-sdk.md](docs/react-sdk.md) |
| Vue 3 | `@melody-auth/vue` | [vue-sdk.md](docs/vue-sdk.md) |
| Angular | `@melody-auth/angular` | [angular-sdk.md](docs/angular-sdk.md) |
| 原生 JS / 其它 | `@melody-auth/web` | [web-sdk.md](docs/web-sdk.md) |

### 4.1 React 示例

安装：

```bash
npm install @melody-auth/react
```

在应用根部包一层 `AuthProvider`，并传入三个必填参数：

```tsx
import { AuthProvider } from '@melody-auth/react'

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      clientId='<你的 SPA 应用 clientId>'
      redirectUri='https://你的前端域名/登录回调'
      serverUri='https://auth.sakuraink.net'
      scopes={['openid', 'profile', 'offline_access']}
    >
      {children}
    </AuthProvider>
  )
}
```

在组件里使用 `useAuth()` 完成登录 / 登出 / 获取令牌：

```tsx
import { useAuth } from '@melody-auth/react'

function LoginButton () {
  const {
    isAuthenticating, isAuthenticated,
    loginRedirect, logoutRedirect,
  } = useAuth()

  if (isAuthenticating) return <div>加载中…</div>

  return isAuthenticated
    ? <button onClick={() => logoutRedirect({ postLogoutRedirectUri: 'https://你的前端域名/' })}>登出</button>
    : <button onClick={() => loginRedirect()}>登录 / 注册</button>
}
```

访问受保护资源时，用 `acquireToken()` 获取 access token（过期会自动刷新）：

```tsx
const { acquireToken } = useAuth()

const token = await acquireToken()
const res = await fetch('https://你的后端/api/xxx', {
  headers: { Authorization: `Bearer ${token}` },
})
```

获取当前用户信息：

```tsx
const { acquireUserInfo, userInfo } = useAuth()
await acquireUserInfo()   // 之后 userInfo 会包含用户资料
```

### 4.2 手动 PKCE（不依赖 SDK）

如需自己实现，按 OAuth 2.0 授权码 + PKCE 流程对接：

1. 生成随机的 `code_verifier`，并计算 `code_challenge = BASE64URL(SHA256(code_verifier))`
2. 跳转 `GET /oauth2/v1/authorize`，携带 `client_id`、`redirect_uri`、`response_type=code`、`code_challenge`、`code_challenge_method=S256`、`state`、`scope`
3. 用户在认证服务器完成登录后，携带 `code` 跳回 `redirect_uri`
4. 用 `code` + `code_verifier` 调 `POST /oauth2/v1/token`（`grant_type=authorization_code`）换取 `access_token` / `refresh_token`

> 具体参数与响应以 `https://auth.sakuraink.net/.well-known/openid-configuration` 为准。官方 SDK 已封装上述全部细节，一般无需手动实现。

---

## 5. 方式二：后端服务接入（S2S / client_credentials）

后端服务用 `clientId` + `clientSecret` 通过 Basic Auth 换取 access token，再用它调用管理 API。

### 5.1 换取 access token

```js
const clientId = '<你的 S2S 应用 clientId>'
const clientSecret = '<你的 S2S 应用 clientSecret>'

const credentials = `${clientId}:${clientSecret}`
const encoded = Buffer.from(credentials).toString('base64')

const data = {
  grant_type: 'client_credentials',
  scope: 'read_user write_user',   // 按需请求，root 代表全部权限
}

const res = await fetch('https://auth.sakuraink.net/oauth2/v1/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `basic ${encoded}`,
  },
  body: new URLSearchParams(data).toString(),
})

const { access_token, expires_in } = await res.json()
// access_token 有效期 expires_in 秒（默认 3600），之后可重复上述流程重新获取
```

### 5.2 调用管理 API

```js
const res = await fetch('https://auth.sakuraink.net/api/v1/users', {
  headers: { Authorization: `Bearer ${access_token}` },
})
const users = await res.json()
```

所有 S2S 接口按 scope 控制访问权限，完整列表见 `https://auth.sakuraink.net/api/v1/swagger`。

---

## 6. 方式三：后端验证用户的 access token

前端登录后，会把 access token（RS256 签名的 JWT）带给你的后端。后端必须验证签名与关键声明后才可信任。

验证要点：

- 从 `/.well-known/jwks.json` 获取公钥（支持缓存与限流）
- 按 token 头部的 `kid` 选择对应公钥
- 校验算法为 `RS256`，并校验 `iss`（issuer）、`aud`（audience）等关键声明

Node.js（TypeScript）示例：

```ts
import { verify, JwtHeader } from 'jsonwebtoken'
import jwksClient, { SigningKey } from 'jwks-rsa'

const client = jwksClient({
  jwksUri: 'https://auth.sakuraink.net/.well-known/jwks.json',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
})

function getKey (header: JwtHeader, cb: (e: Error | null, k?: string) => void) {
  if (!header.kid) return cb(new Error('missing kid'))
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return cb(err || new Error('no key'))
    cb(null, (key as SigningKey).getPublicKey())
  })
}

export function verifyAccessToken (token: string): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) return reject(err)
      resolve(decoded as Record<string, any>)
    })
  })
}
```

---

## 7. 权限模型速览

### 7.1 Scopes（权限范围）

- **用户令牌（SPA）**：`openid`、`profile`、`offline_access`（`offline_access` 用于获取 refresh token）
- **服务令牌（S2S）**：`root`（全部权限）以及细粒度权限 `read_user`、`write_user`、`read_app`、`write_app`、`read_role`、`write_role`、`read_scope`、`write_scope`、`read_org`、`write_org`

### 7.2 Roles（角色）

- 内置角色：`super_admin`（超级管理员，可访问管理后台全部功能）
- 角色与用户的关联记录在 `user_role` 表，可在管理后台「用户」页管理

---

## 8. 注意事项

1. **Redirect URI 精确匹配**：SPA 应用配置的 redirect URI 必须与登录请求中的完全一致（含协议、域名、路径），否则会报错。
2. **clientSecret 只显示一次**：创建 S2S 应用时，clientSecret 仅在创建后展示一次，务必立即保存。遗失需在管理后台重置。
3. **登出回调地址**：`logoutRedirect` 的 `postLogoutRedirectUri` 需要是应用已注册的 redirect URI 之一，否则会回退到第一个已注册地址。
4. **令牌有效期**：access token 短期有效，SPA 侧由 SDK 自动刷新；S2S 侧需自行在过期后重新调用 `/oauth2/v1/token`。
5. **密钥轮换**：JWKS 公钥可能轮换，后端验签必须支持按 `kid` 选 key 并缓存，不要写死公钥。
6. **CORS / 安全**：前端与认证服务器之间的跨域由服务器侧配置处理；后端验签时不要信任未经校验的声明。

---

## 9. 相关文档

- OAuth/OIDC 认证：`docs/authentication.md`
- S2S 管理 API：`docs/s2s-api.md`
- JWT 与 JWKS：`docs/jwt-and-jwks.md`
- React SDK：`docs/react-sdk.md` · Vue：`docs/vue-sdk.md` · Angular：`docs/angular-sdk.md` · Web：`docs/web-sdk.md`
- 角色权限 RBAC：`docs/rbac.md`
