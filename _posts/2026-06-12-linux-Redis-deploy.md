---
layout: post
title: "Linux服务器上如何安装部署Redis？"
date: 2026-06-12
categories: [数据库]
tags: [redis,linux]
author: wuys

---

### 一、引言

之前已经在我的linux服务器上安装了jdk、maven、tomcat、mysql等，今天来装一下redis。

### 二、具体内容

#### 1.下载redis源码包，我下载到/usr/local/software路径下：

```bash
# 下载 Redis 6.2.22 源码包
wget https://download.redis.io/releases/redis-8.6.0.tar.g
# 解压
tar -zxvf redis-8.6.0.tar.gz
# 重命名
mv redis-8.6.1 redis8
```

![cfff6d3c-101c-4c8d-b144-811d51b2df71](images/cfff6d3c-101c-4c8d-b144-811d51b2df71.png)

![0edbea7f-2a6f-4975-a389-4c111a688ea5](images/0edbea7f-2a6f-4975-a389-4c111a688ea5.png)

#### 2.安装依赖：

```bash
# 安装 g++ (在 yum 系统中，这个包名叫 gcc-c++)
yum install -y gcc-c
+# 验证安装是否成功
g++ --version
```

![44e82951-8dfd-45f4-83d6-80665ac4458f](images/44e82951-8dfd-45f4-83d6-80665ac4458f.png)

![8e008479-e15a-46ce-a7bc-4e42bce495ce](images/8e008479-e15a-46ce-a7bc-4e42bce495ce.png)

#### 3.编译redis

```bash
# 重新配置并编译，指定使用 libc 作为内存分配器，防止jemalloc报错
make MALLOC=libc
```

![b092c215-2e4b-4431-9c37-e28c0fabcb64](images/b092c215-2e4b-4431-9c37-e28c0fabcb64.png)

编译完成后安装到指定路径，我安装到/usr/local/redis下：

```bash
# 创建目录
mkdir -p /usr/local/redis
#安装到指定⽬录
make PREFIX=/usr/local/redis install
```

![147b762e-7c3b-4f47-9e4c-d97a954db7b9](images/147b762e-7c3b-4f47-9e4c-d97a954db7b9.png)

4.启动redis服务：

![9385348c-d9a3-4d83-b147-bd4b0a3ef926](images/9385348c-d9a3-4d83-b147-bd4b0a3ef926.png)





### 三、总结

关系型数据库与非关系型数据库都是我们经常用到的，二者都要掌握。

* * *

**作者**：吴银双

**日期**：2026年6月12日

**平台**：GitHub Pages / 技术博客
