# blog-front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Mock 调试

- 当前项目默认启用全量 Mock 数据，开发和当前生产配置都使用 `VITE_ENABLE_MOCK=true`
- Mock 已按领域拆分在 `mock/*.mock.ts`，共用逻辑在 `mock/shared.ts`，测试数据在 `mock/test-data.json`
- 默认测试账号：`admin / admin123`、`editor / editor123`、`tester / tester123`
- 如需联调真实后端，设置 `VITE_ENABLE_MOCK=false`，并把 `VITE_DEV_PROXY_TARGET` 指向后端地址

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

## Project Docs

- [前端项目结构与编写规范](./docs/project-structure-convention.md)
- [前端代码编写规范](./docs/code-writing-convention.md)
- [后端菜单驱动路由规范](./docs/backend-menu-routing-convention.md)
