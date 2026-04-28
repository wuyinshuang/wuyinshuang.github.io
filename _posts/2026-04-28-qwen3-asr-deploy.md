---
layout: post
title: "qwen3-asr模型部署及调用"
date: 2026-04-28
categories: [大模型]
tags: [qwen3-asr, ai]
author: wuys
---

### 一、引言

上次已经部署了qwen3-tts模型，这次把qwen3-asr的启动命令也一起留存下。

### 二、具体内容

1. 启动命令
   
   ```bash
   #停止现有容器
   sudo docker stop qwen3-asr
   #移除原容器
   sudo docker rm qwen3-asr
   #启动命令，注意qwenllm/qwen3-asr为llm镜像名，需要你替换成自己的
   sudo docker run-d \
       --gpus all \
       --ipc=host \
       --shm-size 16g \
       -e "CUDA VISIBLE DEVICES=1" \
       -V /data/models/audio/Qwen3-ASR-0.6B:/model/ \
       -p 30101:8000 \
       --name qwen3-asr \
       qwenllm/qwen3-asr \
       qwen-asr-serve  \
           --model /model/ \
           --served-model-name qwen3-asr \
           --port 8000 \
           --host 0.0.0.0 \
           --gpu-memory-utilization 0.8 
   ```

2.本地启动8001端口上传远程服务器文件

因为qwen3-asr不仅可以识别音频文件的base64编码，也可以识别远程服务器上的音频文件，所以我们启动一个8001端口作为远程服务器文件路径：

```bash
#假设远程服务器文件放在本地服务器的/data/files路径下:
busybox httpd -p 800l -h /data
```

3.两种方式接口调用示例

（1）通过远程服务器文件进行语音识别

```json
#接口地址
http://你的模型部署服务器ip:30101/v1/chat/completions
#请求报文
{
    "model":"qwen3-asr",
    "stream":false,
    "messages":[
        {"content":[
            {"type": "audio url",
             "audio_url": {
                "url": "http://你的模型部署服务器ip:8001/fi1es/Auto2.wav"
                }
              }
            ],
       "role": "user"
        }
    ],
    "asr_options":{
        "language":"auto",
        "custom_vocabulary_word":[
            {
                "word": "不二家",
                "sounds_like": ["bu er jia"]
            }
        ]
    }
}

#返回报文
{
    "id": "chatcmp1-86d9a374707f3816",
    "object":"chat.completion",
    "created":1777403494,
    "model":"qwen3-asr",
    "choices":[
        {
        "index":0,
        "message":{
            "content": "language English<asr_text>Hello, how are you?"
            "refusal": null,
            "annotations": null,
            "audio": null,
            "function_call": null,
            "tool_calls": [],
            "reasoning": null,
            "reasoning_content": null
            },
        "logprobs": null,
        "finish_reason":"stop",
        "stop_reason": null,
        "token_ids": null
        }
    ],
    "service_tier": null,
    "system_fingerprint":null,
    "usage": {
        "prompt_tokens": 41,
        "total_tokens": 51,
        "completion_tokens": 10,
        "prompt_tokens_details": null
    ],
    "prompt_logprobs": null,
    "prompt_token_ids": null,
    "kv_transfer_params": null
}

```

（2）通过音频文件base64编码进行语音识别

```json
#接口地址
http://你的模型部署服务器ip:30101/v1/chat/completions
#请求报文
{
    "model":"qwen3-asr",
    "stream":false,
    "messages":[
        {"content":[
            {"type": "audio url",
             "audio_url": {
                "url": "data:audio/wav;base64,UklGRiSAgBXQVZFZm10IBAAAAAA......"
                }
              }
            ],
       "role": "user"
        }
    ],
    "asr_options":{
        "language":"zh",
        "custom_vocabulary_word":[
            {
                "word": "不二家",
                "sounds_like": ["bu er jia"]
            }
        ]
    }
}

#返回报文
{
    "id": "chatcmp1-9dc118670b9f1425",
    "object":"chat.completion",
    "created":1777403574,
    "model":"qwen3-asr",
    "choices":[
        {
        "index":0,
        "message":{
            "content": "language Chinese<asr_text>您好，请问有什么可以帮到您？"
            "refusal": null,
            "annotations": null,
            "audio": null,
            "function_call": null,
            "tool_calls": [],
            "reasoning": null,
            "reasoning_content": null
            },
        "logprobs": null,
        "finish_reason":"stop",
        "stop_reason": null,
        "token_ids": null
        }
    ],
    "service_tier": null,
    "system_fingerprint":null,
    "usage": {
        "prompt_tokens": 66,
        "total_tokens": 82,
        "completion_tokens": 16,
        "prompt_tokens_details": null
    ],
    "prompt_logprobs": null,
    "prompt_token_ids": null,
    "kv_transfer_params": null
}
```

### 三、总结

qwen3-asr支持两种方式调用http接口，还支持自定义词汇表，对一些专有名词进行语音识别。不过，一般还是会封装一个智能体去调用asr模型，智能体暴露出来的http接口对于客户端调用来说更加友好。另外，二进制字节流转成base64编码后体积会明显增大，所以要设计好转base64编码的合适位置，尽量避免系统间传输成本。

* * *

**作者**：吴银双

**日期**：2026年4月28日

**平台**：GitHub Pages / 技术博客
