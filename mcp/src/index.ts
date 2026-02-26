#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new McpServer({
  name: "abeja",
  version: "1.0.0",
});

// --- list_domains ---
server.tool(
  "list_domains",
  "List all domains with their spaces and task counts",
  {},
  async () => {
    const domains = await prisma.domain.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        spaces: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { tasks: { where: { status: "open" } } } } },
        },
      },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(domains.map(d => ({
        id: d.id, name: d.name, slug: d.slug, color: d.color,
        spaces: d.spaces.map(s => ({
          id: s.id, name: s.name, slug: s.slug, color: s.color,
          openTasks: s._count.tasks,
        })),
      })), null, 2) }],
    };
  }
);

// --- list_spaces ---
server.tool(
  "list_spaces",
  "List spaces, optionally filtered by domain slug",
  { domain: z.string().optional().describe("Domain slug to filter by") },
  async ({ domain }) => {
    const where = domain ? { domain: { slug: domain } } : {};
    const spaces = await prisma.space.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        domain: { select: { name: true, slug: true } },
        _count: { select: { tasks: { where: { status: "open" } }, contacts: true, documents: true } },
      },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(spaces.map(s => ({
        id: s.id, name: s.name, slug: s.slug, color: s.color,
        domain: s.domain.name,
        openTasks: s._count.tasks,
        contacts: s._count.contacts,
        documents: s._count.documents,
      })), null, 2) }],
    };
  }
);

// --- list_tasks ---
server.tool(
  "list_tasks",
  "List tasks for a space, optionally filtered by status",
  {
    space: z.string().describe("Space slug"),
    status: z.string().optional().describe("Filter by status: 'open' or 'done'"),
  },
  async ({ space, status }) => {
    const where: Record<string, unknown> = { space: { slug: space } };
    if (status) where.status = status;
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true, documents: true } } },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(tasks.map(t => ({
        id: t.id, title: t.title, body: t.body.substring(0, 200),
        type: t.type, assignee: t.assignee, status: t.status,
        tags: t.tags, deadline: t.deadline, capRef: t.capRef,
        createdAt: t.createdAt, completedAt: t.completedAt,
        comments: t._count.comments, documents: t._count.documents,
      })), null, 2) }],
    };
  }
);

// --- get_task ---
server.tool(
  "get_task",
  "Get full details of a task including comments and documents",
  { id: z.number().describe("Task ID") },
  async ({ id }) => {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        space: { include: { domain: { select: { name: true, slug: true } } } },
        comments: { orderBy: { createdAt: "asc" } },
        documents: { include: { document: true } },
      },
    });
    if (!task) return { content: [{ type: "text", text: "Task not found" }] };
    return {
      content: [{ type: "text", text: JSON.stringify({
        id: task.id, title: task.title, body: task.body,
        type: task.type, assignee: task.assignee, status: task.status,
        tags: task.tags, deadline: task.deadline, capRef: task.capRef,
        createdAt: task.createdAt, completedAt: task.completedAt,
        space: { name: task.space.name, slug: task.space.slug, domain: task.space.domain.name },
        comments: task.comments.map(c => ({
          id: c.id, body: c.body, author: c.author, authorType: c.authorType,
          createdAt: c.createdAt,
        })),
        documents: task.documents.map(td => ({
          id: td.document.id, name: td.document.name,
          url: td.document.url, mimeType: td.document.mimeType,
        })),
      }, null, 2) }],
    };
  }
);

// --- create_task ---
server.tool(
  "create_task",
  "Create a new task in a space",
  {
    space: z.string().describe("Space slug"),
    body: z.string().describe("Task description"),
    title: z.string().optional().describe("Task title (auto-generated if not provided)"),
    type: z.string().optional().describe("Task type (default: 'normal')"),
    assignee: z.string().optional().describe("Person responsible"),
    tags: z.array(z.string()).optional().describe("Tags for the task"),
    deadline: z.string().optional().describe("Deadline as ISO date string"),
  },
  async ({ space, body, title, type, assignee, tags, deadline }) => {
    const spaceRecord = await prisma.space.findFirst({ where: { slug: space } });
    if (!spaceRecord) return { content: [{ type: "text", text: `Space '${space}' not found` }] };

    const lastTask = await prisma.task.findFirst({
      where: { capRef: { not: null } },
      orderBy: { capRef: "desc" },
    });
    const lastNum = lastTask?.capRef ? parseInt(lastTask.capRef.replace("cap-", "")) : 0;
    const capRef = `cap-${String(lastNum + 1).padStart(3, "0")}`;

    const autoTitle = title || body.split(/[.\n]/)[0].trim().substring(0, 80);

    const task = await prisma.task.create({
      data: {
        spaceId: spaceRecord.id,
        title: autoTitle,
        body,
        type: type || "normal",
        assignee: assignee || null,
        tags: tags || [],
        status: "open",
        deadline: deadline ? new Date(deadline) : null,
        source: "mcp",
        capRef,
      },
    });

    return { content: [{ type: "text", text: JSON.stringify({ ok: true, task: { id: task.id, title: task.title, capRef: task.capRef } }) }] };
  }
);

