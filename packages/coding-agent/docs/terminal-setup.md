> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# 终端配置

Pi 使用 [Kitty 键盘协议](https://sw.kovidgoyal.net/kitty/keyboard-protocol/) 来可靠地检测修饰键。大多数现代终端都支持该协议,但部分终端需要额外配置。

## 能力覆盖

Pi 会自动检测 OSC 8 超链接、内联图片协议和真彩。当检测在终端代理或复用器之后失效时,可使用以下高级覆盖项:

| 能力 | 环境变量 | JSON 设置 |
|------------|----------------------|--------------|
| OSC 8 超链接 | `PI_HYPERLINKS=1\|0\|auto` | `terminal.hyperlinks: true\|false\|"auto"` |
| 内联图片 | `PI_IMAGE_PROTOCOL=kitty\|iterm2\|none\|auto` | `terminal.images: "kitty"\|"iterm2"\|false\|"auto"` |
| 真彩 | `PI_TRUE_COLOR=1\|0\|auto` | `terminal.trueColor: true\|false\|"auto"` |

设置优先于环境变量;未设置或 `auto` 则保留自动检测。只应强制声明整条终端链路都支持的能力,否则不支持的转义序列可能破坏渲染。

## Kitty

开箱即用。

## iTerm2

### 常规 TUI 模式

开箱即用。

### 全屏 TUI 模式

全屏下视口由 pi 接管,iTerm2 会发送滚轮报告而不是滚动原生回滚缓冲。在 iTerm2 默认的触控板加速行为下,这些报告可能丢失大部分加速滚轮增量,导致全屏滚动远慢于常规滚动。

如果全屏模式下快速滚轮手势每次只移动约一行:

1. 打开 **iTerm2 → Settings → Advanced**。
2. 搜索 **Trackpad scrolls fast?**,设为 **No**。

这是针对整个 iTerm2 的变通方案,可能同时改变原生触控板滚动行为。底层问题见 [iTerm2 issue 9619](https://gitlab.com/gnachman/iterm2/-/work_items/9619)。

## Apple Terminal

在可用时 pi 会启用增强按键上报。如果 Terminal.app 仍对 `Shift+Enter` 发送普通 Return,pi 会使用本地 macOS 修饰键回退,把该 Return 视为 `Shift+Enter`。

该回退只在 pi 与 Terminal.app 运行于同一台 Mac 时有效。通过远程 SSH 无法检测本地键盘。

## Ghostty

在 Ghostty 配置(macOS 为 `~/Library/Application Support/com.mitchellh.ghostty/config`,Linux 为 `~/.config/ghostty/config`)中添加:

```
keybind = alt+backspace=text:\x1b\x7f
```

旧版 Claude Code 可能添加过这样一条 Ghostty 映射:

```
keybind = shift+enter=text:\n
```

该映射发送原始换行字节。在 pi 内部,这与 `Ctrl+J` 无法区分,因此 tmux 和 pi 都不再能看到真正的 `shift+enter` 按键事件。

如果你添加该映射只是为了 Claude Code 2.x 或更新版本,可以移除它——除非你想在 tmux 里用 Claude Code,那它仍然需要该 Ghostty 映射。

pi 默认将 `Ctrl+J` 绑定为换行别名,所以在 tmux 中 `Shift+Enter` 通过该重映射继续可用,无需额外的 pi 配置。

### 全屏 TUI 模式

全屏模式下链接仍可点击,但在 pi 捕获鼠标输入期间,Ghostty 不显示悬停下划线和左下角 URL 预览。在 macOS 按住 `Shift+Command`、Linux 按住 `Shift+Ctrl`,即可使用 Ghostty 的原生链接处理。

## WezTerm

WezTerm 通常通过 xterm modifyOtherKeys 开箱支持 `Shift+Enter`。若要显式启用 Kitty 键盘协议,创建 `~/.wezterm.lua`:

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.enable_kitty_keyboard = true
return config
```

在 macOS 上,WezTerm 默认把 `Option+Enter` 绑定为全屏。若想把 `Option+Enter` 用于 pi 的跟进队列,添加这个按键覆盖:

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.keys = {
  {
    key = 'Enter',
    mods = 'ALT',
    action = wezterm.action.SendString('\x1b[13;3u'),
  },
}
return config
```

如果已有 `config.keys` 表,把该条目加进去即可。

在 WSL 上,WezTerm 可能需要可见的硬件光标才能正确定位输入法候选窗口。如果中日韩输入法候选框不跟随文本光标,运行 pi 前设置 `PI_HARDWARE_CURSOR=1`,或在设置中把 `showHardwareCursor` 设为 `true`。

## Alacritty

Alacritty 通常开箱支持 `Shift+Enter`。在 macOS 上,`Option+Enter` 可能以普通 `Enter` 到达。若想把 `Option+Enter` 用于 pi 的跟进队列,在 `~/.config/alacritty/alacritty.toml` 中添加:

```toml
[[keyboard.bindings]]
key = "Enter"
mods = "Alt"
chars = "\u001b[13;3u"
```

修改配置后重启 Alacritty。

## VS Code(集成终端)

VS Code 1.109.5 及更新版本默认在集成终端中启用 Kitty 键盘协议,`Shift+Enter` 应开箱即用。

低于 1.109.5 的 VS Code 版本需要为 `Shift+Enter` 显式配置终端按键绑定。

`keybindings.json` 位置:
- macOS:`~/.config/Code/User/keybindings.json`(原文为 `~/Library/Application Support/Code/User/keybindings.json`)
- Linux:`~/.config/Code/User/keybindings.json`
- Windows:`%APPDATA%\\Code\\User\\keybindings.json`

在 `keybindings.json` 中添加:

```json
{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\u001b[13;2u" },
  "when": "terminalFocus"
}
```

## Zed(集成终端)

在 Zed 的 `keymap.json` 中添加这些按键绑定:

```json
{
  "context": "Terminal",
  "bindings": {
    "shift-enter": ["terminal::SendText", "\u001b[13;2u"],
    "ctrl--": ["terminal::SendText", "\u001b[45;5u"],
    "ctrl-alt-]": ["terminal::SendText", "\u001b[93;7u"]
  }
}
```

## Windows Terminal

在 Windows 原生或 WSL 中运行时,pi 使用 Windows 风格按键绑定:

- `Alt+V` 粘贴图片或剪贴板文本。
- `Ctrl+F` 在全屏模式搜索记录,`Ctrl+Up`/`Ctrl+Down` 在标记消息间跳转。
- `Alt+P` 循环切换到上一个模型。
- `Ctrl+Z` 在原生 Windows 上撤销编辑;WSL 使用 `Alt+Z`,以便 `Ctrl+Z` 可以挂起 pi。
- `Ctrl+Q` 排队一条跟进消息,`Alt+Q` 恢复排队消息。

在 `settings.json`(Ctrl+Shift+,或 Settings → Open JSON file)中添加,以转发 `Shift+Enter` 用于插入新行:

```json
{
  "actions": [
    {
      "command": { "action": "sendInput", "input": "\u001b[13;2u" },
      "keys": "shift+enter"
    }
  ]
}
```

Windows Terminal 默认把 `Alt+Enter` 绑定为全屏。若想用它替代 pi 默认的 `Ctrl+Q` 来排队跟进消息,需配置 Windows Terminal 发送该按键,并在 pi 中把 `app.message.followUp` 绑定为 `alt+enter`。

如果已有 `actions` 数组,把该对象加进去即可。修改设置后请完全关闭并重新打开 Windows Terminal。

## xfce4-terminal、terminator

这些终端对转义序列支持有限。`Ctrl+Enter`、`Shift+Enter` 等带修饰的 Enter 无法与普通 `Enter` 区分,导致 `submit: ["ctrl+enter"]` 之类的自定义按键绑定无法生效。

为获得最佳体验,请使用支持 Kitty 键盘协议的终端:
- [Kitty](https://sw.kovidgoyal.net/kitty/)
- [Ghostty](https://ghostty.org/)
- [WezTerm](https://wezfurlong.org/wezterm/)
- [iTerm2](https://iterm2.com/)
- [Alacritty](https://github.com/alacritty/alacritty)(需编译时启用 Kitty 协议支持)

## IntelliJ IDEA(集成终端)

内置终端对转义序列支持有限。IntelliJ 的终端中 Shift+Enter 无法与 Enter 区分。

如果想让硬件光标可见,运行 pi 前设置 `PI_HARDWARE_CURSOR=1`(出于兼容性默认关闭)。

建议使用专用终端模拟器以获得最佳体验。
