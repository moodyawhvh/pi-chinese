> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。
>
> ℹ️ 原文超过 10000 字符,本文仅翻译核心章节,完整细节请参阅英文原版。

# 使用 Pi

本页收录日常使用细节,这些内容放不下快速上手页。

## 交互模式

<p align="center"><img src="images/interactive-mode.png" alt="交互模式" width="600"></p>

界面分为四个主要区域:

- **启动头部** - 快捷键、已加载的上下文文件、提示模板、技能和扩展
- **消息区** - 用户消息、助手回复、工具调用、工具结果、通知、错误和扩展 UI
- **编辑器** - 你的输入区;边框颜色表示当前思考等级
- **页脚** - 工作目录、会话名称、token/缓存用量、费用、上下文用量和当前模型。统计包含助手回复、工具上报的用量以及摘要生成。

编辑器可以被内置 UI(如 `/settings`)或自定义扩展 UI 临时替换。

### 编辑器功能

| 功能 | 操作 |
|---------|-----|
| 文件引用 | 输入 `@` 模糊搜索项目文件 |
| 路径补全 | 按 Tab 补全路径 |
| 多行输入 | Shift+Enter,Windows Terminal 上为 Ctrl+Enter |
| 复制回复 | Ctrl+X 在 `/tree` 中复制选中消息;否则复制最后一条助手消息,或在 `fullscreenCopyOnSelect` 关闭时复制当前全屏文本选区 |
| 图片 | Ctrl+V 粘贴,Windows 上为 Alt+V,或直接拖入终端 |
| Shell 命令 | `!命令` 执行并把输出发给模型 |
| 隐藏输出的 Shell 命令 | `!!命令` 执行但不把输出发给模型 |
| 外部编辑器 | Ctrl+G 打开 `externalEditor`、`$VISUAL`、`$EDITOR`、Windows 上的记事本或其他平台的 `nano` |

所有快捷键与自定义见[快捷键](keybindings.md)。

## 斜杠命令

在编辑器中输入 `/` 打开命令补全。扩展可注册自定义命令,技能以 `/技能名:名字` 形式提供,提示模板通过 `/模板名` 展开。

| 命令 | 说明 |
|---------|-------------|
| `/login`, `/logout` | 管理 OAuth 或 API-key 凭据 |
| [`/llama`](llama-cpp.md) | 下载、加载和卸载 llama.cpp 路由模型 |
| `/model` | 切换模型;选择器中按 Ctrl+S 保存为启动默认 |
| `/thinking` | 切换思考等级;选择器中按 Ctrl+S 保存为启动默认 |
| `/scoped-models` | 启用/禁用参与 Ctrl+P 循环的模型 |
| `/settings` | 主题、消息投递、传输方式等偏好 |
| `/resume` | 从历史会话中选择 |
| `/new` | 开始新会话 |
| `/name <名称>` | 设置会话显示名称 |
| `/session` | 显示会话文件、ID、消息数、token 和费用 |
| `/tree` | 跳转到会话中任意节点并从那里继续 |
| `/trust` | 保存项目信任决定供后续会话使用 |
| `/fork` | 从之前的用户消息创建新会话 |
| `/clone` | 把当前活跃分支复制为新会话 |
| `/compact [提示]` | 手动压缩上下文,可附带自定义指令 |
| `/copy` | 复制最后一条助手消息到剪贴板 |
| `/export [文件]` | 把会话导出为 HTML 或 JSONL |
| `/import <文件>` | 从 JSONL 文件导入并恢复会话 |
| `/share` | 上传为私有 GitHub gist 并附带可分享的 HTML 链接 |
| `/reload` | 重新加载快捷键、扩展、技能、提示、主题和上下文文件 |
| `/hotkeys` | 显示所有快捷键 |
| `/changelog` | 显示版本历史 |
| `/quit` | 退出 pi |

## 消息队列

agent 还在工作时你也可以继续提交消息:

- **Enter** 排队一条引导(steering)消息,在当前助手轮次执行完工具调用后投递。
- **Alt+Enter** 排队一条跟进(follow-up)消息,在 agent 完成全部工作后投递。
- **Escape** 中止并把队列中的消息放回编辑器。
- **Alt+Up** 把排队中的消息取回编辑器。

