> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# tmux 设置

pi 可以在 tmux 内运行,但 tmux 默认会剥离某些按键的修饰键信息。不配置的话,`Shift+Enter` 和 `Ctrl+Enter` 通常与普通 `Enter` 无法区分。

## 推荐配置

添加到 `~/.tmux.conf`:

```tmux
set -g extended-keys on
set -g extended-keys-format csi-u
```

然后完全重启 tmux:

```bash
tmux kill-server
tmux
```

在 Kitty 键盘协议不可用时,pi 会自动请求扩展按键上报。使用 `extended-keys-format csi-u` 时,tmux 以 CSI-u 格式转发带修饰键的按键,这是最可靠的配置。`extended-keys-format` 选项需要 tmux 3.5 或更高版本。

## 为什么推荐 `csi-u`

只设置:

```tmux
set -g extended-keys on
```

时,tmux 默认使用 `extended-keys-format xterm`。当应用请求扩展按键上报时,带修饰键的按键会以 xterm `modifyOtherKeys` 格式转发,例如:

- `Ctrl+C` → `\x1b[27;5;99~`
- `Ctrl+D` → `\x1b[27;5;100~`
- `Ctrl+Enter` → `\x1b[27;5;13~`

使用 `extended-keys-format csi-u` 时,同样的按键转发为:

- `Ctrl+C` → `\x1b[99;5u`
- `Ctrl+D` → `\x1b[100;5u`
- `Ctrl+Enter` → `\x1b[13;5u`

pi 两种格式都支持,但 tmux 推荐使用 `csi-u`。

## 这能修复什么

没有 tmux 扩展按键时,带修饰键的 Enter 会塌缩成传统序列:

| 按键 | 无扩展按键 | 使用 `csi-u` |
|------|------------|--------------|
| Enter | `\r` | `\r` |
| Shift+Enter | `\r` | `\x1b[13;2u` |
| Ctrl+Enter | `\r` | `\x1b[13;5u` |
| Alt/Option+Enter | `\x1b\r` | `\x1b[13;3u` |

这会影响默认快捷键(`Enter` 提交、`Shift+Enter` 换行)以及任何使用带修饰键 Enter 的自定义快捷键。

## 要求

- `extended-keys-format csi-u` 需要 tmux 3.5 或更高版本(用 `tmux -V` 检查)
- 支持扩展按键的终端模拟器(Ghostty、Kitty、iTerm2、WezTerm、Windows Terminal)

tmux 3.2 至 3.4 时,不要设置 `extended-keys-format csi-u`;pi 仍然支持 tmux 默认的 xterm `modifyOtherKeys` 格式。
