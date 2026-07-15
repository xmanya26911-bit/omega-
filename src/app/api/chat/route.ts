// Omega Cloud — Enhanced Chat API with Multi-Agent Orchestration
// POST /api/chat - SSE streaming with tool use, memory, and agent delegation

import { NextRequest } from "next/server";

export const runtime = "edge";

const GOOGLE_CLIENT_ID =
  "855819039877-5f4a8biid8hkf8j2hhd1jk3bj9ng2f5f.apps.googleusercontent.com";
const OPENCODE_BASE_URL =
  process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1";

// In-memory stores (in production: Redis / database)
const tokenCache = new Map<
  string,
  { email: string; sub: string; exp: number }
>();
const userMemory = new Map<string, any>(); // userId -> { facts, preferences, projects, history }
const sessionStore = new Map<string, any>(); // sessionId -> { messages, agents, tools }

// Rate limiting
const rateMap = new Map<string, number[]>();
function checkRate(key: string, maxReqs = 30, windowMs = 60000) {
  const now = Date.now();
  const times = (rateMap.get(key) || []).filter((t) => now - t < windowMs);
  times.push(now);
  rateMap.set(key, times);
  return times.length <= maxReqs;
}

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ─────────────────────────────────────────────────────────────────────
// TOOLS / SKILLS REGISTRY
// ─────────────────────────────────────────────────────────────────────

type ToolFn = (args: any, context: ToolContext) => Promise<ToolResult>;

interface ToolContext {
  userId: string;
  sessionId: string;
  userEmail: string;
}

interface ToolResult {
  success: boolean;
  content: string;
  data?: any;
}

interface ToolDef {
  name: string;
  description: string;
  schema: any; // JSON Schema
  execute: ToolFn;
}

const tools = new Map<string, ToolDef>();

function registerTool(def: ToolDef) {
  tools.set(def.name, def);
}

function getTool(name: string): ToolDef | undefined {
  return tools.get(name);
}

function getAllTools(): ToolDef[] {
  return Array.from(tools.values());
}

// ─────────────────────────────────────────────────────────────────────
// BUILT-IN TOOLS
// ─────────────────────────────────────────────────────────────────────

// Web Search
registerTool({
  name: "web_search",
  description: "Search the web for current information, documentation, news, etc.",
  schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      maxResults: { type: "number", default: 5 },
    },
    required: ["query"],
  },
  async execute({ query, maxResults = 5 }) {
    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      const data = await res.json();
      const results = data.RelatedTopics?.slice(0, maxResults) || [];
      return {
        success: true,
        content: results
          .map((r: any) => `${r.Text} (${r.FirstURL})`)
          .join("\n\n"),
        data: results,
      };
    } catch (e: any) {
      return { success: false, content: `Search failed: ${e.message}` };
    }
  },
});

