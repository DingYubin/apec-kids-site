# 图片放置说明

把 03 文档里生成好的图，按下表文件名丢进对应文件夹，刷新页面即可自动生效。
**没有图也能跑**——页面会自动降级成 emoji 占位，不会报错。

## 一、目录与文件清单

### `assets/`（根目录）
| 文件名 | 尺寸 | 说明 |
|--------|------|------|
| `home-bg.webp` | 1920×1080（16:9） | 首页背景（可选；没有就用 CSS 画的天空海面） |
| `wall-bg.webp` | 1920×1080（16:9） | 留言墙背景（可选，当前未启用） |

### `assets/avatars/`（1:1，1024×1024）
`avatar-kevin.webp`、`avatar-pengyou.webp`、`avatar-xiaokui.webp`、`avatar-amir.webp`、`avatar-luna.webp`

### `assets/moments/`（4:3，1600×1200）
`moment-kevin-1.webp`、`moment-kevin-2.webp`、`moment-kevin-3.webp`、
`moment-xiaokui.webp`、`moment-amir.webp`、`moment-luna.webp`

### `assets/cards/`（3:4，1200×1600）
```
card-01-china.webp          card-06-australia.webp      card-11-singapore.webp      card-16-mexico.webp     card-21-usa.webp
card-02-hongkong.webp       card-07-newzealand.webp     card-12-thailand.webp       card-17-peru.webp
card-03-taipei.webp         card-08-indonesia.webp      card-13-vietnam.webp        card-18-chile.webp
card-04-japan.webp          card-09-malaysia.webp       card-14-brunei.webp         card-19-russia.webp
card-05-korea.webp          card-10-philippines.webp    card-15-png.webp            card-20-canada.webp
```

### `assets/nanshan/`（16:9，1920×1080）
`nanshan-1-shenzhenbay.webp`、`nanshan-2-nantou.webp`、`nanshan-3-sciencepark.webp`、
`nanshan-4-shekou.webp`、`nanshan-5-qianhai.webp`

## 二、扩展名

生成的是 PNG / JPG 也没关系：打开 `web/js/data.js` 第 9 行，改一个字就行：

```js
const ASSET_EXT = "webp";   // 改成 "png" 或 "jpg"
```

改完所有图片路径会一起变，不用一张张改。

## 三、体积要求

单张压到 **300KB 以内**（webp 最好）。总量建议 < 8MB，否则评委打开会慢。
