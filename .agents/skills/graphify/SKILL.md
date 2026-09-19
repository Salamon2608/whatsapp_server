---
name: graphify
description: "Use this skill to interact with the local Graphify knowledge graph via MCP. The Graphify MCP provides tools for semantic codebase search, dependency graphing, and structural queries."
---

# Graphify Integration

This project uses Graphify to maintain a semantic knowledge graph of the codebase. The graph is accessible via the local MCP server defined in `.agents/mcp_config.json`.

When you need to understand project structure, find dependencies, or locate components:
1. Ensure the Graphify MCP tools are available (e.g. `query_graph`, `get_node`).
2. Use these tools instead of manually `grep`ing through the entire codebase, as the graph provides structural, linked insights.

To manually rebuild the graph if it gets out of date, run:
```bash
.\venv\Scripts\python -m graphify build .
```
