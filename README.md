# 小小汉字勇士

小小汉字勇士是一个给孩子练习常用汉字的网页小游戏。孩子先看大字卡，认拼音和组词，再通过闯关测试确认每个字都会认。完成一关后，可以选择小游戏继续复习。

在线试玩：

```text
https://techwizard8743.github.io/Little-Chinese-Character-Warrior-/
```

## 适合谁

- 正在认识常用汉字的孩子
- 想用轻量小游戏复习拼音和字形的家庭
- 想离线打开、无需安装软件的中文学习场景

## 当前内容

- 125 关
- 每关 20 个汉字
- 共 2500 个常用汉字
- 每关有 20 字总览，方便快速预习
- 大字卡显示汉字、拼音和真实组词
- 大字卡带米字格辅助观察字形
- 闯关测试会覆盖本关全部 20 个字
- 答错的字会进入错题本，并在后面继续出现
- 错题本可以打印成 A4 练习页
- 进度会保存在当前浏览器和设备中
- 支持安装到手机或电脑主屏幕，并缓存核心文件供离线打开

## 小游戏

完成本关 20 个字后，可以选择一个小游戏：

- 汉字泡泡：看拼音，点正确的汉字泡泡
- 接宝箱：看拼音，移动篮子接正确汉字，避开炸弹
- 贪食蛇：看拼音，控制小蛇吃正确汉字

每关小游戏最多可以玩 3 次。贪食蛇默认轻松模式，穿墙不会立刻失败；也可以打开困难模式，让撞墙扣生命。

## 怎么打开

最简单的方法是使用 GitHub Pages 在线链接：

```text
https://techwizard8743.github.io/Little-Chinese-Character-Warrior-/
```

也可以在电脑上直接双击项目里的 `index.html`：

```text
C:\Users\leene\Documents\GitHub\Little-Chinese-Character-Warrior-\index.html
```

## 安装到主屏幕

在 iPhone 或 iPad 上，用 Safari 打开在线链接，点分享按钮，然后选择“添加到主屏幕”。以后可以像普通 App 一样从桌面打开。

在 Chrome、Edge 等浏览器中，如果地址栏显示安装按钮，也可以直接安装到电脑或安卓设备。第一次在线打开后，核心页面和课程数据会缓存下来，之后没有网络时也能继续打开同一设备上的游戏。

## 家长和测试模式

普通链接不会显示测试工具。

如果需要快速检查不同关卡和小游戏，可以在网址后面加：

```text
?debug=1
```

例如：

```text
https://techwizard8743.github.io/Little-Chinese-Character-Warrior-/?debug=1
```

测试模式可以：

- 跳到任意关卡
- 临时查看未解锁关卡
- 解锁到指定关卡
- 一键把本关 20 个字标记为已会
- 清空本关小游戏次数，方便重复测试泡泡、宝箱和贪食蛇

测试模式适合家长或开发时使用，不建议把带 `?debug=1` 的链接发给孩子。

## 进度保存

学习进度保存在浏览器的 `localStorage` 中。

这意味着：

- 关闭浏览器后再打开，进度通常还在
- 换浏览器、换电脑或清理浏览器数据后，进度不会自动同步
- 当前版本不会上传孩子的学习数据

## 项目结构

```text
index.html                  页面结构
styles.css                  界面样式
app.js                      学习流程、进度和小游戏逻辑
word-data.js                生成后的 2500 字课程数据
manifest.webmanifest        PWA 安装信息
service-worker.js           离线缓存逻辑
icons/                      主屏幕和安装图标
tools/generate-word-data.js 课程数据生成脚本
3500-common.txt             常用字来源
hanzi-pinyin-table.json     拼音来源
PROJECT_STATE.md            项目交接和当前状态记录
```

## 开发检查

在项目文件夹中运行：

```powershell
node --check app.js
node --check word-data.js
node --check tools\generate-word-data.js
```

重新生成课程数据：

```powershell
node tools\generate-word-data.js
```

## 下一步想法

- 做一次手机和电脑的完整试玩检查
- 继续优化三个小游戏的手感和节奏
- 增加更适合家长查看的学习记录页面
- 未来可以加入听音选字、看词选字、描红练习等玩法
