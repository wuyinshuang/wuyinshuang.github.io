---
layout: post
title: "解决阿里云服务器每隔几天就在凌晨崩溃离线的问题"
date: 2026-06-10
categories: [运维]
tags: [阿里云服务器]
author: wuys

---

### 一、引言

之前购买了一台阿里云服务器并安装了一些常用软件，但是最近发现每隔几天就会给我发短信说云安全中心客户端异常离线，重启之后又没问题了，今天排查了一下。

### 二、具体内容

我在云安全控制台-资产中心-主机资产-实例-客户端问题排查中发现，异常离线是因为云盘读写受限”，CPU负载高。

![3ef978d6-54c7-4041-9cf3-99ce499d88e9](images/3ef978d6-54c7-4041-9cf3-99ce499d88e9.png)此时，已经无法通过putty连接服务器终端了，也无法在阿里云控制台通过VNC远程连接，所以只能现在阿里云控制台上面重启服务器让她恢复正常。

恢复后通过putty连接服务器终端，查看服务器上是否有定时任务：

![73012f688650b358696b8532dc7b9fc1](C:\Users\wys19\xwechat_files\wxid_uxa42367wgzq22_7d63\temp\RWTemp\2026-06\73012f688650b358696b8532dc7b9fc1.png) 

日志清晰显示：服务器上Rocky Linux 9自带的 mlocate-updatedb.timer 服务mlocate-updatedb.service 在每天凌晨00:00运行，并在6月7日、8日、9日、10日都有执行记录。

**这个服务是做什么的？**

* `mlocate-updatedb` 会扫描你服务器上的**所有文件**，建立一个文件名索引数据库

* 这个命令会消耗大量**磁盘IO**和**CPU资源**，尤其是在文件数量很多的情况下

* 这就是为什么你的服务器会在凌晨突然卡死、云盘读写受限、CPU飙高

解决方法：直接禁用这个服务：

```bash
systemctl disable mlocate-updatedb.timer
systemctl stop mlocate-updatedb.tim
# 确认状态是disabled和inactivee
systemctl status mlocate-updatedb.timer 
```

### 三、总结

今天先把这个服务停掉，后面几天再继续观察看下是否还会有类似问题发生。

* * *

**作者**：吴银双

**日期**：2026年6月10日

**平台**：GitHub Pages / 技术博客


