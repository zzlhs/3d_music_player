# Three.js 3D 倾斜歌词播放器

纯前端 3D 歌词播放器。点击"选择音乐文件夹"选中本地音乐目录，自动扫描 mp3 文件和配对 LRC 歌词，上传静态背景图片后在 Three.js 画布中实时播放带 3D 倾斜歌词和动态背景特效的音乐。

## 启动命令

```bash
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5173`（需 Chrome 或 Edge，`showDirectoryPicker` API 需要 HTTPS 或 localhost）。

## 使用说明

1. 点击左侧 **选择音乐文件夹** 按钮
2. 在弹出的文件夹选择器中选中包含 mp3 文件的目录
3. 从自动扫描出的歌曲列表中选择一首歌
4. 上传一张 **背景图片**（JPG/PNG/WebP，可选）
5. 选择 **背景特效预设**（6 种可选）和 **歌词颜色预设**（6 种可选）
6. 点击底部 **播放按钮** 开始播放
7. 通过控制面板滑块实时调节各种视觉效果参数

## 歌曲 + 歌词配对规则

- 自动扫描文件夹下所有 `.mp3` 文件
- 对每个 mp3，查找同名的 `.lrc` 文件（如 `song.mp3` 配 `song.lrc`）
- 没有 LRC 文件仍可播放音乐，但歌词不可用
- 文件名排序显示在歌曲列表中

## 支持的文件格式

- 音频：mp3（通过 File System Access API 读取）
- 歌词：lrc（自动配对同名文件）
- 背景图片：jpg / jpeg / png / webp

## 背景特效预设

| 预设 | 说明 |
|------|------|
| 星尘漂浮 (starDust) | 细小星点缓慢漂浮，适合抒情歌 |
| 慢速雪点 (snowFall) | 白色细点缓慢落下，适合冷色场景 |
| 蓝色光雨 (blueRain) | 蓝白光线从上划过，有速度感 |
| 星云流动 (nebulaFlow) | 蓝紫雾气流动，梦幻感 |
| 光隧道 (lightTunnel) | 透视光线增强 3D 纵深 |
| 柔和呼吸光 (calmGlow) | 无粒子，暗部轻微呼吸发光 |

## 歌词颜色预设

- 冰蓝 (iceBlue)
- 暖白 (warmWhite)
- 霓虹粉 (neonPink)
- 金色梦 (goldenDream)
- 薄荷绿 (mintGreen)
- 紫银河 (purpleGalaxy)

## 技术栈

Vite + React 18 + TypeScript + Three.js (R3F/Drei/Postprocessing) + Zustand + Tailwind CSS

## 浏览器兼容

- 需要 Chrome 86+ 或 Edge 86+（支持 File System Access API）
- Firefox 和 Safari **不支持** `showDirectoryPicker`
- 移动端不崩溃但未深度适配

## 已知问题

- 首次播放需要用户手势触发 AudioContext
- 切换歌曲时需重新点击播放
- 音频文件通过 `URL.createObjectURL` 加载，大文件可能占用较多内存
- 中文字体文件较大（约 17MB），首次加载可能较慢
- 选取的文件夹权限仅在当前页面会话中有效（刷新后需重新选择）
