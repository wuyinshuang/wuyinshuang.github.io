---
layout: post
title: "服务方接口调用记录持久化标准沉淀"
date: 2026-06-16
categories: [java开发]
tags: [java,r2dbc]
author: wuys

---

### 一、引言

最近又在写一个对外接口，需要将调用记录持久化下来，正好借此机会把接口调用记录持久化的标准规范写一套出来，以后其他系统也可以参考，框架用的是响应式开发spring webflux + r2dbc + oracle。

### 二、具体内容

#### 1.设计接口调用记录表结构

```sql
create table API_CALL_RECORD
(ID NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
REQUEST_ID VARCHAR2 (500) not null,
REQUEST_TIME TIMESTAMP (6) not null,
SYSTEM_ID VARCHAR2 (100) not null,
API_PATH VARCHAR2 (500),
API_NAME VARCHAR2 (500),
REQUEST_DATA CLOB,
IS_SUCCESS VARCHAR2(5),
ERROR_MSG CLOB,
RESPONSE_DATA CLOB,
RESPONSE_TIME TIMESTAMP(6),
DURATION_MS INTEGER
);
comment on table API_CALL_RECORD IS '接口调用记录表';
comment on column API_CALL_RECORD.ID IS '唯一标识';
comment on column API_CALL_RECORD.REQUEST_ID IS '请求id';
comment on column API_CALL_RECORD.REQUEST_IIME IS '请求时间';
comment on column API_CALL_RECORD.SYSTEM_ID IS '系统标识';
comment on column API_CALL_RECORD.API_PATH IS '接口路径';
comment on column API_CALL_RECORD.API_NAME IS '接口名称';
comment on column API_CALL_RECORD.REQUEST_DATA IS '请求参数';
comment on column API_CALL_RECORD.IS_SUCCESS IS '是否成功Y-成功';
comment on column API_CALL_RECORD.ERROR_MSG IS '错误信息';
comment on column API_CALL_RECORD.RESPONSE_DATA IS '返回数据';
comment on column API_CALL_RECORD.RESPONSE_TIME IS '返回时间';
comment on column API_CALL_RECORD.DURATION_MS IS '请求耗时（毫秒）';
```

#### 2.创建数据库表对应的实体类

```java
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("API_CALL_RECORD")
public class ApiCallRecord {

    @Id
    @Column("ID")
    private Long id;

    @Column("REQUEST_ID")
    private String requestId;

    @Column("REQUEST_TIME")
    private LocalDateTime requestTime;

    @Column("SYSTEM_ID")
    private String systemId;

    @Column("API_PATH")
    private String apiPath;

    @Column("API_NAME")
    private String apiName;

    @Column("REQUEST_DATA")
    private String requestData;  // CLOB类型映射为String

    @Column("IS_SUCCESS")
    private String isSuccess;  // Y-成功, N-失败

    @Column("ERROR_MSG")
    private String errorMsg;  // CLOB类型映射为String

    @Column("RESPONSE_DATA")
    private String responseData;  // CLOB类型映射为String

    @Column("RESPONSE_TIME")
    private LocalDateTime responseTime;

    @Column("DURATION_MS")
    private Integer durationMs;
}
```

#### 3.编写业务逻辑层代码

```java
public interface ApiCallRecordService {
    Mono<Void> saveApiCallRecord(ApiCallRecord apiCallRecord);
}

@Slf4j
@Service
@RequiredArgsConstructor
public class ApiCallRecordServiceImpl implements ApiCallRecordService  {

    @Autowired
    private R2dbcEntityTemplate r2dbcEntityTemplate;

    @Override
    public Mono<Void> saveApiCallRecord(ApiCallRecord apiCallRecord); { 
        return r2dbcEntityTemplate.insert(ApiCallRecord.class).using(apiCallRecord).then;
    }

}
```

#### 4.调用接口记录持久化方法

```java
// 记录请求开始时间
LocalDateTime startTime = LocalDateTime.now();
// 调用登录接口
...
//记录调用接口返回时间
LocalDateTime endTime = LocalDateTime.now();
// 记录请求耗时
long processingTime = Duration.between(startTime, endTime).toMillis();
// 链式调用创建调用记录对象
ApiCallRecord apiCallRecord = ApiCallRecord.builder()
.requestId(request.getRequestId())
.requestTime(startTime)
.systemId(request.getSystemId())
.apiPath("/user/login")
.apiName("登录接口")
.requestData(request == null ? "" : (request.toString().length() > 1000 ?        request.toString().subString(0,1000) : request.toString());
.isSuccess(response.isSuccess() ? "Y" : "N"
.errorMsg(response.getError() == null ? "" : response.getError().getMessage())
.responseData(response.getData() == null ? "" : response.getData().getText())
.responseTime(endTime)
.durationMs((int) processingTime)
.build();
// 调用业务层记录持久化方法
apicallRecordservice.saveApiCallRecord(apiCallRecord)
.doonsuccess(v -> {log.info("保存调用记录成功");})
.do0nError(e -> {log.error("保存调用记录失败",e);})
.subscribe();
}
```

### 三、总结

这是一个简易版调用记录持久化的过程，需要方法首先必须拿到response（即便发生exception也要封装好response传回来）。

* * *

**作者**：吴银双

**日期**：2026年6月16日

**平台**：GitHub Pages / 技术博客