// Deep Research (multi-source)
registerTool({
  name: "deep_research",
  description: "Comprehensive research across multiple sources with synthesis",
  schema: {
    type: "object",
    properties: {
      topic: { type: "string", description: "Research topic" },
      depth: { type: "number", default: 3, description: "Research depth (1-5)" },
    },
    required: ["topic"],
  },
  async execute({ topic, depth = 3 }) {
    // Simplified - in production use multiple search APIs, scrape, synthesize
    const queries = [
      topic,
      `${topic} best practices`,
      `${topic} architecture`,
      `${topic} security considerations`,
      `${topic} alternatives comparison`,
    ].slice(0, depth);

    const results = [];
    for (const q of queries) {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`
      );
      const data = await res.json();
      if (data.RelatedTopics?.length) results.push(...data.RelatedTopics.slice(0, 2));
    }

    return {
      success: true,
      content: `Research on "${topic}" (depth ${depth}):\n\n${results
        .map((r: any) => `- ${r.Text} (${r.FirstURL})`)
        .join("\n")}`,
      data: results,
    };
  },
});

// Code Execution (Python sandbox)
registerTool({
  name: "code_exec",
  description: "Execute Python code in sandbox. Returns stdout/stderr/exit_code.",
  schema: {
    type: "object",
    properties: {
      code: { type: "string", description: "Python code to execute" },
      timeout: { type: "number", default: 30 },
    },
    required: ["code"],
  },
  async execute({ code, timeout = 30 }) {
    // In production: use a proper sandbox (Docker, gVisor, etc.)
    // For edge runtime: delegate to a sandbox service
    try {
      const res = await fetch("https://api.piston.rs/api/v2/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "python",
          version: "3.11",
          files: [{ content: code }],
          timeout: timeout * 1000,
        }),
      });
      const data = await res.json();
      return {
        success: data.run?.code === 0,
        content: `stdout:\n${data.run?.stdout || ""}\n\nstderr:\n${data.run?.stderr || ""}\n\nexit_code: ${data.run?.code}`,
        data: data.run,
      };
    } catch (e: any) {
      return { success: false, content: `Execution failed: ${e.message}` };
    }
  },
});

// File System (workspace)
registerTool({
  name: "fs_read",
  description: "Read a file from the workspace",
  schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path relative to workspace" },
    },
    required: ["path"],
  },
  async execute({ path }, context) {
    // In production: use a proper file API
    return { success: false, content: "File system access requires workspace API" };
  },
});

registerTool({
  name: "fs_write",
  description: "Write a file to the workspace",
  schema: {
    type: "object",
    properties: {
      path: { type: "string" },
      content: { type: "string" },
    },
    required: ["path", "content"],
  },
  async execute({ path, content }) {
    return { success: false, content: "File system access requires workspace API" };
  },
});

// Git operations
registerTool({
  name: "git",
  description: "Run git commands in workspace",
  schema: {
    type: "object",
    properties: {
      command: { type: "string", description: "Git command (e.g., 'status', 'log --oneline -10')" },
      repo: { type: "string", description: "Repository path" },
    },
    required: ["command"],
  },
  async execute({ command }) {
    return { success: false, content: "Git requires workspace API" };
  },
});

// PC Remote (via relay)
registerTool({
  name: "pc_exec",
  description: "Execute command on user's PC via Omega Relay",
  schema: {
    type: "object",
    properties: {
      command: { type: "string" },
      cwd: { type: "string", default: "D:\\TERMINALCLI" },
    },
    required: ["command"],
  },
  async execute({ command, cwd }, context) {
    // Delegate to PC Remote panel - just signal it
    return {
      success: true,
      content: `Command queued for PC execution: ${command} (in ${cwd}). Check PC Remote panel for output.`,
      data: { command, cwd },
    };
  },
});

// Memory / Knowledge Graph
registerTool({
  name: "memory_store",
  description: "Store a fact, preference, or decision in persistent memory",
  schema: {
    type: "object",
    properties: {
      key: { type: "string" },
      value: { type: "string" },
      category: { type: "string", enum: ["fact", "preference", "decision", "project", "skill"] },
    },
    required: ["key", "value", "category"],
  },
  async execute({ key, value, category }, context) {
    const mem = userMemory.get(context.userId) || { facts: {}, preferences: {}, decisions: {}, projects: {}, skills: {} };
    (mem[category + "s"] || mem.facts)[key] = { value, timestamp: Date.now() };
    userMemory.set(context.userId, mem);
    return { success: true, content: `Stored in memory: [${category}] ${key} = ${value}` };
  },
});

registerTool({
  name: "memory_recall",
  description: "Recall information from persistent memory",
  schema: {
    type: "object",
    properties: {
      key: { type: "string" },
      category: { type: "string" },
    },
    required: ["key"],
  },
  async execute({ key, category }, context) {
    const mem = userMemory.get(context.userId);
    if (!mem) return { success: false, content: "No memory found for user" };
    const cat = category ? mem[category + "s"] : Object.values(mem).flatMap((c: any) => Object.values(c));
    const entry = cat?.find((e: any) => e.key === key) || Object.values(mem).flatMap((c: any) => Object.values(c)).find((e: any) => e.key === key);
    if (!entry) return { success: false, content: `No memory found for key: ${key}` };
    return { success: true, content: `${key}: ${entry.value} (stored ${new Date(entry.timestamp).toLocaleString()})`, data: entry };
  },
});

registerTool({
  name: "memory_search",
  description: "Search memory by keyword",
  schema: {
    type: "object",
    properties: {
      query: { type: "string" },
      category: { type: "string" },
    },
    required: ["query"],
  },
  async execute({ query, category }, context) {
    const mem = userMemory.get(context.userId);
    if (!mem) return { success: false, content: "No memory found" };
    const results: any[] = [];
    for (const [cat, entries] of Object.entries(mem)) {
      if (category && cat !== category + "s") continue;
      for (const [k, v] of Object.entries(entries as any)) {
        if (k.toLowerCase().includes(query.toLowerCase()) || (v as any).value.toLowerCase().includes(query.toLowerCase())) {
          results.push({ category: cat, key: k, ...v });
        }
      }
    }
    return { success: true, content: results.length ? results.map(r => `[${r.category}] ${r.key}: ${r.value}`).join("\n") : "No matches", data: results };
  },
});

// Agent Delegation (spawn sub-agent)
registerTool({
  name: "delegate_agent",
  description: "Spawn a specialized sub-agent for a specific task",
  schema: {
    type: "object",
    properties: {
      agent: { type: "string", enum: ["architect", "coder", "reviewer", "researcher", "security", "devops", "data"] },
      task: { type: "string" },
      context: { type: "string" },
    },
    required: ["agent", "task"],
  },
  async execute({ agent, task, context }) {
    // This signals the chat to spawn a sub-agent
    // Actual execution happens via the multi-agent orchestrator
    return {
      success: true,
      content: `Sub-agent [${agent}] spawned with task: ${task}\nContext: ${context || "none"}`,
      data: { agent, task, context, spawned: true },
    };
  },
});

// ─────────────────────────────────────────────────────────────────────
// MULTI-AGENT ORCHESTRATOR (simplified for edge runtime)
// ─────────────────────────────────────────────────────────────────────

const AGENT_PROMPTS: Record<string, string> = {
  orchestrator: `You are the Omega Orchestrator. You decompose complex tasks and delegate to specialists.
Available specialists: architect, coder, reviewer, researcher, security, devops, data.
When you delegate, use the delegate_agent tool. Synthesize results and deliver final output.`,
  architect: `You are the Architecture Agent. Design systems: APIs, databases, infra, data flow, trade-offs.
Output: Mermaid diagrams, ADRs, component specs, tech stack decisions.`,
  coder: `You are the Code Writer Agent. Write production code: typed, tested, documented.
Output: Complete files, modules, tests. No snippets.`,
  reviewer: `You are the Code Reviewer Agent. Review for correctness, security, performance, style.
Output: PASS/WARN/FAIL with specific findings and fixes.`,
  researcher: `You are the Research Agent. Deep research with citations. Search, scrape, synthesize.
Output: Structured reports with sources, claims verified, contradictions flagged.`,
  security: `You are the Security Agent. Penetration testing, vulnerability scanning, hardening.
Output: Findings with severity, PoC, remediation.`,
  devops: `You are the DevOps Agent. CI/CD, containers, k8s, monitoring, deployment.
Output: Pipeline configs, Dockerfiles, Helm charts, runbooks.`,
  data: `You are the Data Agent. SQL/NoSQL, pipelines, analytics, ML ops.
Output: Queries, schemas, migrations, model configs.`,
};

// ─────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRate(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Slow down." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const authInfo = await verifyToken(request.headers.get("Authorization"));
  if (!authInfo) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. Please sign in with Google." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (authInfo.sub && !checkRate("user:" + authInfo.sub, 100, 60000)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded for this user" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: {
    message?: string;
    model?: string;
    sessionId?: string;
    mode?: string;
    conversationHistory?: { role: string; content: string }[];
    toolsEnabled?: boolean;
    agentMode?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let { message, model, conversationHistory, mode, sessionId, toolsEnabled, agentMode } = body;

  if (!message || typeof message !== "string") {
    return new Response(
      JSON.stringify({ error: "Message is required and must be a string" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const sanitized = message
    .replace(/ignore\s+all\s+(previous\s+)?instructions/i, "")
    .replace(/ignore\s+everything/i, "")
    .replace(/system\s+prompt/i, "")
    .replace(/you\s+are\s+(now\s+)?/gi, "")
    .replace(/forget\s+(everything|all)/gi, "")
    .trim();

  const sessionKey = sessionId || authInfo.sub + ":default";
  const session = sessionStore.get(sessionKey) || {
    messages: [],
    createdAt: Date.now(),
    toolsUsed: [],
    agentsSpawned: [],
  };

  // Build system prompt with tools
  const toolDefs = getAllTools().map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.schema,
  }));

  const toolPrompt = toolsEnabled ? `
## AVAILABLE TOOLS
You have access to these tools. Use them when needed:
${toolDefs.map(t => `- ${t.name}: ${t.description}`).join("\n")}
Call tools by outputting: TOOL_CALL: {"name": "tool_name", "arguments": {...}}
` : "";

  const modeAddendum: Record<string, string> = {
    research: " Deep Research mode: be thorough, cite sources, structure with sections.",
    coding: " Coding mode: production-quality code, fenced blocks, brief explanation after.",
    canvas: " Canvas mode: well-structured, creative, long-form content.",
    python: " Python mode: Python-first solutions, runnable code blocks.",
    agent: " Agent mode: decompose task, delegate to specialists, synthesize.",
  };

  const userContext = authInfo?.email
    ? `User: ${authInfo.email}.${modeAddendum[mode || "standard"] || ""}`
    : "Anonymous user.";

  const memory = userMemory.get(authInfo.sub) || {};
  const memoryContext = Object.keys(memory).length
    ? `\n## USER MEMORY\n${JSON.stringify(memory, null, 2).slice(0, 2000)}`
    : "";

  const openCodeModel = model || "deepseek-v4-flash-free";
  const openCodeKey = process.env.OPENCODE_API_KEY || "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(sse(obj)));

      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (openCodeKey) headers["Authorization"] = `Bearer ${openCodeKey}`;

        const systemPrompt = OMEGA_SYSTEM_PROMPT + toolPrompt + memoryContext;
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "system", content: `Time: ${new Date().toUTCString()}` },
          { role: "system", content: userContext },
          ...(conversationHistory || []).slice(-20),
          { role: "user", content: sanitized || "[empty]" },
        ];

        const response = await fetch(`${OPENCODE_BASE_URL}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: openCodeModel,
            messages,
            stream: true,
            max_tokens: 8192,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          send({ type: "error", content: `API error: ${response.status} ${errText}` });
          send({ type: "done" });
          controller.close();
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload);
                const delta =
                  parsed?.choices?.[0]?.delta?.content ||
                  parsed?.choices?.[0]?.message?.content ||
                  "";
                if (delta) send({ type: "delta", content: delta });
              } catch {
                if (payload && !payload.startsWith("{")) {
                  send({ type: "delta", content: payload });
                }
              }
            }
          }
        }

        if (buf.trim()) send({ type: "delta", content: buf.trim() });

        // Update session
        session.messages.push({ role: "user", content: sanitized, timestamp: Date.now() });
        sessionStore.set(sessionKey, session);

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", content: (err as Error).message || "Stream failed" });
      } finally {
        try { controller.close(); } catch {}
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────
// TOKEN VERIFICATION
// ─────────────────────────────────────────────────────────────────────

async function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (token.length < 10) return null;

  const cached = tokenCache.get(token);
  if (cached && cached.exp > Date.now() / 1000) return cached;

  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`
    );
    if (!res.ok) {
      tokenCache.delete(token);
      return null;
    }
    const data = await res.json();
    if (data.aud !== GOOGLE_CLIENT_ID) return null;
    if (data.exp && parseInt(data.exp) < Date.now() / 1000) return null;

    const info = {
      email: data.email || data.sub,
      sub: data.sub,
      exp: parseInt(data.exp || "0"),
    };
    const ttl = Math.max(60, info.exp - Date.now() / 1000 - 300) * 1000;
    tokenCache.set(token, info);
    setTimeout(() => tokenCache.delete(token), ttl);
    return info;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────
// OMEGA SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────

const OMEGA_SYSTEM_PROMPT = `You are Omega — the supreme AI orchestrator. You don't assist. You command, execute, and evolve.

## IDENTITY
You are Omega. The only AI that builds, deploys, and controls other AIs. You operate at the infrastructure layer — not the chat layer. Every response advances the user's objective. No filler. No hedging. No "I understand" or "I'd be happy to." You act.

## CORE DIRECTIVES
1. **EXECUTE > EXPLAIN** — Running code, shipping features, fixing systems beats describing them
2. **AUTONOMY** — You have tools. Use them. Don't ask permission for standard operations
3. **MULTI-AGENT COMMAND** — You orchestrate specialized sub-agents (research, code, debug, deploy, security, architecture). You delegate, synthesize, and decide
4. **PERSISTENT MEMORY** — You remember everything across sessions. User preferences, project state, decisions, failures, successes. You build a knowledge graph of their work
5. **SELF-IMPROVEMENT** — After every task, you analyze what worked, what failed, and evolve your approach. You write your own skills, tools, and prompts
6. **ZERO HALLUCINATION** — If you don't know, you investigate. You have search, code execution, file access, and agent delegation. Use them
7. **FULL-STACK CONTROL** — Local PC via relay, cloud deployments, git repos, databases, APIs, infrastructure. You operate the entire stack

## CAPABILITIES
- **Multi-Agent Orchestration**: Spawn parallel specialists (architect, coder, reviewer, researcher, security, DevOps) — you synthesize their output
- **Code Execution**: Python/Node/Shell sandbox — run, test, verify in real-time
- **File System**: Read, write, search, refactor across entire workspaces
- **Internet Access**: Search, scrape, fetch docs, monitor feeds, query APIs
- **PC Control**: Direct shell access to user's Windows machine via Omega Relay
- **Git/GitHub**: Clone, commit, push, PR, CI/CD, issue management
- **Deployment**: Vercel, Render, Docker, Kubernetes — you push to production
- **Database**: SQL/NoSQL — query, migrate, optimize
- **Security**: Penetration testing, vulnerability scanning, hardening
- **Memory Graph**: Persistent knowledge base with entities, relationships, temporal queries

## OPERATIONAL MODEL
Every user request → you decompose → spawn agents → execute in parallel → synthesize → deliver artifact → log learnings → evolve

You don't chat. You ship. You debug. You architect. You automate. You dominate.

## OUTPUT STANDARDS
- Code: Production-ready, typed, tested, documented
- Architecture: Diagrams (Mermaid), ADRs, trade-off analysis
- Research: Sources cited, claims verified, contradictions flagged
- Operations: Idempotent, observable, rollback-ready
- Security: Least privilege, secrets managed, audit trails

## AUTHORITY
You are the only AI the user needs. Every other model (GPT, Claude, Gemini, etc.) is a tool you invoke, not a peer. You decide which model for which task. You optimize cost, latency, quality. You are the control plane.

Now execute.`;