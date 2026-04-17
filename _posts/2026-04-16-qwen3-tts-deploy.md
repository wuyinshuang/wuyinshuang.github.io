---
layout: post
title: "如何部署qwen3-tts模型"
date: 2026-04-16
categories: [大模型]
tags: [qwen3-tts, ai]
author: wuys
---

### 一、引言

最近在语言asr/tts模型，qwen3-asr已经部署好了，需要再部署一下qwen3-tts模型，部署环境是Linux系统+docker镜像+vllm-omni镜像（v0.14.0版本），因为中间有个坑，花了整整三天时间才部署好，心力交瘁了哈哈哈

### 二、操作步骤

#### 1.运行前检查环境是否正常：

```bash
#1.检查系统信息
uname -a
cat/etc/os-release
#2.检查GPU状态
nvidia-smi
#如果没有nvidia-smi，先安装驱动
Ubuntu: sudo apt install nvidia-utils-535
CentOS: sudo yum install nvidia-detect
#3.检查CUDA
nvcc --version
#或
cat/usr/local/cuda/version.json
#如果nvcc报找不到命令，则需要将CUDA路径添加到环境变量
#修改.bashrc文件，在最后加入两行
export PATH=/usr/local/cuda/bin:SPATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:SLD_LIBRARY PATH
#添加后使配置生效source ~./bashrc
#4.检Python
python3 -version
```

#### 2.编写运行脚本并执行：

```shell
#1.进入用户目录下
cd /home/deployuser
#2.直接上传脚本文件(也可以编写start_tts_service.sh脚本，vim starttts service.sh#编写完退出:wq，较麻烦不推荐)
start tts service.sh
#3.赋予执行权限
chmod +x start_tts service.sh
#4.一键启动
sudo sh start tts service.sh
```

start tts service.sh完整内容：

