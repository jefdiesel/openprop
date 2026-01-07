'use client'

import { useState, useEffect } from 'react'
import { CommentBubble } from './comment-bubble'
import { CommentInput } from './comment-input'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Comment {
  id: string
  content: string
  resolved: boolean
  createdAt: Date
  blockId: string | null
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  replies?: Comment[]
}

interface CommentThreadProps {
  documentId: string
  blockId?: string | null
  currentUserId: string
  onClose?: () => void
}

export function CommentThread({
  documentId,
  blockId,
  currentUserId,
  onClose,
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      const url = blockId
        ? `/api/documents/${documentId}/comments?blockId=${blockId}`
        : `/api/documents/${documentId}/comments`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [documentId, blockId])

  const handleAddComment = async (content: string, parentId?: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, blockId, parentId }),
      })
      if (res.ok) {
        await fetchComments()
        setReplyingTo(null)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleResolve = async (commentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true }),
      })
      if (res.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const unresolvedCount = comments.filter((c) => !c.resolved).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium">Comments</span>
          {unresolvedCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {unresolvedCount}
            </span>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No comments yet. Start a conversation!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentBubble
                comment={comment}
                currentUserId={currentUserId}
                onReply={(id) => setReplyingTo(id)}
                onResolve={handleResolve}
                onDelete={handleDelete}
              />
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <CommentInput
                    onSubmit={(content) => handleAddComment(content, comment.id)}
                    onCancel={() => setReplyingTo(null)}
                    placeholder="Write a reply..."
                    autoFocus
                    isReply
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4">
        <CommentInput
          onSubmit={(content) => handleAddComment(content)}
          placeholder={blockId ? 'Comment on this block...' : 'Add a comment...'}
        />
      </div>
    </div>
  )
}
