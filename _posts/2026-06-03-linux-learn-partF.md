---
layout: post
title: "区分Docker仓库、镜像、容器核心概念"
date: 2026-06-03
categories: [运维]
tags: [Linux,Docker]
author: wuys
---

### 一、引言

上一篇已经在自己的阿里云服务器上安装好了docker，接下来区分一下docker的三个核心概念：仓库、镜像、容器。

### 二、具体内容

#### （一）docker镜像

```bash
Docker镜像-Docker images：容器运行的只读模板，包含运行应用程序所需的所有文件系统、代码、库和环境配置

特点：
分层存储：镜像由多层文件系统叠加组成，每一层是只读的
不可变：镜像一旦构建完成，不可修改（只能生成新镜像）

类似于java里面的类：
class User{
 private String userName;
 private int age;
}
```

#### （二） docker容器

```bash
Docker容器-Docker containers：
容器是镜像的运行实例，拥有独立的进程、文件系统和网络空间
容器包含了某个应用运行所需要的全部环境

类似于java里的对象：
User user = new User()
```

#### （三）docker仓库

```bash
Docker仓库-Docker registeries： 用来保存镜像，有公有和私有仓库，好比Maven的中央仓库和本地私服

分类：
公共仓库：如 Docker Hub（默认仓库）、阿里云镜像仓库等
私有仓库：企业内搭建的仓库（如Registry）
```

#### （四）三者比较

```bash
对比面向对象的方式：
Dokcer 里面的镜像 : Java里面的类 Class
Docker 里面的容器 : Java里面的对象 Object
java是通过类创建对象，Docker是通过镜像创建容器

核心命令：pull（拉取镜像）、run（启动容器）、commit（提交容器为镜像）、push（推送镜像）

三者关系
仓库 → 镜像 → 容器
从仓库拉取镜像，也就是仓库管理镜像（如 docker pull ubuntu）
通过镜像创建容器（如 docker run -it ubuntu）
容器可以提交为新镜像，推送回仓库（如 docker commit + docker push）
```

### 三、总结

docker镜像是静态的一层一层的只读文件，docker容器是docker镜像运行后的实例，docker仓库是存储docker镜像的地方。

* * *

**作者**：吴银双

**日期**：2026年6月3日

**平台**：GitHub Pages / 技术博客
