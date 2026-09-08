> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。
>
> 注:本文件为快捷键全量参考表,所有动作条目均属核心内容,已按表完整翻译。

# 快捷键

所有键盘快捷键都可以通过 `~/.pi/agent/keybindings.json` 自定义。每个动作可绑定一个或多个按键。

配置文件使用的带命名空间的快捷键 id 与 pi 内部使用的一致,扩展作者在 `keyHint()` 和注入的 `keybindings` 管理器中也使用同一套 id。

使用旧式无命名空间 id(如 `cursorUp`、`expandTools`)的旧配置会在启动时自动迁移为带命名空间的 id。

编辑 `keybindings.json` 后,在 pi 中运行 `/reload` 即可应用更改,无需重启会话。

## 按键格式

格式为 `modifier+key`,修饰键包括 `ctrl`、`shift`、`alt`、`super`(可组合),按键包括:

- **字母:** `a-z`
- **数字:** `0-9`
- **特殊键:** `escape`、`esc`、`enter`、`return`、`tab`、`space`、`backspace`、`delete`、`insert`、`clear`、`home`、`end`、`pageUp`、`pageDown`、`up`、`down`、`left`、`right`
- **功能键:** `f1`-`f12`
- **符号:** `` ` ``、`-`、`=`、`[`、`]`、`\`、`;`、`'`、`,`、`.`、`/`、`!`、`@`、`#`、`$`、`%`、`^`、`&`、`*`、`(`、`)`、`_`、`+`、`|`、`~`、`{`、`}`、`:`、`<`、`>`、`?`

修饰键组合:`ctrl+shift+x`、`alt+ctrl+x`、`ctrl+shift+alt+x`、`super+k`、`ctrl+super+k`、`ctrl+1` 等。

`super` 绑定要求终端单独上报该修饰键,通常需要 Kitty 键盘协议。不支持该协议的终端中可能无效。

## 全部动作

### TUI 编辑器光标移动

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `tui.editor.cursorUp` | `up` | 光标上移,在顶部时浏览更早的历史 |
| `tui.editor.cursorDown` | `down` | 光标下移,在底部时浏览更新的历史 |
| `tui.editor.historyPrevious` | *(无)* | 选择上一条 prompt 历史 |
| `tui.editor.historyNext` | *(无)* | 选择下一条 prompt 历史 |
| `tui.editor.cursorLeft` | `left`、`ctrl+b` | 光标左移 |
| `tui.editor.cursorRight` | `right`、`ctrl+f` | 光标右移 |
| `tui.editor.cursorWordLeft` | `alt+left`、`ctrl+left`、`alt+b` | 光标按词左移 |
| `tui.editor.cursorWordRight` | `alt+right`、`ctrl+right`、`alt+f` | 光标按词右移 |
| `tui.editor.cursorLineStart` | `home`、`ctrl+home`、`ctrl+a` | 移到行首 |
| `tui.editor.cursorLineEnd` | `end`、`ctrl+end`、`ctrl+e` | 移到行尾 |
| `tui.editor.jumpForward` | `ctrl+]` | 向前跳到指定字符 |
| `tui.editor.jumpBackward` | `ctrl+alt+]` | 向后跳到指定字符 |
| `tui.editor.pageUp` | `pageUp`、`ctrl+pageUp` | 向上翻一页 |
| `tui.editor.pageDown` | `pageDown`、`ctrl+pageDown` | 向下翻一页 |

专用的历史动作始终切换历史条目,与光标在多行 prompt 中的位置无关。主编辑器聚焦时,显式的历史绑定优先于应用动作,例如把 `tui.editor.historyPrevious` 绑到 `ctrl+p` 会在该上下文中覆盖模型轮换,但不影响选择器中的 `Ctrl+P`。

