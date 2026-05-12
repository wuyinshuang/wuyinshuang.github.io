---
layout: post
title: "qwen3-tts-Base模型部署测试"
date: 2026-05-12
categories: [大模型]
tags: [qwen3-tts-Base, ai, 模型部署]
author: wuys
---

### 一、引言

之前已经部署了qwen3-asr/tts模型，但是有些场景需要语音合成使用指定的音色，比如企业形象音色，所以这次部署一下qwen3-tts-Base模型测试音色克隆。部署之前可以去在线网站测试一下效果：[Qwen3-TTS](https://modelscope.cn/studios/Qwen/Qwen3-TTS)

### 二、操作步骤

#### 1.先去魔塔社区下载Qwen3-TTS-12Hz-1.7B-Base模型，不会的参考另一篇笔记：[modelscope下载模型到本地服务器 ](https://www.wuyinshuang.com/posts/modelscope_download_model/)。

#### 2.运行前检查环境是否正常：

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

#### 3.编写运行脚本并执行：

```shell
#1.进入用户目录下
cd /home/deployuser
#2.直接上传脚本文件(也可以编写start_tts_service.sh脚本，vim starttts service.sh#编写完退出:wq，较麻烦不推荐)
start_tts_base.sh
#3.赋予执行权限
chmod +x start_tts_base.sh
#4.一键启动
sudo sh start_tts_base.sh
```

start_tts_base.sh完整内容：

```bash
#!/bin/bash
#使用 vllm-omni Docker镜像
#模型:Qwen/Qwen3-ITS-12Hz-1.7B-Base(实际为本地模型)
set -e
#配置参数
#模型路径(宿主机)
MODEL_PATH="填写你自己的模型路径，比如/data/model/Qwen3-ITS-12Hz-1.7B-Base"
#容器内模型文件路径
#注意!!!容器内路径定义一定要包含官方的Qwen3/Qwen3-ITS-12Hz-1.7B-Base，否则会报错invalid task_type，我就是在这里踩坑耽误了两天时间！！！可以在这个路径前面加目录，不能在后面加！
CONTAINER_MODEL_PATH="自定义容器路径，比如/app/model/Qwen3/Qwen3-ITS-12Hz-1.7B-Base"
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
SERVED_MODEL_NAME="qwen3-tts"
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
        "task_type":"Base",
        "input": "您好，请问有什么可以帮到您？",
        "response_format":"wav",
        "ref_audio":"data:audio/wav;base64,你的被克隆音频的Base64编码"
        "ref_text": "你的被克隆音频的正确文本"
    }' --output output.wav
```

### 三、总结

其实qwen3-tts-base跟之前qwen3-tts-customvoice部署的脚本是几乎一样的，但是调用方式不同。需要注意qwen3-tts-base模型的task_type传参为Base，qwen3-tts-customvoice模型的task_type传参为CustomVoice。另外，qwen3-tts-customvoice是直接指定voice为内置的9种音色，而qwen3-tts-base需要传被克隆音频的base64编码和原文本。



参考资料：

qwen3-tts官方文档：[Qwen3-TTS - vLLM-Omni](https://docs.vllm.ai/projects/vllm-omni/en/stable/user_guide/examples/online_serving/qwen3_tts/)

魔搭社区qwen3-tts模型：[Qwen3-TTS-12Hz-1.7B-Base](https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-Base/summary)

vllm-omni的v0.14.0版本部署路径Qwen3/Qwen3-ITS-12Hz-1.7B-Base后面不能加其他内容：https://github.com/vllm-project/vllm-omni/pull/1317



* * *

**作者**：吴银双

**日期**：2026年5月12日

**平台**：GitHub Pages / 技术博客