在 Windows Terminal 上,Alt+Enter 默认是全屏。按[终端配置](terminal-setup.md)的说明重映射后,pi 才能收到该快捷键。

投递行为在[设置](settings.md)中通过 `steeringMode` 和 `followUpMode` 配置。

## 会话

会话自动保存到 `~/.pi/agent/sessions/`,按工作目录组织。

```bash
pi -c                  # 继续最近一次会话
pi -r                  # 浏览并选择会话
pi --no-session        # 临时模式;不保存
pi --name "我的任务"    # 启动时设置会话显示名称
pi --session <路径|id>  # 使用指定会话文件或会话 ID
pi --fork <路径|id>    # 把会话分叉到新会话文件
```

常用会话命令:

- `/session` 显示当前会话文件和 ID。
- `/tree` 导航文件内的会话树,并可摘要被放弃的分支。
- `/fork` 从更早的用户消息创建新会话。
- `/clone` 把当前活跃分支复制为新会话文件。
- `/compact` 摘要较旧的消息以释放上下文。

详情见[会话](sessions.md)与[压缩](compaction.md)。

## 上下文文件

Pi 在启动时从以下位置加载 `AGENTS.md` 或 `CLAUDE.md`:

- `~/.pi/agent/AGENTS.md` 作为全局指令
- 父目录,从当前工作目录向上遍历
- 当前目录

如果某目录含有 `AGENTS.override.md`,pi 会加载它,而不是该目录的 `AGENTS.md` 或 `CLAUDE.md`。其他目录的上下文文件仍正常叠加。

上下文文件用于记录项目约定、命令、安全规则和偏好。使用 `--no-context-files` 或 `-nc` 禁用加载。

### 系统提示文件

替换默认系统提示:

- 项目级:`.pi/SYSTEM.md`
- 全局:`~/.pi/agent/SYSTEM.md`

在任一位置使用 `APPEND_SYSTEM.md` 则是追加而非替换默认提示。

### 项目信任

交互式启动时,如果项目文件夹含有项目本地设置、资源或项目 `.agents/skills`,且该文件夹及父文件夹在 `~/.pi/agent/trust.json` 中没有已保存决定,pi 会先询问是否信任。信任项目后,pi 才会加载 `.pi/settings.json` 和 `.pi` 资源、安装缺失的项目包并执行项目扩展。

在信任决定之前,pi 只加载上下文文件、用户/全局扩展和 CLI `-e` 扩展,以便它们处理 `project_trust` 事件。项目本地扩展、项目包管理的扩展和项目设置只在项目被信任后加载。当从不同 cwd 切换到信任未在当前进程解析的会话时,同样适用这一拆分。

非交互模式(`-p`、`--mode json` 和 `--mode rpc`)不显示信任提示。在没有适用的已保存决定时,它们使用全局设置的 `defaultProjectTrust`:`ask`(默认)和 `never` 忽略这些项目资源,`always` 则信任。传 `--approve`/`-a` 或 `--no-approve`/`-na` 可为单次运行覆盖项目信任。

若没有扩展或已保存决定适用,`defaultProjectTrust` 决定回退行为。可在 `~/.pi/agent/settings.json` 中设为 `"ask"`、`"always"` 或 `"never"`,或通过 `/settings` 修改。

`pi config` 和包命令使用相同的项目信任流程,但 `pi update` 从不提示。传 `--approve` 表示单条命令信任项目本地设置,传 `--no-approve` 表示忽略。

交互模式中用 `/trust` 保存项目信任决定供后续会话使用,包括对直接父文件夹的信任。它只写入 `~/.pi/agent/trust.json`;当前会话不会重载,需重启 pi 生效。

## 设计原则

Pi 保持核心小巧,把工作流相关的行为推给扩展、技能、提示模板和包。

它有意不内置 MCP、子 agent、权限弹窗、计划模式、待办列表或后台 bash。你可以把这些工作流构建为扩展或包来安装,或使用容器、tmux 等外部工具。

完整的理念阐述见[博客文章](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)。