### TUI 编辑器删除

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `tui.editor.deleteCharBackward` | `backspace` | 向后删除字符 |
| `tui.editor.deleteCharForward` | `delete`、`ctrl+d` | 向前删除字符 |
| `tui.editor.deleteWordBackward` | `ctrl+w`、`alt+backspace` | 向后删除一个词 |
| `tui.editor.deleteWordForward` | `alt+d`、`alt+delete` | 向前删除一个词 |
| `tui.editor.deleteToLineStart` | `ctrl+u` | 删除到行首 |
| `tui.editor.deleteToLineEnd` | `ctrl+k` | 删除到行尾 |

### TUI 输入

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `tui.input.newLine` | `shift+enter`、`ctrl+j` | 插入换行 |
| `tui.input.submit` | `enter` | 提交输入 |
| `tui.input.tab` | `tab` | Tab / 自动补全 |

### TUI Kill Ring

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `tui.editor.yank` | `ctrl+y` | 粘贴最近删除的文本 |
| `tui.editor.yankPop` | `alt+y` | yank 后在多次删除的文本间轮换 |
| `tui.editor.undo` | `ctrl+-`(Windows 上为 `ctrl+z`;WSL 上为 `alt+z`) | 撤销上一次编辑 |

### TUI 剪贴板与选择

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `tui.input.copy` | `ctrl+c` | 复制选中内容 |
| `tui.select.up` | `up` | 选择项上移 |
| `tui.select.down` | `down` | 选择项下移 |
| `tui.select.pageUp` | `pageUp` | 列表向上翻页 |
| `tui.select.pageDown` | `pageDown` | 列表向下翻页 |
| `tui.select.confirm` | `enter` | 确认选择 |
| `tui.select.cancel` | `escape`、`ctrl+c` | 取消选择 |

### TUI 全屏视口

这些动作在交互模式使用 `--tui-mode fullscreen` 时生效,作用于主会话记录滚动区域。双指触控板和鼠标滚轮滚动指针所在区域,在固定编辑器/状态栏/底部停靠区上方时回退为滚动会话记录。点击 OSC 8 超链接会用默认处理程序打开。按住主鼠标键拖动可选中文字并复制到剪贴板;在会话记录顶部或底部边缘按住不动会自动滚入屏幕外内容。当会话记录向上滚动后,其底部行会出现可点击的 "Jump to latest message" 标签,显示 `tui.altScreen.bottom` 快捷键。终端特定的鼠标/触控板行为见 [Terminal setup](terminal-setup.md)。

全屏会话记录绑定优先于编辑器绑定。因此默认的无修饰键导航键在全屏模式下控制会话记录,而它们的 `ctrl` 变体继续控制编辑器。非全屏模式下,两组按键都控制编辑器。

会话记录搜索面板会显示已配置的上一个/下一个快捷键及可点击的箭头控件。再按一次 `tui.altScreen.search`,或使用 `tui.altScreen.searchClose`,即可关闭。

| 按键 | 默认模式 | 全屏模式 |
|------|----------|----------|
| `home`、`end` | 编辑器 | 会话记录 |
| `ctrl+home`、`ctrl+end` | 编辑器 | 编辑器 |
| `pageUp`、`pageDown` | 编辑器 | 会话记录 |
| `ctrl+pageUp`、`ctrl+pageDown` | 编辑器 | 编辑器 |

