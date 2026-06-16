---
layout: post
title: "SQL、Nosql与Redis清晰定义理解"
date: 2026-06-12
categories: [数据库]
tags: [redis,队列,缓存]
author: wuys

---

### 一、引言

SQL关系型数据库与Nosql非关系型数据库都是数据库领域中的重要分支，但各自解决的是不同类型的问题。

### 二、具体内容

### （一）SQL与NoSQL（Not Only SQL )的对比

| 维度       | SQL（关系型数据库）               | NoSQL（非关系型数据库）          |
| -------- | ------------------------- | ----------------------- |
| **全称**   | Structured Query Language | Not Only SQL（不仅仅是SQL）   |
| **数据模型** | 表（行+列）、固定Schema           | 文档、键值、图、列族等             |
| **典型代表** | MySQL、PostgreSQL、Oracle   | MongoDB、Redis、Cassandra |
| **主要特点** | ACID事务、强一致性、复杂查询          | 高扩展性、高性能、灵活Schema       |

解决的问题不同：

* **SQL**：擅长**复杂查询、多表关联、强一致性**场景（比如银行转账、电商订单）

* **NoSQL**：擅长**海量数据、高并发、灵活Schema**场景（比如用户行为日志、实时推荐）

注意：NoSQL不使⽤SQL作为查询语⾔。

## （二）什么是Redis？

属于NoSQL的⼀种键值对(Key-Value)存储数据库，并提供多种语⾔的 API。具有⾼性能：Redis能读的速度是110000次/s,写的速度是

81000次/s。也属于内存中的数据结构存储系统，它可以⽤作数据库、缓存和消息中间件。 它⽀持多种类型的数据结构，如字符

串（strings）、散列（hashes）、 列表（lists）、 集合（sets）、 有序集合（sorted sets）等。

### 三、总结

关系型数据库与非关系型数据库都是我们经常用到的，二者都要掌握。

* * *

**作者**：吴银双

**日期**：2026年6月12日

**平台**：GitHub Pages / 技术博客
