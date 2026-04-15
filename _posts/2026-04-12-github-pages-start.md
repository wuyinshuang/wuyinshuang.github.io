---
layout: post
title: "测试"
date: 2026-04-13
categories: [博客搭建]
tags: [Jekyll, GitHub Pages, 博客]
author: wuys
---

# 如何使用Github Pages搭建个人主页

## 一、引言

#### 相信很多技术人员会搭建自己的个人主页网站，有一些可能是买的阿里云服务器，最近发现Github Pages可以免费搭建静态网站，小伙伴们快来跟我一起试试吧！

## 二、搭建步骤

### 1、创建新的Github Repository

1.1 进入[Github官网](https://github.com/),点击sign in登录自己的账号（如果没有账号先注册一个）。

1.2 点击create a new repository，创建新的仓库，假设仓库名为page。

![](images/1.png)

![](images/2.png)

### 2、克隆新仓库到本地

2.1 回到github个人首页，找到刚刚创建的新仓库地址并复制。

![](images/3.png)

2.2 打开本地cmd运行框，进入到管理该网站的目录下，并执行以下命令：

```bash
# 进入本地管理目录
cd D:\github_page
# 克隆新仓库
git clone https://github.com/wuyinshuang/page.git
```

![](images/4.png)

### 3、编写网站主页并提交推送到远程

3.1 在刚刚本地克隆后出现的page文件夹中新建一个index.html（这个文件应该是跟.git在同一目录级别），自己写个人主页内容：

```html
---
layout: default
title: 首页
permalink: /
---

<div class="home-content">
  <!-- 简单的自我介绍 -->
  <section class="intro">
    <h1>你好，我是吴银双</h1>
    <p class="subtitle">一名拥有5年Java开发经验的软件工程师，正在大模型开发转型中。</p>
    <p>这里是我的技术博客，记录学习心得、分享开发经验。</p>
  </section>
 </section>
</div>

```

![](images/5.png)

3.2 打开cmd运行框，进入仓库目录下，执行提交和推送命令，如果是第一次提交需要指定提交的邮箱和用户名。

```bash
# 进入仓库路径下
cd page
# 添加所有文件到git
git add .
# commit提交的内容到本地仓库
git commit -m "initial commit"
# 全局配置提交的邮箱和账号（非必要）
git config --global user.email "2115048761@qq.com"
git config --global user.name "wuyinshuang"
# push推送本次仓库的内容到服务器
git push
```

![](images/6.png)

![](images/7.png)

3.3 推送成功后会弹出一个窗口连接GitHub，选择使用浏览器登录

![](images/8.png)![](images/9.png)

### 4、发布搭建好的Github pages

4.1 回到刚才创建的Repository页面，点击"Settings”，在左边菜单“Code and automation” 下找到“Pages"，然后在Branch 选项中选择"main”，最后点击“Save”。

![](images/10.png)

4.2 等几分钟，刷新当前网页，页面顶部会显示发布后的地址，这个地址就是以后别人访问你的个人主页的网址，点击visit site就能看到你的个人主页了。

![](images/11.png)

### 5、后续更新个人网页内容

直接在本地page目录下更新网站内容后，运行cmd执行框，重复上面的add/commit/push命令即可：

```bash
# 进入仓库路径下
cd page
# 添加所有文件到git
git add .
# commit提交的内容到本地仓库
git commit -m "initial commit"
# push推送本次仓库的内容到服务器
git push
```

## 三、总结

总体而言，Github pages还是很方便的，今天只测试了搭建个人主页，后面有时间再看一下如何用Github pages发布博客。

---

**作者**：吴银双  
**日期**：2026年4月13日  
**平台**：GitHub Pages / 技术博客

