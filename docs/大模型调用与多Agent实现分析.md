# AtomStudio 大模型调用与多 Agent 实现分析

> 本文基于工程源码，分析 AtomStudio 如何调用大模型、多个 Agent 的提示词如何组织，以及“读写文件”类工具调用的真实处理方式。
>
> 配套架构与调用时序图：[`assets/大模型调用架构图.html`](./assets/大模型调用架构图.html)（浏览器直接打开）

---

## 一、大模型是怎么被调用的

AtomStudio **前端不直接请求任何大模型 API，也不持有 API Key**，而是通过托管平台的「运行时插件 + capability 实例」机制间接调用：

1. **插件声明**：`package.json` 的 `actionPlugins` 声明 `@official-plugins/ai-text-generate` 1.0.21（平台提供的文本生成插件，模型端点、鉴权、计费、流式传输都由平台负责）。
2. **capability 实例**：`shared/capabilities/` 下 5 个 JSON，每个绑定一个 Agent——指定 `pluginKey`、模型（`modelID: "2015"`）、模型参数（`temperature: 0.5`、`maxTokens: 8192`）和一段提示词模板。
3. **运行时调用**（`src/lib/useWorkspace.ts` 的 `streamAgentResponse`，核心只有三步）：

   ```ts
   const executor = capabilityClient.load(pluginId);           // 加载 capability 实例
   const stream = executor.callStream('textGenerate', input); // 发起流式生成
   for await (const chunk of stream) { /* chunk.content */ }  // 逐块消费
   ```

4. **入参映射**：调用时传入的对象（如 `{ user_requirement: prompt }`）字段对应 JSON 里的 `paramsSchema`，平台把字段值替换进提示词模板的 `{{input.xxx}}` 占位符，渲染成最终 prompt 发给模型。

**调用链路**：

```text
页面层 WorkspacePage
  → 编排层 useWorkspace.runPipeline（硬编码 SOP）
    → 能力客户端 capabilityClient.load(id).callStream('textGenerate', input)
      → 运行时插件 @official-plugins/ai-text-generate 1.0.21（平台鉴权/计费/流式）
        → 大模型 modelID 2015（temperature 0.5，maxTokens 8192）
```

---

## 二、多个 Agent 的提示词怎么处理

采用**「静态角色模板 + 动态上下文注入」两层设计**。

### 静态层（配置时写定）

每个 capability 的 `formValue.prompt` 是角色提示词，包含三部分：

- **人设与语气**：甚至把主题色风格写进提示词（Mike 暖橙、Emma 粉紫、Bob 蓝白、Alex 蓝色、David 绿色）
- **任务规则**：该角色在流水线中的职责边界
- **输出格式要求**：如 Alex 被要求只输出纯 HTML、内联一切资源、禁止 CDN、禁止解释文字；Bob 被要求输出页面结构 + 带负责人的任务清单

### 动态层（运行时构造）

`runPipeline` 在每个阶段组装不同 input：

| 阶段 | Agent | 输入字段 |
|---|---|---|
| 接单概述 | Mike | `{ user_demand, work_progress: '新项目/迭代', delivery_content: '' }` |
| 需求分析 | Emma | `{ user_requirement: prompt }` |
| 架构设计 | Bob | `{ project_requirement: prompt }` |
| 代码生成 | Alex | 新建：`{ application_requirement: prompt }`；迭代：拼入上一版代码全文 |
| 总结交付 | Mike | `{ user_demand, work_progress, delivery_content: 含代码长度 }` |

### 两个关键事实

- **Agent 之间不靠模型互相对话**：流水线顺序（Mike → Emma → Bob → Alex → Mike）是 `runPipeline` 里硬编码的，每次模型调用都**独立、无状态**；“协作上下文”是编排层显式传参（同一条用户 prompt，Alex 迭代时额外拿到旧代码），模型本身不记得上一个 Agent 说了什么。
- **David（数据分析师）已完整定义，但 `runPipeline` 中并未实际接入调用**，属于预留角色。

---

## 三、“读写文件”的工具调用是怎么处理的

**这个 Demo 没有使用 function-calling / tool-use，也没有真实文件系统。** `ai-text-generate` 只是文本生成能力，模型不会主动发起工具调用。“文件读写”全部由**应用代码在模型之外确定性地模拟**。

### “写文件”（Alex 产出）

1. Alex 以纯文本流式吐出 HTML，代码在 `onChunk` 中累积
2. `stripCodeBlocks()` 用正则剥掉可能出现的 ```` ```html ```` 包裹
3. `addVersion()` 把代码作为**版本快照写入 scopedStorage**（`atomstudio_versions_{projectId}`）——即“保存文件”
4. `currentCode` 通过 iframe 的 `srcDoc` 渲染——即“文件内容上屏”
5. 真正导出到磁盘：`Blob` + `URL.createObjectURL` + `a.click()` 下载 .html；另有剪贴板复制

### “读文件”（迭代修改时）

- 编排层从最新版本快照取出 `currentCode`，**把全文内联进 prompt**：

  ```text
  当前应用代码如下：

  ${currentCode}

  请在此代码基础上进行修改，满足以下新需求：${prompt}
  ```

  模型是“看到”了文件内容，而不是调用工具去读取。

### “回滚”

- `rollbackToVersion` 只是把 `currentCode/currentVersion` 切换到旧快照，同样是 KV 存储操作。

### 存储本质

- `src/lib/storage.ts` 封装的平台 `scopedStorage` 是一个类 localStorage 的键值存储（自动 JSON 序列化），**不是文件系统**，键前缀统一为 `atomstudio_`。

---

## 四、设计评价

这种 **“LLM 只生成文本、工具由代码实现”** 的编排模式：

- **优点**：结果确定、流程可控，不会出现工具调用失控或死循环，适合 Demo 与笔试交付
- **局限**：Agent 不能自主决定读写、只支持单文件、生成中无法多轮自我纠错、规划结果不被下游结构化消费（仅作为文本展示）

若要做成 Atoms 那样的“真 Agentic”，需要：

1. 改用支持 function-calling 的模型
2. 注册 `read_file / write_file / list_files` 等工具
3. 实现多轮 tool-use 循环（模型决策 → 执行工具 → 回灌结果 → 再决策）
4. 将规划/任务结构从文本升级为结构化数据，驱动真实的任务状态机

---

## 五、相关源码位置

| 内容 | 位置 |
|---|---|
| 流水线编排、流式调用、版本写入 | `src/lib/useWorkspace.ts` |
| Agent 元数据与 pluginId 映射 | `src/lib/agents.ts` |
| scopedStorage 封装与键定义 | `src/lib/storage.ts` |
| 5 个 Agent 的提示词模板与参数 schema | `shared/capabilities/*.json` |
| 工作台页面（消息区/预览/标签页） | `src/pages/WorkspacePage/WorkspacePage.tsx` |
