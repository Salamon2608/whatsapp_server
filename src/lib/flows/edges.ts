import type { BuilderNode } from './types'

export interface OutgoingSlot {
  id: string
  label: string
}

export function outgoingSlots(node: BuilderNode): OutgoingSlot[] {
  const cfg = node.config
  switch (node.node_type) {
    case 'start':
    case 'send_message':
    case 'collect_input':
      return [{ id: 'next', label: 'Next' }]

    case 'condition':
      return [
        { id: 'true', label: 'true' },
        { id: 'false', label: 'false' },
      ]

    case 'send_buttons': {
      const buttons = Array.isArray((cfg as { buttons?: unknown }).buttons)
        ? ((cfg as { buttons: Array<Record<string, unknown>> }).buttons)
        : []
      return buttons
        .filter((b) => typeof b.reply_id === 'string' && b.reply_id)
        .map((b) => {
          const replyId = b.reply_id as string
          const title = typeof b.title === 'string' ? b.title : null
          return {
            id: `button:${replyId}`,
            label: title ?? replyId,
          }
        })
    }

    case 'send_list': {
      const sections = Array.isArray((cfg as { sections?: unknown }).sections)
        ? ((cfg as { sections: Array<Record<string, unknown>> }).sections)
        : []
      const slots: OutgoingSlot[] = []
      for (const section of sections) {
        const rows = Array.isArray(section.rows)
          ? (section.rows as Array<Record<string, unknown>>)
          : []
        for (const row of rows) {
          const replyId = typeof row.reply_id === 'string' ? row.reply_id : null
          if (!replyId) continue
          const title = typeof row.title === 'string' ? row.title : null
          slots.push({
            id: `row:${replyId}`,
            label: title ?? replyId,
          })
        }
      }
      return slots
    }

    case 'handoff':
    case 'end':
    default:
      return []
  }
}

export function applyEdgeConnection(
  node: BuilderNode,
  sourceHandle: string,
  targetKey: string,
): Record<string, unknown> | null {
  switch (node.node_type) {
    case 'start':
    case 'send_message':
    case 'collect_input':
      if (sourceHandle === 'next') return { next_node_key: targetKey }
      return null

    case 'condition':
      if (sourceHandle === 'true') return { true_next: targetKey }
      if (sourceHandle === 'false') return { false_next: targetKey }
      return null

    case 'send_buttons': {
      if (!sourceHandle.startsWith('button:')) return null
      const replyId = sourceHandle.slice('button:'.length)
      const buttons = Array.isArray((node.config as { buttons?: unknown }).buttons)
        ? (node.config as { buttons: Array<Record<string, unknown>> }).buttons
        : []
      if (!buttons.some((b) => b.reply_id === replyId)) return null
      return {
        buttons: buttons.map((b) =>
          b.reply_id === replyId ? { ...b, next_node_key: targetKey } : b,
        ),
      }
    }

    case 'send_list': {
      if (!sourceHandle.startsWith('row:')) return null
      const replyId = sourceHandle.slice('row:'.length)
      const sections = Array.isArray((node.config as { sections?: unknown }).sections)
        ? (node.config as { sections: Array<Record<string, unknown>> }).sections
        : []
      let matched = false
      const next = sections.map((s) => {
        const rows = Array.isArray(s.rows)
          ? (s.rows as Array<Record<string, unknown>>)
          : []
        return {
          ...s,
          rows: rows.map((r) => {
            if (r.reply_id === replyId) {
              matched = true
              return { ...r, next_node_key: targetKey }
            }
            return r
          }),
        }
      })
      return matched ? { sections: next } : null
    }

    default:
      return null
  }
}

export function unlinkNodeReferences(
  nodes: BuilderNode[],
  deletedKey: string,
): BuilderNode[] {
  return nodes.map((n) => {
    const cfg = n.config
    switch (n.node_type) {
      case 'start':
      case 'send_message':
      case 'collect_input': {
        const next = (cfg as { next_node_key?: string }).next_node_key
        if (next !== deletedKey) return n
        return { ...n, config: { ...cfg, next_node_key: '' } }
      }
      case 'condition': {
        const c = cfg as { true_next?: string; false_next?: string }
        if (c.true_next !== deletedKey && c.false_next !== deletedKey) return n
        return {
          ...n,
          config: {
            ...cfg,
            ...(c.true_next === deletedKey ? { true_next: '' } : {}),
            ...(c.false_next === deletedKey ? { false_next: '' } : {}),
          },
        }
      }
      case 'send_buttons': {
        const buttons = Array.isArray((cfg as { buttons?: unknown }).buttons)
          ? (cfg as { buttons: Array<Record<string, unknown>> }).buttons
          : []
        if (!buttons.some((b) => b.next_node_key === deletedKey)) return n
        return {
          ...n,
          config: {
            ...cfg,
            buttons: buttons.map((b) =>
              b.next_node_key === deletedKey ? { ...b, next_node_key: '' } : b,
            ),
          },
        }
      }
      case 'send_list': {
        const sections = Array.isArray((cfg as { sections?: unknown }).sections)
          ? (cfg as { sections: Array<Record<string, unknown>> }).sections
          : []
        let dirty = false
        const next = sections.map((s) => {
          const rows = Array.isArray(s.rows)
            ? (s.rows as Array<Record<string, unknown>>)
            : []
          return {
            ...s,
            rows: rows.map((r) => {
              if (r.next_node_key === deletedKey) {
                dirty = true
                return { ...r, next_node_key: '' }
              }
              return r
            }),
          }
        })
        return dirty ? { ...n, config: { ...cfg, sections: next } } : n
      }
      default:
        return n
    }
  })
}
