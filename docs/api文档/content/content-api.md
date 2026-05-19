# 内容域 API 索引

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

本文档已拆分为多个聚焦文档，请根据需要查阅对应文件。

---

## 文档导航

| 文件 | 说明 |
|-----|------|
| [content-public-api.md](./content-public-api.md) | 公开接口：首页文章列表、文章详情、分类与标签、公开友情链接 |
| [content-comment-api.md](./content-comment-api.md) | 文章评论接口：公开评论列表、用户评论操作 |
| [content-user-api.md](./content-user-api.md) | 用户文章接口：文章行为、收藏、足迹等个人功能 |
| [content-admin-api.md](./content-admin-api.md) | 后台管理接口：文章管理、分类管理、标签管理、评论管理、收藏管理、足迹管理、互动管理、友情链接管理 |

---

## 接口速查表

### 公开接口（无需登录）

| 接口 | 方法 | 路径 | 说明 |
|-----|------|-----|------|
| 文章分页列表 | GET | /api/articles | 首页/列表页文章 |
| 文章详情 | GET | /api/articles/{id} | 文章详情页 |
| 作者系列列表 | GET | /api/public/authors/{authorId}/series | 作者公开系列 |
| 系列详情 | GET | /api/public/article-series/{id} | 系列详情 |
| 分类树 | GET | /api/categories/tree | 获取分类结构 |
| 标签列表 | GET | /api/tags | 获取所有标签 |
| 评论树 | GET | /api/comments | 获取文章评论 |
| 友情链接列表 | GET | /api/public/friend-links | 启用的友情链接 |

### 用户接口（需登录）

| 接口 | 方法 | 路径 | 说明 |
|-----|------|-----|------|
| 我的文章列表 | GET | /api/user/articles | 我发表的文章 |
| 我的文章详情 | GET | /api/user/articles/{id} | 文章编辑信息 |
| 点赞文章 | POST | /api/user/articles/{id}/likes | 点赞 |
| 取消点赞 | DELETE | /api/user/articles/{id}/likes | 取消点赞 |
| 配置文章访问 | PUT | /api/user/articles/{id}/access | 我的文章访问名单 |
| 提交审核 | POST | /api/user/articles/{id}/submit-review | 提交文章审核 |
| 审核日志 | GET | /api/user/articles/{id}/review-log | 查看审核日志 |
| 我的系列列表 | GET | /api/user/article-series | 我的文章系列 |
| 系列详情 | GET | /api/user/article-series/{id} | 系列详情 |
| 创建系列 | POST | /api/user/article-series | 创建系列 |
| 修改系列 | PUT | /api/user/article-series/{id} | 修改系列 |
| 删除系列 | DELETE | /api/user/article-series/{id} | 删除系列 |
| 系列加入文章 | POST | /api/user/article-series/{id}/articles | 向系列加入文章 |
| 系列移出文章 | DELETE | /api/user/article-series/{id}/articles/{articleId} | 从系列移出文章 |
| 系列文章排序 | PUT | /api/user/article-series/{id}/articles/sort | 调整文章顺序 |
| 发表评论 | POST | /api/user/comments | 发表评论 |
| 删除我的评论 | DELETE | /api/user/comments/{id} | 删除自己的评论 |
| 点赞评论 | POST | /api/user/comments/{id}/likes | 点赞评论 |
| 取消点赞评论 | DELETE | /api/user/comments/{id}/likes | 取消点赞评论 |
| 收藏夹列表 | GET | /api/user/collection-folders | 我的收藏夹 |
| 新增收藏夹 | POST | /api/user/collection-folders | 创建收藏夹 |
| 修改收藏夹 | PUT | /api/user/collection-folders/{id} | 编辑收藏夹 |
| 删除收藏夹 | DELETE | /api/user/collection-folders/{id} | 删除收藏夹 |
| 收藏列表 | GET | /api/user/collections | 我的收藏 |
| 新增收藏 | POST | /api/user/collections | 添加收藏 |
| 删除收藏 | DELETE | /api/user/collections/{id} | 移除收藏 |
| 我的足迹 | GET | /api/user/footprints | 浏览足迹 |
| 删除足迹 | DELETE | /api/user/footprints/{id} | 删除单条足迹 |
| 清空足迹 | DELETE | /api/user/footprints | 清空所有足迹 |