该路由仍可通过普通动作绑定自定义。例如 `"tui.altScreen.pageUp": "ctrl+pageUp"` 会让 `pageUp` 在全屏模式下控制编辑器、`ctrl+pageUp` 控制会话记录。绑定 `tui.altScreen.halfPageUp` 和 `tui.altScreen.halfPageDown` 可按半页滚动,绑定 `tui.altScreen.lineUp` 和 `tui.altScreen.lineDown` 可按单行滚动。设置 `"tui.altScreen.pageUp": []` 会完全禁用该会话记录快捷键。用户绑定会替换该动作的默认值。

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `tui.altScreen.pageUp` | `pageUp` | 会话记录向上翻一页 |
| `tui.altScreen.pageDown` | `pageDown` | 会话记录向下翻一页 |
| `tui.altScreen.halfPageUp` | *(无)* | 会话记录向上翻半页 |
| `tui.altScreen.halfPageDown` | *(无)* | 会话记录向下翻半页 |
| `tui.altScreen.lineUp` | *(无)* | 会话记录向上滚一行 |
| `tui.altScreen.lineDown` | *(无)* | 会话记录向下滚一行 |
| `tui.altScreen.previousPrompt` | `ctrl+shift+up`、`ctrl+up`(Windows 和 WSL 上仅 `ctrl+up`) | 跳到上一个标记消息 |
| `tui.altScreen.nextPrompt` | `ctrl+shift+down`、`ctrl+down`(Windows 和 WSL 上仅 `ctrl+down`) | 跳到下一个标记消息 |
| `tui.altScreen.search` | `ctrl+shift+f`(Windows 和 WSL 上为 `ctrl+f`) | 搜索渲染后的会话记录 |
| `tui.altScreen.searchNext` | `enter`、`ctrl+g` | 搜索时选中下一个匹配 |
| `tui.altScreen.searchPrevious` | `shift+enter`、`ctrl+shift+g` | 搜索时选中上一个匹配 |
| `tui.altScreen.searchClose` | `escape` | 关闭会话记录搜索 |
| `tui.altScreen.top` | `home` | 滚到会话记录开头 |
| `tui.altScreen.bottom` | `end` | 滚到会话记录末尾并跟随新输出 |

### 应用

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `app.interrupt` | `escape` | 取消 / 中止 |
| `app.clear` | `ctrl+c` | 清空编辑器(第一次)/ 退出(第二次) |
| `app.exit` | `ctrl+d` | 退出(编辑器为空时) |
| `app.suspend` | `ctrl+z`(Windows 上无) | 挂起到后台 |
| `app.editor.external` | `ctrl+g` | 在外部编辑器中打开(`externalEditor`、`$VISUAL`、`$EDITOR`,Windows 上为 Notepad,其他平台为 `nano`) |
| `app.clipboard.pasteImage` | `ctrl+v`(Windows 和 WSL 上为 `alt+v`) | 从剪贴板粘贴图片或文本 |

### 会话

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `app.session.new` | *(无)* | 开始新会话(`/new`) |
| `app.session.tree` | *(无)* | 打开会话树导航器(`/tree`) |
| `app.session.fork` | *(无)* | 分叉当前会话(`/fork`) |
| `app.session.resume` | *(无)* | 打开会话恢复选择器(`/resume`) |
| `app.session.togglePath` | `ctrl+p` | 切换路径显示 |
| `app.session.toggleSort` | `ctrl+s` | 切换排序模式 |
| `app.session.toggleNamedFilter` | `ctrl+n` | 切换仅显示命名会话的过滤器 |
| `app.session.rename` | `ctrl+r` | 重命名会话 |
| `app.session.delete` | `ctrl+d` | 删除会话 |
| `app.session.deleteNoninvasive` | `ctrl+backspace` | 查询为空时删除会话 |

### 模型与思考

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `app.model.select` | `ctrl+l` | 打开模型选择器 |
| `app.model.cycleForward` | `ctrl+p` | 轮换到下一个模型 |
| `app.model.cycleBackward` | `shift+ctrl+p`(Windows 和 WSL 上为 `alt+p`) | 轮换到上一个模型 |
| `app.models.save` | `ctrl+s` | 将选中的默认模型或作用域模型配置保存到设置 |
| `app.thinking.cycle` | `shift+tab` | 轮换思考等级 |
| `app.thinking.save` | `ctrl+s` | 将当前思考等级保存到设置 |
| `app.thinking.toggle` | `ctrl+t` | 折叠或展开思考块 |

### 显示与消息队列

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `app.tools.expand` | `ctrl+o` | 折叠或展开工具输出 |
| `app.message.copy` | `ctrl+x` | 复制 `/tree` 中选中的消息;否则复制最后一条助手消息,或在 `fullscreenCopyOnSelect` 关闭时复制当前全屏文本选区 |
| `app.message.followUp` | `alt+enter`(Windows 和 WSL 上为 `ctrl+q`) | 排队 follow-up 消息 |
| `app.message.dequeue` | `alt+up`(Windows 和 WSL 上为 `alt+q`) | 把排队的消息恢复到编辑器 |

