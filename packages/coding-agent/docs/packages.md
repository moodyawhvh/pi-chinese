> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

> pi 可以帮你创建 pi 包。让它帮你打包你的扩展、技能、提示模板或主题。

# Pi 包

Pi 包把扩展、技能、提示模板和主题打包在一起,便于通过 npm 或 git 共享。包可以在 `package.json` 的 `pi` 键下声明资源,也可以使用约定目录。

## 目录

- [安装与管理](#安装与管理)
- [包来源](#包来源)
- [创建 Pi 包](#创建-pi-包)
- [包结构](#包结构)
- [依赖](#依赖)
- [包过滤](#包过滤)
- [启用与禁用资源](#启用与禁用资源)
- [作用域与去重](#作用域与去重)

## 安装与管理

> **安全:** pi 包以完整系统权限运行。扩展执行任意代码,技能可以指示模型执行任何操作,包括运行可执行文件。安装第三方包前请审阅源码。

```bash
pi install npm:@foo/bar@1.0.0
pi install git:github.com/user/repo@v1
pi install https://github.com/user/repo  # 裸 URL 也可以
pi install /absolute/path/to/package
pi install ./relative/path/to/package

pi remove npm:@foo/bar
pi list                     # 显示设置中已安装的包
pi update                   # 仅更新 pi
pi update --all             # 更新 pi、更新包并对齐固定 git ref
pi update --extensions      # 仅更新包并对齐固定 git ref
pi update --models          # 仅刷新模型目录
pi update --self            # 仅更新 pi
pi update --self --force    # 即使是最新版也重装 pi
pi update npm:@foo/bar      # 更新单个包
pi update --extension npm:@foo/bar
```

这些命令管理 pi 包,`pi update` 也可以更新 pi CLI 安装。对实验性的安装器托管安装,`pi update` 会把所检出的确切版本安装到一个由 lockfile 支持的暂存发布中,验证通过后才激活;更新失败时当前发布保持原样。托管安装不支持 `--force`;如需修复请重新运行安装器。卸载 pi 本体见[快速上手](quickstart.md#卸载)。

默认情况下,`install` 和 `remove` 写入用户设置(`~/.pi/agent/settings.json`)。用 `-l` 改为写入项目设置(`.pi/settings.json`)。项目设置可与团队共享,项目被信任后,pi 会在启动时自动安装缺失的包。

想试用包而不安装,用 `--extension` 或 `-e`。它把包装到临时目录,仅对当前运行生效:

```bash
pi -e npm:@foo/bar
pi -e git:github.com/user/repo
```

## 包来源

设置和 `pi install` 接受三种来源类型。

### npm

```
npm:@scope/pkg@1.2.3
npm:pkg
```

- 带版本的 spec 会被固定,包更新(`pi update --extensions`、`pi update --all`)会跳过它们。
- 用户安装位于 `~/.pi/agent/npm/`。
- 项目安装位于 `.pi/npm/`。
- 在 `settings.json` 中设置 `npmCommand`,可以把 npm 包查询和安装固定到特定包装命令,如 `mise` 或 `asdf`。

示例:

```json
{
  "npmCommand": ["mise", "exec", "node@20", "--", "npm"]
}
```

### git

```
git:github.com/user/repo@v1
git:git@github.com:user/repo@v1
https://github.com/user/repo@v1
ssh://git@github.com/user/repo@v1
```

- 不带 `git:` 前缀时,只接受协议 URL(`https://`、`http://`、`ssh://`、`git://`)。
- 带 `git:` 前缀时,接受简写格式,包括 `github.com/user/repo` 和 `git@github.com:user/repo`。
- HTTPS 和 SSH URL 均支持。
- SSH URL 自动使用你配置的 SSH 密钥(遵循 `~/.ssh/config`)。
- 非交互运行(如 CI)时,可设置 `GIT_TERMINAL_PROMPT=0` 禁用凭据提示,并设置 `GIT_SSH_COMMAND`(如 `ssh -o BatchMode=yes -o ConnectTimeout=5`)快速失败。
- ref 是固定的 tag 或 commit。`pi update --extensions` 和 `pi update --all` 不会把它们移到更新的 ref,但会把已有 clone 对齐到所配置的 ref。
- 用 `pi install git:host/user/repo@new-ref` 更新设置并把已有包移到新的固定 ref。
- clone 到 `~/.pi/agent/git/<host>/<path>`(全局)或 `.pi/git/<host>/<path>`(项目)。
- 对齐改变了 checkout 时,pi 会重置并清理 clone,然后若存在 `package.json` 则运行 `npm install`。

**SSH 示例:**
```bash
# git@host:path 简写(需要 git: 前缀)
pi install git:git@github.com:user/repo

# ssh:// 协议格式
pi install ssh://git@github.com/user/repo

# 带版本 ref
pi install git:git@github.com:user/repo@v1.0.0
```

### 本地路径

```
/absolute/path/to/package
./relative/path/to/package
```

本地路径指向磁盘上的文件或目录,添加到设置时不做复制。相对路径按其所在设置文件解析。路径是文件时作为单个扩展加载;是目录时,pi 按包规则加载资源。

## 创建 Pi 包

在 `package.json` 中加入 `pi` 清单,或使用约定目录。加上 `pi-package` 关键字以便被发现。

```json
{
  "name": "my-package",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

路径相对于包根。数组支持 glob 模式和 `!排除项`。清单中正向 glob 按字典序发现可见路径。点号开头的路径请直接列出。如果 glob 需要穿过符号链接继续匹配,请直接列出符号链接的资源根。

### 画廊元数据

[包画廊](https://pi.dev/packages)展示带 `pi-package` 标签的包。添加 `video` 或 `image` 字段可显示预览:

```json
{
  "name": "my-package",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "video": "https://example.com/demo.mp4",
    "image": "https://example.com/screenshot.png"
  }
}
```

- **video**:仅 MP4。桌面端悬停自动播放,点击打开全屏播放器。
- **image**:PNG、JPEG、GIF 或 WebP。作为静态预览展示。

两者都设置时,video 优先。

## 包结构

### 约定目录

没有 `pi` 清单时,pi 从以下目录自动发现资源:

- `extensions/` 加载 `.ts` 和 `.js` 文件
- `skills/` 递归查找 `SKILL.md` 文件夹,并把顶层 `.md` 文件作为技能加载
- `prompts/` 加载 `.md` 文件
- `themes/` 加载 `.json` 文件

## 依赖

第三方运行时依赖应放在 `package.json` 的 `dependencies` 中。不注册扩展、技能、提示模板或主题的依赖也放在 `dependencies`。pi 从 npm 或 git 安装包时会运行 `npm install`,所以这些依赖会自动装好。

Pi 为扩展和技能内置捆绑了核心包。如果你 import 了其中之一,请在 `peerDependencies` 中以 `"*"` 范围列出,并且不要捆绑它们:`@earendil-works/pi-ai`、`@earendil-works/pi-agent-core`、`@earendil-works/pi-coding-agent`、`@earendil-works/pi-tui`、`typebox`。

其他 pi 包必须捆绑进你的 tarball。把它们加入 `dependencies` 和 `bundledDependencies`,然后通过 `node_modules/` 路径引用其资源。pi 以独立模块根加载各个包,独立安装之间不会冲突,也不共享模块。

示例:

```json
{
  "dependencies": {
    "shitty-extensions": "^1.0.1"
  },
  "bundledDependencies": ["shitty-extensions"],
  "pi": {
    "extensions": ["extensions", "node_modules/shitty-extensions/extensions"],
    "skills": ["skills", "node_modules/shitty-extensions/skills"]
  }
}
```

## 包过滤

用设置中的对象形式过滤包加载的内容:

```json
{
  "packages": [
    "npm:simple-pkg",
    {
      "source": "npm:my-package",
      "extensions": ["extensions/*.ts", "!extensions/legacy.ts"],
      "skills": [],
      "prompts": ["prompts/review.md"],
      "themes": ["+themes/legacy.json"]
    }
  ]
}
```

`+path` 和 `-path` 是相对于包根的精确路径。

- 省略某个键表示加载该类型的全部。
- 用 `[]` 表示不加载该类型。
- `!pattern` 排除匹配项。
- `+path` 强制包含精确路径。
- `-path` 强制排除精确路径。
- 过滤器叠加在清单之上,只能在已允许的范围内收窄。

## 启用与禁用资源

使用 `pi config` 启用或禁用已安装包和本地目录中的扩展、技能、提示模板和主题。`pi config` 默认从全局设置(`~/.pi/agent/settings.json`)开始;按 Tab 在全局与项目本地模式间切换。用 `pi config -l` 从项目覆盖(`.pi/settings.json`)开始,继承的全局资源会以暗色显示。

## 作用域与去重

同一个包可以同时出现在全局和项目设置中。若两者都出现,项目条目优先;除非项目条目有 `autoload: false`,此时它会作为增量(delta)叠加在全局条目之上。同一性判定依据:

- npm:包名
- git:不含 ref 的仓库 URL
- 本地:解析后的绝对路径
