> 🌐 本文档由 [earendil-works/pi](https://github.com/earendil-works/pi) 翻译,英文原版见原项目。

# Shell 别名

pi 以非交互模式运行 bash(`bash -c`),默认不展开别名。

要启用你的 shell 别名,在 `~/.pi/agent/settings.json` 中添加:

```json
{
  "shellCommandPrefix": "shopt -s expand_aliases\neval \"$(grep '^alias ' ~/.zshrc)\""
}
```

把路径(`~/.zshrc`、`~/.bashrc` 等)调整为你自己的 shell 配置文件。