### 树导航

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `app.tree.foldOrUp` | `ctrl+left`、`alt+left` | 折叠当前分支段,或跳到上一段起点 |
| `app.tree.unfoldOrDown` | `ctrl+right`、`alt+right` | 展开当前分支段,或跳到下一段起点或分支末尾 |
| `app.tree.editLabel` | `shift+l` | 编辑选中树节点上的标签 |
| `app.tree.toggleLabelTimestamp` | `shift+t` | 切换树中标签时间戳显示 |
| `app.tree.filter.default` | `ctrl+d` | 将树过滤器设为默认视图 |
| `app.tree.filter.noTools` | `ctrl+t` | 切换隐藏工具结果的树过滤器 |
| `app.tree.filter.userOnly` | `ctrl+u` | 切换仅显示用户消息的树过滤器 |
| `app.tree.filter.labeledOnly` | `ctrl+l` | 切换仅显示带标签条目的树过滤器 |
| `app.tree.filter.all` | `ctrl+a` | 切换显示全部条目的树过滤器 |
| `app.tree.filter.cycleForward` | `ctrl+o` | 树过滤器向前轮换 |
| `app.tree.filter.cycleBackward` | `shift+ctrl+o` | 树过滤器向后轮换 |

### 作用域模型选择器

在作用域模型选择器(通过 `/scoped-models` 打开)内使用。

| 快捷键 id | 默认值 | 说明 |
|--------|---------|------|
| `app.models.enableAll` | `ctrl+a` | 启用全部模型(或当前搜索匹配的全部模型) |
| `app.models.clearAll` | `ctrl+x` | 清空全部模型(或当前搜索匹配的全部模型) |
| `app.models.toggleProvider` | `ctrl+p` | 切换当前 provider 的全部模型 |
| `app.models.reorderUp` | `alt+up` | 在轮换顺序中上移选中模型 |
| `app.models.reorderDown` | `alt+down` | 在轮换顺序中下移选中模型 |

## 自定义配置

创建 `~/.pi/agent/keybindings.json`:

```json
{
  "tui.editor.historyPrevious": "ctrl+p",
  "tui.editor.historyNext": "ctrl+n",
  "tui.editor.deleteWordBackward": ["ctrl+w", "alt+backspace"]
}
```

每个动作可绑定单个按键或按键数组。用户配置覆盖默认值。

在原生 Windows 上,`app.suspend` 没有默认绑定,因为 Windows 终端不支持 Unix 作业控制。如果手动绑定它,pi 会显示一条状态消息而不是挂起。在 WSL 中,正常的 Linux `ctrl+z`/`fg` 行为仍然适用。

### Emacs 示例

```json
{
  "tui.editor.historyPrevious": "ctrl+p",
  "tui.editor.historyNext": "ctrl+n",
  "tui.editor.cursorLeft": ["left", "ctrl+b"],
  "tui.editor.cursorRight": ["right", "ctrl+f"],
  "tui.editor.cursorWordLeft": ["alt+left", "alt+b"],
  "tui.editor.cursorWordRight": ["alt+right", "alt+f"],
  "tui.editor.deleteCharForward": ["delete", "ctrl+d"],
  "tui.editor.deleteCharBackward": ["backspace", "ctrl+h"],
  "tui.input.newLine": ["shift+enter", "ctrl+j"]
}
```

### Vim 示例

```json
{
  "tui.editor.cursorUp": ["up", "alt+k"],
  "tui.editor.cursorDown": ["down", "alt+j"],
  "tui.editor.cursorLeft": ["left", "alt+h"],
  "tui.editor.cursorRight": ["right", "alt+l"],
  "tui.editor.cursorWordLeft": ["alt+left", "alt+b"],
  "tui.editor.cursorWordRight": ["alt+right", "alt+w"]
}
```