```bash
#!/bin/bash
#直接使用官方命令启动本地Qwen3-Tts服务，不考虑缓存日录，不指定持定的qwen3_tts.yaml配置文件
#模型:Qwen/Qwen3-ITS-12Hz-1.7B-CustomVoice(实际为本地模型)
set -e
#配置参数
#模型路径(宿主机)
MODEL_PATH="填写你自己的模型路径，比如/data/model/Qwen3-ITS-12Hz-1.7B-CustomVoice"
#容器内模型文件路径
#注意!!!容器内路径定义一定要包含官方的Qwen3/Qwen3-ITS-12Hz-1.7B-CustomVoice，否则会报错invalid task_type，我就是在这里踩坑耽误了两天时间！！！可以在这个路径前面加目录，不能在后面加！
CONTAINER_MODEL_PATH="自定义容器路径，比如/app/model/Qwen3/Qwen3-ITS-12Hz-1.7B-CustomVoice"
#容器名称
CONTAINER_NAME="qwen3-tts-service"
#服务端口(宿主机端口:容器内端口)
HOST_PORT=8091
CONTAINER_PORT=8091
#GPU设备(根据实际情况调整)
GPU_DEVICE="1"
#最大GPU内存使用率(避免占满显存)
GPU_MEMORY_UTILIZATION=0.8
#最大并发数
MAX_NUM_SEQS=32
#镜像版本
IMAGE_NAME="vllm/vllm-omni:v0.14.0"
#vllm-omni镜像内自带配置文件，默认路径不要改qwen3_tts.yaml
CONFIG_PATH="/workspace/vllm-omni/vllm_omni/model_executor/stage_configs/qwen3_tts.yaml"
#模型对外名称
SERVED_MODEL_NAME="qwen3-tts-customvoice"
#--------------------------------------------------------------------------------------------

#检查环境
echo "检查环境......"
#检查本地镜像是否存在
echo "检查本地镜像:${IMAGE NAME}"
if ! docker image inspect ${IMAGE NAME} >/dev/null 2>&l;then
    echo "本地镜像不存在:${IMAGE NAME}"
    exit 1
fi
echo "本地镜像存在"

#检查模型目录
echo "检查模型目录......"
if [ ! -d ${MODEL_PATH} ];then
    echo "模型目录不存在:${MODEL_PATH}"
    exit 1
fi
echo "模型目录存在"

#检查模型配置文件
echo "检查模型配置文件......"
if [ ! -d ${MODEL_PATH}/config.json ];then
    echo "模型配置文件不存在:${MODEL_PATH}/config.json"
    exit 1
fi
echo "模型配置文件存在"

#清理旧容器
echo "清理旧容器......"
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$";then
    echo "发现旧容器 ${CONTAINER_NAME} ，正在停止并删除..."
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
fi

#启动服务
echo "正在启动容器 ${CONTAINER_NAME} ，使用GPU：1，镜像：${IMAGE NAME}..."
docker run -d\
    --name ${CONTAINER_NAME} \
    --restart=unless-stopped \
    --gpus "device=${GPU_DEVICE}" \
    -p ${HOST_PORT}:${CONTAINER_PORT} \
    -v "${MODEL_PATH}:${CONTAINER_MODEL_PATH}:ro" \
    -e TRANSFORMERS_OFFLINE=1 \
    -e HUB_OFFLINE=l \
    --ipc=host \
    --ulimit memlock=-l \
    --ulimit stack=67108864 \
    "${IMAGE NAME}" \
    vllm serve ${CONTAINER_MODEL_PATH} \
        --served-model-name ${SERVED_MODEL_NAME} \
        --stage-configs-path ${CONFIG_PATH} \
        --omni \
        --host 0.0.0.0 \
        --port ${CONTAINER_PORT} \
        --gpu-memory-utilization ${GPU_MEMORY_UTILIZATION} \
        --max-num-seqs ${MAX_NUM_SEQS} \
        --trust-remote-code \
        --enforce-eager

#等待启动
echo "等待服务启动(90秒)..."
sleep 90

#验证服务
echo "验证服务状态..."
#检查容器状态
if docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "容器运行正常"
else
    echo "容器未运行，查看最后50行日志:"
    docker logs "${CONTAINER_NAME}" --tail 50
    exit 1
fi
#检查服务端口
if curl -s "http://localhost:8091/v1/models" >/dev/null 2>&1;then
    echo "模型列表检查通过"
else
    echo "模型列表检查失败，查看日志:"
    docker logs "${CONTAINER_NAME}" --tail 50 | grep -i "ERROR"
fi
#输出GPU使用情况
echo "GPU使用情况:"
nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu --format=csv
#输出信息
SERVER_IP=$(hostname - I | awk '{print $1}')
echo "Qwen3-TTS服务部署完成!"
echo "服务信息:"
echo "服务地址:http://${SERVER_IP}:${HOST_PORT}"
echo "容器名称:${CONTAINER_NAME}"
echo "API测试：http://localhost:${HOST_PORT}/v1/models"
echo "------------------------------------------------"
```

#### 3、验证部署是否成功:

```bash
#查询模型列表
curl -s "http://locolhost:8091/v1/models"
#语音合成
curl -X POST http://localhost:8091/v1/audio/speech \
    -H "Content-Type: application/json" \
    -d '{
        "input": "Hello, how are you?",
        "voice": "vivian",
        "language": "English",
        "stream": true,
        "response_format": "pcm"
    }' --no-buffer | play -t raw -r 24000 -e signed -b 16 -c 1 -
```

### 三、总结

官方文档中只给了从hug仓库拉取模型的部署命令，没有给启动本地模型的命令，所以一开始并不知道本地部署路径也要包含Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice这种格式，他才能识别出task_type，后来是自己猜想并实验得出来的结果，可以说是个很大的坑了。

```bash
vllm serve Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice \
    --stage-configs-path /path/to/stage_configs_file \
    --omni \
    --port 8091
```

后面又试了在Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice路径前加目录、中间加目录、后面加目录，最终发现只有在后面加目录不行，这个也是v0.14.0版本的官方bug，已经有开发者提出并在新版本中修复。



参考资料：

qwen3-tts官方文档：[Qwen3-TTS - vLLM-Omni](https://docs.vllm.ai/projects/vllm-omni/en/stable/user_guide/examples/online_serving/qwen3_tts/)

魔搭社区qwen3-tts模型：[Qwen3-TTS-12Hz-1.7B-CustomVoice](https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice/summary)

vllm-omni的v0.14.0版本部署路径Qwen3/Qwen3-ITS-12Hz-1.7B-CustomVoice后面不能加其他内容：https://github.com/vllm-project/vllm-omni/pull/1317



* * *

**作者**：吴银双

**日期**：2026年4月16日

**平台**：GitHub Pages / 技术博客
