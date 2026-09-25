"use client"

import { useState } from "react"
import { Trash2, StickyNote } from "lucide-react"
import { useStore } from "@/lib/store"
import type { Project } from "@/lib/types"
import { formatDate } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function NotesTab({ project }: { project: Project }) {
  const { addNote, deleteNote } = useStore()
  const [content, setContent] = useState("")

  const handleAdd = () => {
    if (!content.trim()) return
    addNote(project.id, content.trim())
    setContent("")
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-3 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note about this project..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={!content.trim()}>
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {project.notes.length === 0 ? (
        <Empty className="rounded-lg border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <StickyNote />
            </EmptyMedia>
            <EmptyTitle>No notes yet</EmptyTitle>
            <EmptyDescription>
              Keep track of client conversations and decisions here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {project.notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="flex flex-col gap-1">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.date)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteNote(project.id, note.id)}
                  aria-label="Delete note"
                >
                  <Trash2 />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
