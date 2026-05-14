---
layout: post
title: "如何将claude code生成的项目变成trae ide里的mcp工具并通过对话调用"
date: 2026-05-14
categories: [大模型]
tags: [claude code, trae ide, mcp]
author: wuys
---

### 一、引言

上一篇已经实践过在trae中使用claude code来实现自己需要的功能，但是程序每次都需要运行。现在来试一下把这些功能封装成mcp协议然后直接在trae ide的mcp工厂里手动添加，以后只需要在trae ide的对话框里输入自然语言，就能自动调用对应的工具了。

### 二、具体内容

#### （一）封装mcp工具

1.直接在claude code对话框里输入“请帮我把你现在做出来的这个程序封装成mcp的工具然后加到trae  ide的mcp工厂里面”

![ffd9e9a8-9dce-4622-bb79-84d2394a8bc7](images/ffd9e9a8-9dce-4622-bb79-84d2394a8bc7.png)

![76df11d3-4b29-44be-a908-3e1d2bf73cdd](images/76df11d3-4b29-44be-a908-3e1d2bf73cdd.png)

#### （二）在trae ide的MCP工厂里添加工具

1.先按win+R打开cmd命令框，然后输入上面的指令安装mcp:

```bash
pip install mcp
```

![7d28a4cb-d5d9-44f6-b04c-39d474108e7f](images/7d28a4cb-d5d9-44f6-b04c-39d474108e7f.png)

![0f6a91b2-0423-40c5-b16f-cf5bc4d37e41](images/0f6a91b2-0423-40c5-b16f-cf5bc4d37e41.png)

2.安装完成后，打开右上角的设置按钮，点击MCP页签，点击手动配置：

![b599cd14-ab84-4104-96c3-59c32d369784](images/b599cd14-ab84-4104-96c3-59c32d369784.png)

![91f43ddb-cff8-4f0a-9533-b8ca84a75a93](images/91f43ddb-cff8-4f0a-9533-b8ca84a75a93.png)

3.将claude code生成的mcp.json复制出来，粘贴到手动配置页面，然后点击确认，刷新按钮后出现对号就表明工具加好了，我加的是每次自动推送博客文章的工具。

![448bcb6b-a475-493e-acc8-fdb7bbbcaee3](images/448bcb6b-a475-493e-acc8-fdb7bbbcaee3.png)

![0e0a5b0f-5bf7-445a-8187-6bc91063b6b5](images/0e0a5b0f-5bf7-445a-8187-6bc91063b6b5.png)

![6264ebd7-9f32-4998-9413-5647b6cc25c7](images/6264ebd7-9f32-4998-9413-5647b6cc25c7.png)

#### （三）在trae ide的对话框里直接输入指令调用工具

在对话框里直接输入“更新博客”，可以看到我的博客已经自动更新到网站上了。

![8f8dc054-8083-4227-b6a7-be07fc7fe320](images/8f8dc054-8083-4227-b6a7-be07fc7fe320.png)

### 三、总结

Claude Code 和trae真的越用越惊喜，确实可以极大提高自己的效率，后面再继续探索。

* * *

**作者**：吴银双

**日期**：2026年5月14日

**平台**：GitHub Pages / 技术博客
