<div align="center">

# pi 中文翻译版

**[中文版] pi — AI 智能体工具集:统一多厂商 LLM API、智能体循环、终端 UI 与编程智能体 CLI**

[![原项目](https://img.shields.io/badge/原项目-earendil--works--pi-blue?style=flat-square&logo=github)](https://github.com/earendil-works/pi)
[![中文文档](https://img.shields.io/badge/中文文档-README.zh--CN.md-orange?style=flat-square)](README.zh-CN.md)
[![GitHub Stars](https://img.shields.io/github/stars/earendil-works/pi?style=flat-square&label=原项目Stars)](https://github.com/earendil-works/pi/stargazers)
[![微信联系](https://img.shields.io/badge/微信-uaycar-brightgreen?style=flat-square&logo=wechat)](#)

</div>

---

> 这是 [earendil-works/pi](https://github.com/earendil-works/pi) 的中文翻译版本。
> 完整源代码请访问原项目:https://github.com/earendil-works/pi

**代部署 / 定制服务 / 技术咨询 请添加微信:uaycar**

---

## 📖 项目简介

pi 是 earendil-works 出品的开源 AI 智能体框架(Agent Harness),核心产品是一个可自我扩展的交互式编程智能体 CLI。它把统一的多厂商 LLM API(OpenAI、Anthropic、Google 等)、带工具调用与状态管理的智能体运行时、以及支持差分渲染的终端 UI 库整合成一整套工具链,让你用同一套接口构建和运行自己的 AI 智能体。

## ✨ 主要特性

- **统一 LLM API**:一套接口对接 OpenAI、Anthropic、Google 等多家模型厂商
- **智能体运行时**:内置工具调用(tool calling)与状态管理,支撑完整的 agent loop
- **编程智能体 CLI**:开箱即用的交互式终端编程助手,可自我扩展
- **终端 UI 库**:基于差分渲染的高性能 TUI,界面流畅不闪烁
- **多包模块化架构**:chord 应用组合运行时、telemetry 遥测契约等可独立复用
- **权限边界方案**:提供 Gondolin micro-VM、Docker、OpenShell 三种容器化/沙箱模式
- **供应链加固**:依赖精确锁定、shrinkwrap 固定传递依赖、发布冒烟测试齐全
- **开放生态**:支持会话分享、Slack/聊天自动化(pi-chat)等周边项目

## 📁 文件说明

| 文件 | 说明 |
|:-----|:-----|
| README.md | 本文件(中文简介) |
| README.zh-CN.md | 详细中文文档(完整汉化) |

## 🚀 快速开始

1. 全局安装编程智能体 CLI:

```bash
npm install -g @earendil-works/pi-coding-agent
```

2. 在终端启动 `pi`,按首次运行提示配置模型厂商的 API key:

```bash
pi
```

3. 或从源码构建运行(依赖 Node.js / npm):

```bash
npm install --ignore-scripts  # 安装全部依赖,不执行生命周期脚本
npm run build                 # 刷新模型数据,然后构建所有包
npm run check                 # Lint、格式化与类型检查
./test.sh                     # 运行测试(无 API key 时跳过依赖 LLM 的测试)
./pi-test.sh                  # 从源码运行 pi(可在任意目录执行)
```

4. 更多用法请阅读 [pi.dev 官方文档](https://pi.dev/docs/latest)。

完整源代码与最新版本请访问原项目:https://github.com/earendil-works/pi

## 📞 联系方式

**代部署 / 定制服务 / 技术咨询 请添加微信:uaycar**

---

本项目为 [earendil-works/pi](https://github.com/earendil-works/pi) 的中文翻译版本,所有代码版权归原项目作者所有,遵循其原始许可证。

**如果觉得有用,请给原项目点个 Star!** ⭐