### 后台接口（需管理员权限）

| 接口 | 方法 | 路径 | 权限 |
|-----|------|-----|------|
| 文章列表 | GET | /api/sys/articles | content:article:query |
| 文章详情 | GET | /api/sys/articles/{id} | content:article:query |
| 新增文章 | POST | /api/sys/articles | content:article:create |
| 修改文章 | PUT | /api/sys/articles/{id} | content:article:update |
| 修改状态 | PUT | /api/sys/articles/{id}/status | content:article:update-status |
| 配置访问 | PUT | /api/sys/articles/{id}/access | content:article:access |
| 切换置顶 | PUT | /api/sys/articles/{id}/top | content:article:update |
| 切换推荐 | PUT | /api/sys/articles/{id}/recommend | content:article:update |
| 删除文章 | DELETE | /api/sys/articles/{id} | content:article:delete |
| 审核列表 | GET | /api/sys/article-reviews | content:article-review:query |
| 审核详情 | GET | /api/sys/article-reviews/{id} | content:article-review:query |
| 审核通过 | PUT | /api/sys/article-reviews/{id}/approve | content:article-review:review |
| 审核拒绝 | PUT | /api/sys/article-reviews/{id}/reject | content:article-review:review |
| 修正审核状态 | PUT | /api/sys/article-reviews/{id}/repair-status | content:article-review:repair |
| 分类树 | GET | /api/sys/categories/tree | content:category:query |
| 分类详情 | GET | /api/sys/categories/{id} | content:category:query |
| 新增分类 | POST | /api/sys/categories | content:category:create |
| 修改分类 | PUT | /api/sys/categories/{id} | content:category:update |
| 分类启停 | PUT | /api/sys/categories/{id}/status | content:category:update |
| 删除分类 | DELETE | /api/sys/categories/{id} | content:category:delete |
| 标签列表 | GET | /api/sys/tags | content:tag:query |
| 标签详情 | GET | /api/sys/tags/{id} | content:tag:query |
| 新增标签 | POST | /api/sys/tags | content:tag:create |
| 修改标签 | PUT | /api/sys/tags/{id} | content:tag:update |
| 删除标签 | DELETE | /api/sys/tags/{id} | content:tag:delete |
| 评论列表 | GET | /api/sys/comments | content:comment:query |
| 评论详情 | GET | /api/sys/comments/{id} | content:comment:query |
| 评论启停 | PUT | /api/sys/comments/{id}/status | content:comment:update |
| 删除评论 | DELETE | /api/sys/comments/{id} | content:comment:delete |
| 收藏夹列表 | GET | /api/sys/collections/folders | content:collection:query |
| 收藏记录列表 | GET | /api/sys/collections | content:collection:query |
| 删除收藏记录 | DELETE | /api/sys/collections/{id} | content:collection:delete |
| 足迹列表 | GET | /api/sys/footprints | content:footprint:query |
| 删除足迹 | DELETE | /api/sys/footprints/{id} | content:footprint:delete |
| 清理足迹 | DELETE | /api/sys/footprints | content:footprint:delete |
| 互动列表 | GET | /api/sys/interactions | content:interaction:query |
| 删除互动 | DELETE | /api/sys/interactions/{id} | content:interaction:delete |
| 友情链接列表 | GET | /api/sys/friend-links | content:friend-link:query |
| 友情链接详情 | GET | /api/sys/friend-links/{id} | content:friend-link:query |
| 新增友情链接 | POST | /api/sys/friend-links | content:friend-link:create |
| 修改友情链接 | PUT | /api/sys/friend-links/{id} | content:friend-link:update |
| 友情链接启停 | PUT | /api/sys/friend-links/{id}/status | content:friend-link:update |
| 删除友情链接 | DELETE | /api/sys/friend-links/{id} | content:friend-link:delete |