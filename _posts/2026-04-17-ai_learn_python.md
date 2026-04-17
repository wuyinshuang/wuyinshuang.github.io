---
layout: post
title: "使用python在本地进行langchain大模型实战"
date: 2026-04-17
categories: [大模型]
tags: [python, ai,LangChain,Ollama]
author: wuys
---

### 一、引言

最近学了一些大模型的知识，主要还是以python语言为主，笔者是java开发，对python并不熟悉，借此机会写一写python脚本练手，也进一步巩固大模型相关技术。

### 二、操作步骤

#### （一）环境搭建

1.下载python并安装，下载地址：[Download Python | Python.org](https://www.python.org/downloads/)

下载版本：3.14.3

2.创建并激活虚拟环境

```bash
    # 创建名为 `langchain_env` 的虚拟环境
    python -m venv langchain_env

    # 激活虚拟环境
    # Windows:
    langchain_env\Scripts\activate

    # 3. 安装依赖
    pip install -r requirements.txt
```

#### （二）安装 LangChain 及相关库

1.在激活的虚拟环境中，执行以下命令安装核心框架

```bash
    # 1. 安装 LangChain 核心包
    pip install langchain langchain-core
    # 2. 安装社区集成包（包含大量工具和适配器）
    pip install langchain-community
    # 3. 安装与 Ollama 对接的专用包[8,14](@ref)
    pip install langchain-ollama
    # 根据你⽤的模型安装对应包
    pip install langchain-openai # OpenAI
    pip install langchain-anthropic # Claude
    pip install dashscope # 通义千问
    # 其他常⽤包
    pip install python-dotenv # 环境变量管理
    pip install langgraph # Agent 运⾏时（新版必装）
```

#### (三）部署本地大模型（以 Ollama 为例）

1.下载并安装 Ollama，Ollama[官网](https://ollama.com/)

2.拉取并运行一个模型

```bash
    # 方案A：轻量级，速度快，适合入门（约4GB）
    ollama pull qwen2.5:0.5b-instruct
    # 方案B：能力更强，资源占用适中（约5GB）[8](@ref)
    ollama pull qwen2.5:7b-instruct
    # 方案C：最新版，综合能力强（约5GB）
    ollama pull qwen3:7b-instruct
```

3.查看本地下载的大模型

```bash
    ollama list
    NAME           ID              SIZE      MODIFIED
    qwen3-vl:8b    901cae732162    6.1 GB    7 minutes ago
```

4.运行模型服务：安装后，Ollama 会在后台自动运行服务（默认地址：`http://localhost:11434`）

#### （四）编写第一个 LangChain 应用

1.编写app.py，指定使用的模型和用途

```python
    from langchain_ollama import ChatOllama
    from langchain_core.prompts import ChatPromptTemplate
    # 1. 初始化本地大模型[8](@ref)
    # 确保这里的 model 名称与您用 `ollama pull` 下载的名称一致
    llm = ChatOllama(
        model="qwen3-vl:8b",  # 替换成您下载的模型名
        base_url="http://localhost:11434",
        temperature=0.2,  # 控制创造性，越低越稳定
        streaming=True,   # 启用流式输出，体验更好
    )
    # 2. 创建一个提示模板[1](@ref)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个乐于助人的AI助手，请用中文简洁地回答用户问题。"),
        ("user", "{input}")
    ])

    # 3. 使用 LangChain 表达式语言 (LCEL) 将提示和模型组合成链[1](@ref)
    chain = prompt | llm

    # 4. 调用链并获取回答
    question = "请用简单的语言解释什么是 LangChain？"
    print(f"问题：{question}")
    print("回答：", end="")

    # 流式输出回答[8](@ref)
    for chunk in chain.stream({"input": question}):
        print(chunk.content, end="", flush=True)
```

2.在上面激活的langchain_env环境下执行app.py文件

```bash
python app.py
```

3.执行后输出大模型的回答

```bash
    (langchain_env) C:\Users\wys19>D:
    (langchain_env) D:\>cd D:\大模型\执行文件
    (langchain_env) D:\大模型\执行文件>python app.py
    C:\Users\wys19\langchain_env\Lib\site-packages\langchain_core\_api\deprecation.py:25: UserWarning: Core Pydantic V1 functionality isn't compatible with Python 3.14 or greater.
      from pydantic.v1.fields import FieldInfo as FieldInfoV1
    问题：请用简单的语言解释什么是 LangChain？
    回答：LangChain 是一个开源工具包，专门用来简化用大型语言模型（如 ChatGPT）开发应用的过程。它提供模块化组件，比如提示模板和数据处理工具，让开发者快速构建聊天机器人或问答系统等。简单说，它帮你轻松“连接”语言模型，做实际应用。
    (langchain_env) D:\大模型\执行文件>
```

#### （五）使用API Key调用大模型

1. 阿里千问大模型
   1.1千问密钥： API-KEY：<mark>sk-03cbf***********7052471bd0e</mark>（使用大模型时配置）
   通行密钥：sk-dashscope-****（暂时未用到）
   1.2使用千问模型时直接设置API-KEY:
   
   ```python
      import os
      from langchain_community.chat_models import ChatTongyi
      from langchain_core.prompts import ChatPromptTemplate
   ```
   
   设置通义千问 API 密钥
   
   ```python
   os.environ["DASHSCOPE_API_KEY"] = "sk-03cbf***********7052471bd0e"
   ```
   
   初始化通义千问模型
   
   ```python
   llm = ChatTongyi(
      model="qwen-max",  # 可选模型：qwen-max（最强）, qwen-plus, qwen-turbo（最快）
      temperature=0.8,
      streaming=True
   )
   ```
   
   后续构建链和调用的代码与之前完全相同
   
   ```python
   prompt = ChatPromptTemplate.from_messages([
      ("system", "你是一个专业的AI助手。"),
      ("user", "{input}")
   ]) 
   chain = prompt | llm response = chain.invoke({"input": "请解释什么是 LangChain？"}) print(response.content)
   ```
   
   调用大模型示例：
   
   ```python
       import os
       from dotenv import load_dotenv
       from openai import OpenAI
       # 加载环境变量
       load_dotenv()
       # 初始化客户端
       client = OpenAI(
           api_key=os.getenv("DASHSCOPE_API_KEY"),
           base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
       )
   
       # 调用通义千问
       def call_qwen(prompt, model="qwen-turbo"):
           response = client.chat.completions.create(
               model=model,
               messages=[
                   {"role": "system", "content": "你是一个乐于助人的助手。"},
                   {"role": "user", "content": prompt}
               ],
               temperature=float(os.getenv("TEMPERATURE", "0.7")),
               max_tokens=int(os.getenv("MAX_TOKENS", "1000"))
           )
           return response.choices[0].message.content
   
       # 使用
       result = call_qwen("你好，介绍一下你自己")
       print(result)
   ```

调用大模型示例2：

```python
    from dotenv import load_dotenv
    import os
    load_dotenv()
    # 通义千问⽰例
    from langchain_community.chat_models import ChatTongyi

    llm = ChatTongyi(
        model="qwen-turbo",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    response = llm.invoke("你好，请⽤⼀句话介绍⾃⼰")
    print(response.content)
```

#### （六）Prompt提示词模板

调用大模型创建聊天模板并提问：

```python
    from langchain_core.prompts import ChatPromptTemplate
    from dotenv import load_dotenv
    import os
    load_dotenv()
    # 通义千问⽰例
    from langchain_community.chat_models import ChatTongyi

    llm = ChatTongyi(
        model="qwen-turbo",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    # 定义多轮对话模板
    chat_template = ChatPromptTemplate.from_messages([
    ("system", "你是⼀位{role}，擅⻓⽤简洁易懂的⽅式解释复杂概念。"),
    ("human", "请解释⼀下：{concept}"),
    ])
    # ⽣成消息列表
    messages = chat_template.format_messages(
    role="物理学教授",
    concept="量⼦纠缠"
    )
    # 调⽤模型
    response = llm.invoke(messages)
    print(response.content)
```

调用大模型创建示例模板并提问：

```python
    from langchain_core.prompts import ChatPromptTemplate
    from dotenv import load_dotenv
    import os
    load_dotenv()
    # 通义千问⽰例
    from langchain_community.chat_models import ChatTongyi

    llm = ChatTongyi(
        model="qwen-turbo",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    # 定义⽰例
    examples = [
    {"input": "开⼼", "output": "我今天⾮常开⼼！"},
    {"input": "难过", "output": "我感到有些难过..."},
    ]
    # 创建包含⽰例的模板
    few_shot_template = ChatPromptTemplate.from_messages([
    ("system", "你是⼀个情绪表达助⼿。"),
    ("human", "⽰例：\n情绪: 开⼼\n表达: 我今天⾮常开⼼！\n\n情绪: 难过\n表达: 我感到有些难过..."),
    ("human", "现在请表达这个情绪: {emotion}")
    ])

    messages = few_shot_template.format_messages(emotion="兴奋")# 调⽤模型
    response = llm.invoke(messages)
    print(response.content)
```

调用大模型动态填充日期并提问：

```python
    from dotenv import load_dotenv
    import os
    load_dotenv()
    # 通义千问⽰例
    from langchain_community.chat_models import ChatTongyi
    from datetime import datetime
    from langchain_core.prompts import PromptTemplate

    llm = ChatTongyi(
        model="qwen-turbo",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    template = PromptTemplate(
    template="今天是{date}，请告诉我关于{topic}的最新消息。",
    input_variables=["topic"],
    partial_variables={
    "date": datetime.now().strftime("%Y年%m⽉%d⽇") # ⾃动填充
    }
    )

    # 只需要传 topic
    prompt = template.format(topic="黄金价格")

    response = llm.invoke(prompt)
    print(response.content)
```

#### （七）Tools工具定义

1.定义数据计算器工具类并调用：

```python
    from langchain_core.tools import BaseTool
    from pydantic import BaseModel, Field
    from typing import Type
    # 定义输⼊参数结构
    class CalculatorInput(BaseModel):
          expression: str = Field(description="数学表达式，如 '2+2' 或 '10*5'")
    class Calculator(BaseTool):
        name: str = "calculator"
        description: str = "执⾏数学计算"
        args_schema: Type[BaseModel] = CalculatorInput

        def _run(self, expression: str) -> str:
            """同步执⾏"""
            try:
                result = eval(expression)
                return f"计算结果: {expression} = {result}"
            except Exception as e:
                return f"计算错误: {str(e)}"
        async def _arun(self, expression: str) -> str:
            """异步执⾏（可选实现）"""
            return self._run(expression)

    # 使⽤
    calc = Calculator()
    result = calc.invoke({"expression": "123 * 456"})
    print(result) # 计算结果: 123 * 456 = 56088
```

2.把定义好的工具绑定到模型，让模型自己选择使用的工具：

```python
    from langchain_core.tools import BaseTool
    from pydantic import BaseModel, Field
    from typing import Type
    # 定义输⼊参数结构
    class CalculatorInput(BaseModel):
          expression: str = Field(description="数学表达式，如 '2+2' 或 '10*5'")
    class Calculator(BaseTool):
        name: str = "calculator"
        description: str = "执⾏数学计算"
        args_schema: Type[BaseModel] = CalculatorInput

        def _run(self, expression: str) -> str:
            """同步执⾏"""
            try:
                result = eval(expression)
                return f"计算结果: {expression} = {result}"
            except Exception as e:
                return f"计算错误: {str(e)}"
        async def _arun(self, expression: str) -> str:
            """异步执⾏（可选实现）"""
            return self._run(expression)

    from dotenv import load_dotenv
    import os

    load_dotenv()

    # 通义千问⽰例
    from langchain_community.chat_models import ChatTongyi

    llm = ChatTongyi(
        model="qwen-turbo",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    # 创建⼯具列表
    tools = [ Calculator()]
    # 绑定到模型
    llm_with_tools = llm.bind_tools(tools)
    # 现在模型知道有这些⼯具可⽤了
    response = llm_with_tools.invoke("1024*11")

    # 检查模型是否决定调⽤⼯具
    if response.tool_calls:
        for tool_call in response.tool_calls:
            print(f"模型想调⽤: {tool_call['name']}")
            print(f"传⼊参数: {tool_call['args']}")
```

#### （八）Agent智能代理

1.LangChain 1.0+ 新版 Agent，新版⽤ create_agent ，底层基于 LangGraph，更稳定：

```python
    from langchain.agents import create_agent
    from langchain_core.tools import tool
    from langchain_community.chat_models import ChatTongyi
    import os
    # 1. 初始化模型
    from dotenv import load_dotenv
    load_dotenv()
    llm = ChatTongyi(
        model="qwen-plus",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    # 2. 定义⼯具  
    @tool
    def get_weather(city: str) -> str:      
        """获取城市天⽓信息 """
        weather_db = {
               "北京": "晴天 ，15-25度 ",
               "上海": "多云 ，18-28度 ",
               "深圳": "⼩⾬ ，20-30度 ",
        }
        return weather_db.get(city, f"{city}的天⽓信息暂不可⽤")

    @tool
    def calculator(expression: str) -> str:        
        """执⾏数学计算 """
        try:
            result = eval(expression)
            return f"计算结果 : {expression} = {result}"
        except:
            return "计算错误 "

    @tool
    def search_knowledge(query: str) -> str:        
        """搜索知识库 """
        knowledge = {
            "LangChain": "LangChain是⼀个⽤于开发LLM应⽤的框架 ，⽀持⼯具、代理、 内存管理等功能。 ",
            "机器学习": "机器学习是AI的⼦集 ，让系统能从数据中⾃动学习和改进。 ",
        }
        for key, value in knowledge.items():
             if key in query:
                return value
        return f"未找到关于'{query}'的信息 "

    # 3. 创建 Agent
    agent = create_agent(
          model=llm,
          tools=[get_weather, calculator, search_knowledge],
          system_prompt="你是⼀个专业的中⽂助⼿ 。仔细分析⽤户问题 ，选择合适的⼯具来回答。 "
      ) 
    # 4. 使⽤ Agent
    result = agent.invoke({
           "messages": [{"role": "user", "content": "上海今天天气怎么样？"}]
      }) 
    # 获取回答
    final_message = result["messages"][-1]
    print(f"回答 : {final_message.content}")
```

2.Agent处理多个问题：

```python
    from langchain.agents import create_agent
    from langchain_core.tools import tool
    from langchain_community.chat_models import ChatTongyi
    import os
    # 1. 初始化模型
    from dotenv import load_dotenv
    load_dotenv()
    llm = ChatTongyi(
        model="qwen-plus",
        dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
    )

    # 2. 定义⼯具  
    @tool
    def get_weather(city: str) -> str:      
        """获取城市天⽓信息 """
        weather_db = {
               "北京": "晴天 ，15-25度 ",
               "上海": "多云 ，18-28度 ",
               "深圳": "⼩⾬ ，20-30度 ",
        }
        return weather_db.get(city, f"{city}的天⽓信息暂不可⽤")

    @tool
    def calculator(expression: str) -> str:        
        """执⾏数学计算 """
        try:
            result = eval(expression)
            return f"计算结果 : {expression} = {result}"
        except:
            return "计算错误 "

    @tool
    def search_knowledge(query: str) -> str:        
        """搜索知识库 """
        knowledge = {
            "LangChain": "LangChain是⼀个⽤于开发LLM应⽤的框架 ，⽀持⼯具、代理、 内存管理等功能。 ",
            "机器学习": "机器学习是AI的⼦集 ，让系统能从数据中⾃动学习和改进。 ",
        }
        for key, value in knowledge.items():
             if key in query:
                return value
        return f"未找到关于'{query}'的信息 "

    # 3. 创建 Agent
    agent = create_agent(
          model=llm,
          tools=[get_weather, calculator, search_knowledge],
          system_prompt="你是⼀个专业的中⽂助⼿ 。仔细分析⽤户问题 ，选择合适的⼯具来回答。 "
      ) 

    test_queries = [
        "北京今天天⽓怎么样？",
        "给我讲讲什么是机器学习",
        "计算 123 * 456",
    ]

    # 4. 使⽤ Agent
    for query in test_queries:
      print(f"\n⽤⼾: {query}")
      result = agent.invoke({
        "messages": [{"role": "user", "content": query}]
      })
      # 获取回答
      final_message = result["messages"][-1]
      print(f"助⼿: {final_message.content}")
```

#### （九）在VS Code中新建一个项目并运行

1.下载并安装VS Code，下载地址：[https://code.visualstudio.com/](https://code.visualstudio.com/)

2.下载并安装Python，下载地址：[Download Python | Python.org](https://www.python.org/downloads/)

```bash
    # 安装后验证: 
    python --version 
    # 应显示：Python 3.x.x 
    pip --version 
    # 应显示：pip 23.x.x
```

3.配置VS Code

    3.1安装扩展：

        Python（Microsoft 官方） - 提供 Python 支持        

        Pylance（Microsoft 官方） - 智能代码补全        

        Python Debugger​ - 调试支持        

        Python Test Explorer​ - 测试支持（可选）       

        Code Runner​ - 快速运行代码        

        Python Indent​ - 缩进辅助        

        autoDocstring​ - 自动生成文档字符串        

        GitLens​ - Git 增强

    3.2配置 Python 解释器：

        按 Ctrl+Shift+P打开命令面板        

        输入 Python: Select Interpreter        

        选择您安装的 Python 版本

4.创建Python项目

    4.1创建项目文件夹,比如：smart_assistant

    4.2用 VS Code 打开项目文件夹（File-open folder)

    4.3创建项目结构
        my_python_project/
    ├── .vscode/           # VS Code 配置
    │   └── settings.json  # 项目设置
    ├── src/               # 源代码
    │   └── main.py    
    │   └── tools/ # ⼯具定义
    │       ├── weather.py
    │       ├── calculator.py
    │       └── translator.py
    ├── tests/             # 测试代码
    │   └── test_main.py
    ├── requirements.txt   # 依赖包列表
    ├── README.md          # 项目说明
    └── .env        # 配置大模型的API-key

    4.4配置项目设置

    .vscode/settings.json

```json
        {
        // Python 相关设置
        "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
        "python.analysis.autoImportCompletions": true,
        "python.analysis.autoSearchPaths": true,
        "python.analysis.typeCheckingMode": "basic",
        "python.languageServer": "Pylance",
        // 代码格式化
        "[python]": {
            "editor.formatOnSave": true,
            "editor.codeActionsOnSave": {
                "source.organizeImports": "always"
            }
        },
        // 终端设置
        "terminal.integrated.defaultProfile.windows": "Command Prompt",
        "terminal.integrated.shell.windows": "cmd.exe",
        // 文件排除
        "files.exclude": {
            "**/__pycache__": true,
            "**/.pytest_cache": true,
            "**/.mypy_cache": true
        },

        // 代码运行器
        "code-runner.executorMap": {
            "python": "python -u"
        },
        "code-runner.runInTerminal": true,
        "code-runner.saveFileBeforeRun": true
    }
```

.env

```yaml
     # ===== 阿里云通义千问 =====
    DASHSCOPE_API_KEY=sk-03cbfdxxxxxxxxxxxxxfd7052471bd0e
    QWEN_MODEL=qwen-plus
    QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
    # ===== Anthropic Claude =====
    #ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    #CLAUDE_MODEL=claude-3-5-sonnet-20241022
    # ===== OpenAI =====
    #OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    #OPENAI_MODEL=gpt-4o
    #OPENAI_BASE_URL=https://api.openai.com/v1
    # ===== 通用配置 =====
    TEMPERATURE=0.7
    MAX_TOKENS=2000
    TIMEOUT=30
```

5.创建虚拟环境

    5.1在VC Code中点击顶部菜单：终端 → 新建终端

    5.2输入指令创建并激活虚拟环境
    # 在项目根目录执行
    python -m venv venv
    # 验证创建成功
    dir venv  # Windows
    # Windows 激活虚拟环境
    venv\Scripts\activate

    5.3配置 VS Code 使用虚拟环境

* 按 `Ctrl+Shift+P`

* 输入 `Python: Select Interpreter`

* 选择 `./venv/Scripts/python.exe`

6.编写工程

    6.1创建main.py及其他工具定义

    main.py

```python
    import os
    from dotenv import load_dotenv
    from pydantic import SecretStr
    # 加载环境变量
    load_dotenv()
    from langchain.agents import create_agent
    from langchain_community.chat_models import ChatTongyi
    from langgraph.checkpoint.memory import MemorySaver
    # 导⼊⼯具
    from tools.weather import get_weather
    from tools.calculator import calculator
    from tools.translator import translate
    # 系统提⽰词
    SYSTEM_PROMPT = """
    你是⼩智，⼀个全能智能助⼿。
    你可以帮⽤⼾：
    • 查询天⽓：查询中国主要城市的天⽓
    • 数学计算：进⾏各种数学运算
    • ⽂本翻译：将中⽂翻译成其他语⾔
    ⼯作原则：
    1. 先理解⽤⼾意图，选择合适的⼯具
    2. 如果不确定，可以询问⽤⼾
    3. 回答简洁明了，有帮助
    """
    from langchain_community.chat_models import ChatOllama
    def create_assistant():
        """创建智能助⼿"""
        # 初始化模型
        llm = ChatTongyi(
            model="qwen-plus",
            temperature=0.7,
            dashscope_api_key=os.environ.get("DASHSCOPE_API_KEY")
        )
        # 创建记忆
        checkpointer = MemorySaver()
        # 创建 Agent
        agent = create_agent(
            model=llm,
            tools=[get_weather, calculator, translate],
            system_prompt=SYSTEM_PROMPT,
            checkpointer=checkpointer
        )
        return agent

    def main():
        """主函数"""
        print("=" * 50)
        print(" ⼩智 - 全能智能助⼿ v1.0")
        print("=" * 50)
        print("输⼊ 'quit' 退出\n")
        agent = create_assistant()
        config = {"configurable": {"thread_id": "main"}}
        while True:
            user_input = input("你: ").strip()
            if user_input.lower() in ['quit', '退出', 'exit']:
                print("再⻅！")
                break
            if not user_input:
                continue
            try:
                result = agent.invoke(
                    {"messages": [{"role": "user", "content": user_input}]},
                    config
                )
                response = result["messages"][-1].content
                print(f"⼩智: {response}\n")
            except Exception as e:
                print(f"出错了: {str(e)}\n")

    if __name__ == "__main__":
        main()
```

     calculator.py

```python
    from langchain_core.tools import tool
    @tool
    def calculator(expression: str) -> str:
        """
        执⾏数学计算
        Args:
            expression: 数学表达式，如 "2+2"、"(10*5)+20"、"2**8"
        """
        try:
            # 安全检查
            allowed_chars = set('0123456789+-*/(). ')
            if not all(c in allowed_chars for c in expression.replace('**', '')):
                return "表达式包含⾮法字符"
            result = eval(expression, {"__builtins__": {}}, {})
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            return f"计算结果：{expression} = {result}"
        except ZeroDivisionError:
            return "错误：除数不能为零"
        except Exception as e:
            return f"计算错误：{str(e)}"
```

    weather.py

```python
    from langchain_core.tools import tool
    from datetime import datetime
    @tool
    def get_weather(city: str) -> str:
        """
        获取指定城市的实时天⽓信息
        Args:
        city: 城市名称，⽀持北京、上海、⼴州、深圳、杭州等
        """
        weather_database = {
            "北京": {"condition": "晴天", "temp": "15-25°C", "aqi": "优"},
            "上海": {"condition": "多云", "temp": "18-28°C", "aqi": "良"},
            "深圳": {"condition": "⼩⾬", "temp": "22-30°C", "aqi": "优"},
            "杭州": {"condition": "阴天", "temp": "17-26°C", "aqi": "良"},
            "⼴州": {"condition": "晴天", "temp": "20-32°C", "aqi": "良"},
        }
        if city not in weather_database:
            return f"暂⽆{city}的天⽓数据，⽀持城市：北京、上海、深圳、杭州、⼴州"
        data = weather_database[city]
        return f"""
    {city} 天⽓预报
    ━━━━━━━━━━━━━━━━
    天⽓：{data['condition']}
    温度：{data['temp']}
    空⽓质量：{data['aqi']}
    更新时间：{datetime.now().strftime("%H:%M")}
        """.strip()
```

    translator.py

```python
    from langchain_core.tools import tool
    @tool
    def translate(text: str, target_language: str = "英⽂") -> str:
        """
        将中⽂⽂本翻译成其他语⾔（模拟）
        Args:
            text: 要翻译的中⽂⽂本
        target_language: ⽬标语⾔，⽀持"英⽂"、"⽇⽂"、"韩⽂"
        """
        translations = {
            "你好": {"英⽂": "Hello", "⽇⽂": "こんにちは", "韩⽂": "안녕하세요"},
            "谢谢": {"英⽂": "Thank you", "⽇⽂": "ありがとう", "韩⽂": "감사합니다"},
            "再⻅": {"英⽂": "Goodbye", "⽇⽂": "さようなら", "韩⽂": "안녕히 가세요"},
        }
        if text in translations and target_language in translations[text]:
            result = translations[text][target_language]
            return f"翻译结果：'{text}' → [{target_language}] {result}"
        return f"暂不⽀持'{text}'的{target_language}翻译"
```

   6.2下载用到的安装包

```bash
    # 1. 安装 LangChain 核心包
    pp install langchain langchain-core
    # 2. 安装社区集成包（包含大量工具和适配器）
    pip install langchain-community
    # 根据你⽤的模型安装对应包
    pip install dashscope # 通义千问
    # 其他常⽤包
    pip install python-dotenv # 环境变量管理
    pip install langgraph # Agent 运⾏时（新版必装）
    #注意：如果项目中有requirements.txt，那么只要安装这个文件的依赖即可
    pip install -r requirements.txt
```

7.点击执行按钮（Run as Python File）即可。

### 三、总结

总体来说,python语言还是非常简洁优美的，运行也比较方便，不过我老本行是java开发，所以python只是蜻蜓点水，学习一下大模型的概念思维，后面还是学习spring ai框架来做大模型开发。

* * *

**作者**：吴银双

**日期**：2026年4月17日

**平台**：GitHub Pages / 技术博客
