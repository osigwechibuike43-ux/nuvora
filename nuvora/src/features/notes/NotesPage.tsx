import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pin, PinOff, Trash2, Sparkles, Plus, Search, X } from "lucide-react";
import { Card, PageSpinner } from "@/components/ui/Primitives";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import { createNote, deleteNote, getNotes, updateNote, type Note } from "@/services/learning/notesService";

export function NotesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getNotes(user.id)
      .then(setNotes)
      .catch(() => setError(true));
  }, [user]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    (notes ?? []).forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      const matchesQuery = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      const matchesTag = !activeTag || n.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [notes, query, activeTag]);

  function upsertLocal(note: Note) {
    setNotes((prev) => {
      if (!prev) return [note];
      const exists = prev.some((n) => n.id === note.id);
      const next = exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
      return next.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.updated_at.localeCompare(a.updated_at));
    });
  }

  async function handleTogglePin(note: Note) {
    try {
      const updated = await updateNote(note.id, { is_pinned: !note.is_pinned });
      upsertLocal(updated);
    } catch {
      showToast("Couldn't update the note. Please try again.", "error");
    }
  }

  async function handleDelete(note: Note) {
    try {
      await deleteNote(note.id);
      setNotes((prev) => (prev ? prev.filter((n) => n.id !== note.id) : prev));
      showToast("Note deleted.", "success");
    } catch {
      showToast("Couldn't delete the note. Please try again.", "error");
    }
  }

  if (error) return <ErrorState message="We couldn't load your notes." />;
  if (notes === null) return <PageSpinner label="Loading your notes" />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Knowledge Vault</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setIsComposerOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New note
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nuvora-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your notes…"
            className="h-10 w-full rounded-xl border border-nuvora-border bg-nuvora-card pl-9 pr-3 text-sm placeholder:text-nuvora-muted focus:outline-none focus:ring-2 focus:ring-nuvora-green"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag((t) => (t === tag ? null : tag))}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  activeTag === tag
                    ? "border-nuvora-green bg-nuvora-green/10 text-nuvora-green"
                    : "border-nuvora-border text-nuvora-muted"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {isComposerOpen && (
        <NoteComposer
          note={editing}
          onCancel={() => setIsComposerOpen(false)}
          onSaved={(note) => {
            upsertLocal(note);
            setIsComposerOpen(false);
          }}
        />
      )}

      {filteredNotes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Save important ideas while you learn."
            message="Notes you take here stay searchable, taggable, and ready to discuss with the AI Tutor."
            action={
              <Button size="sm" onClick={() => setIsComposerOpen(true)}>
                <Plus className="h-4 w-4" /> Create note
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{note.title}</p>
                <button
                  onClick={() => handleTogglePin(note)}
                  className="-m-1.5 shrink-0 rounded-lg p-1.5 text-nuvora-muted hover:bg-white/5 hover:text-nuvora-green"
                  aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
                >
                  {note.is_pinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 line-clamp-4 text-sm text-nuvora-muted">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-nuvora-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-nuvora-border pt-3">
                <button
                  onClick={() => {
                    setEditing(note);
                    setIsComposerOpen(true);
                  }}
                  className="rounded-lg px-2 py-1.5 text-xs text-nuvora-muted hover:bg-white/5 hover:text-nuvora-white"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    navigate("/tutor", {
                      state: { prefillMessage: `Here's a note I wrote: "${note.content}". Can you help me understand it better?` },
                    })
                  }
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-nuvora-green hover:bg-nuvora-green/10"
                >
                  <Sparkles className="h-3 w-3" /> Ask AI Tutor
                </button>
                <button
                  onClick={() => handleDelete(note)}
                  className="ml-auto rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteComposer({
  note,
  onCancel,
  onSaved,
}: {
  note: Note | null;
  onCancel: () => void;
  onSaved: (note: Note) => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tagsInput, setTagsInput] = useState(note?.tags.join(", ") ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const saved = note
        ? await updateNote(note.id, { title: title.trim() || "Untitled note", content: content.trim(), tags })
        : await createNote(user.id, { title: title.trim(), content: content.trim(), tags });
      onSaved(saved);
      showToast(note ? "Note updated." : "Note saved.", "success");
    } catch {
      showToast("Couldn't save your note. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="mb-5 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="flex-1 bg-transparent text-sm font-medium placeholder:text-nuvora-muted focus:outline-none"
          />
          <button type="button" onClick={onCancel} aria-label="Close" className="text-nuvora-muted hover:text-nuvora-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write what you want to remember…"
          rows={4}
          className="rounded-lg border border-nuvora-border bg-nuvora-surface p-3 text-sm placeholder:text-nuvora-muted focus:outline-none focus:ring-2 focus:ring-nuvora-green"
        />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags, comma separated (e.g. javascript, closures)"
          className="rounded-lg border border-nuvora-border bg-nuvora-surface px-3 py-2 text-xs placeholder:text-nuvora-muted focus:outline-none focus:ring-2 focus:ring-nuvora-green"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSaving} disabled={!content.trim()}>
            Save note
          </Button>
        </div>
      </form>
    </Card>
  );
}