// --- update_task ---
server.tool(
  "update_task",
  "Update a task's status, assignee, type, or other fields",
  {
    id: z.number().describe("Task ID"),
    status: z.string().optional().describe("New status: 'open' or 'done'"),
    assignee: z.string().optional().describe("New assignee"),
    type: z.string().optional().describe("New task type"),
    title: z.string().optional().describe("New title"),
    body: z.string().optional().describe("New body"),
    tags: z.array(z.string()).optional().describe("New tags"),
    deadline: z.string().optional().describe("New deadline as ISO date string"),
  },
  async ({ id, status, assignee, type: taskType, title, body, tags, deadline }) => {
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (assignee !== undefined) data.assignee = assignee;
    if (taskType !== undefined) data.type = taskType;
    if (title !== undefined) data.title = title;
    if (body !== undefined) data.body = body;
    if (tags !== undefined) data.tags = tags;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (status === "done") data.completedAt = new Date();

    const task = await prisma.task.update({ where: { id }, data });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, task: { id: task.id, status: task.status, title: task.title } }) }] };
  }
);

// --- add_comment ---
server.tool(
  "add_comment",
  "Add a comment to a task",
  {
    task_id: z.number().describe("Task ID"),
    body: z.string().describe("Comment text"),
    author: z.string().optional().describe("Author name (default: 'agent')"),
  },
  async ({ task_id, body, author }) => {
    const comment = await prisma.comment.create({
      data: {
        taskId: task_id,
        body,
        author: author || "agent",
        authorType: author ? "human" : "agent",
      },
    });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, comment: { id: comment.id } }) }] };
  }
);

// --- add_document ---
server.tool(
  "add_document",
  "Add a document to a space",
  {
    space: z.string().describe("Space slug"),
    name: z.string().describe("Document name"),
    url: z.string().describe("Document URL"),
    mimeType: z.string().optional().describe("MIME type"),
  },
  async ({ space, name, url, mimeType }) => {
    const spaceRecord = await prisma.space.findFirst({ where: { slug: space } });
    if (!spaceRecord) return { content: [{ type: "text", text: `Space '${space}' not found` }] };

    const doc = await prisma.document.create({
      data: {
        spaceId: spaceRecord.id,
        name,
        url,
        mimeType: mimeType || null,
      },
    });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, document: { id: doc.id, name: doc.name } }) }] };
  }
);

// --- link_document ---
server.tool(
  "link_document",
  "Link an existing document to a task",
  {
    task_id: z.number().describe("Task ID"),
    document_id: z.number().describe("Document ID"),
  },
  async ({ task_id, document_id }) => {
    await prisma.taskDocument.create({
      data: { taskId: task_id, documentId: document_id },
    });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
  }
);

// --- list_contacts ---
server.tool(
  "list_contacts",
  "List contacts for a space",
  { space: z.string().describe("Space slug") },
  async ({ space }) => {
    const contacts = await prisma.contact.findMany({
      where: { space: { slug: space } },
      orderBy: { name: "asc" },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(contacts.map(c => ({
        id: c.id, name: c.name, role: c.role, email: c.email, phone: c.phone, notes: c.notes,
      })), null, 2) }],
    };
  }
);

// --- add_contact ---
server.tool(
  "add_contact",
  "Add a contact to a space",
  {
    space: z.string().describe("Space slug"),
    name: z.string().describe("Contact name"),
    role: z.string().optional().describe("Contact role"),
    phone: z.string().optional().describe("Phone number"),
    email: z.string().optional().describe("Email address"),
    notes: z.string().optional().describe("Additional notes"),
  },
  async ({ space, name, role, phone, email, notes }) => {
    const spaceRecord = await prisma.space.findFirst({ where: { slug: space } });
    if (!spaceRecord) return { content: [{ type: "text", text: `Space '${space}' not found` }] };

    const contact = await prisma.contact.create({
      data: {
        spaceId: spaceRecord.id,
        name,
        role: role || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
      },
    });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, contact: { id: contact.id, name: contact.name } }) }] };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Abeja MCP server running on stdio");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
