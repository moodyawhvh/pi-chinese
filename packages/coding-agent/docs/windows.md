> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# Windows 设置

pi 在 Windows 上默认使用 Git Bash。按顺序检查以下位置:

1. `~/.pi/agent/settings.json` 中的自定义路径
2. Git Bash(`C:\Program Files\Git\bin\bash.exe`)
3. PATH 上的 `bash.exe`(Cygwin、MSYS2、WSL)

对多数用户来说,装 [Git for Windows](https://git-scm.com/download/win) 就够了。

## PowerShell 工具

可选的 `powershell` 工具在 `pwsh.exe` 可用时通过它执行命令,否则使用 Windows PowerShell。它以 `-NoProfile -NonInteractive -ExecutionPolicy Bypass` 启动 PowerShell。管理员强制执行的执行策略仍可能优先生效。

用 `defaultTools` 把面向模型的 `bash` 工具替换掉:

```json
{
  "defaultTools": ["read", "powershell", "edit", "write"]
}
```

或者在对比行为时同时启用两者:

```json
{
  "defaultTools": ["read", "bash", "powershell", "edit", "write"]
}
```

编辑器的 `!` 和 `!!` 命令仍然使用 Bash。

## 自定义 Bash 路径

```json
{
  "shellPath": "C:\\cygwin64\\bin\\bash.exe"
}
```
