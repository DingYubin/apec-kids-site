# 插画与分享图资源说明

本项目共 **38 张站点插画**（WebP，约 6.7 MB）和 **1 张社交分享预览图**（JPEG），均由
Muse AI 于 2026-10-20 生成，提示词和生成脚本保存在 `tools/`。

## 一、站点插画（38 张）

| 类别 | 数量 | 尺寸 | 目录 |
|------|------|------|------|
| 首页背景 | 1 | 1920×1080（16:9） | `assets/home-bg.webp` |
| 角色头像 | 5 | 1024×1024（1:1） | `assets/avatars/` |
| 朋友圈配图 | 6 | 1600×1200（4:3） | `assets/moments/` |
| 经济体卡片 | 21 | 1200×1600（3:4） | `assets/cards/` |
| 南山元素卡 | 5 | 1920×1080（16:9） | `assets/nanshan/` |

完整文件清单：

- `assets/avatars/`：`avatar-kevin.webp`、`avatar-pengyou.webp`、`avatar-xiaokui.webp`、`avatar-amir.webp`、`avatar-luna.webp`
- `assets/moments/`：`moment-kevin-1.webp`、`moment-kevin-2.webp`、`moment-kevin-3.webp`、`moment-xiaokui.webp`、`moment-amir.webp`、`moment-luna.webp`
- `assets/cards/`：`card-01-china.webp` 至 `card-21-usa.webp`（共 21 张）
- `assets/nanshan/`：`nanshan-1-shenzhenbay.webp`、`nanshan-2-nantou.webp`、`nanshan-3-sciencepark.webp`、`nanshan-4-shekou.webp`、`nanshan-5-qianhai.webp`

所有 WebP 单张均小于 300KB。页面通过 `web/js/assets-manifest.js` 检查资源清单；
图片缺失或加载失败时，会自动回退为 emoji/CSS 占位，不会让页面报错。

## 二、分享预览图

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `assets/share/og-cover.jpg` | 1200×630 | 微信、社交平台链接预览的 Open Graph / Twitter Card 封面 |

对应标签已写入 `web/index.html`。当前预览地址指向 GitHub Pages 的绝对地址，部署到主站前请确认分享平台实际抓取的 URL 与图片地址一致。

## 三、生成与维护

- 提示词清单：`tools/muse-prompts.json`
- 批量生成脚本：`tools/generate-muse-images.mjs`
- 生成记录：`docs/03-文生图提示词.md`
- API 令牌只通过环境变量 `MUSE_API_TOKEN` 传入，不写入仓库或日志：

```bash
MUSE_API_TOKEN='<你的令牌>' node tools/generate-muse-images.mjs --dry-run
```

- 更新图片后重新生成资源清单，并检查文件名与尺寸。
- 如改用 PNG/JPG，统一修改 `web/js/data.js` 中的 `ASSET_EXT`，不要把扩展名混在同一批资源里。
