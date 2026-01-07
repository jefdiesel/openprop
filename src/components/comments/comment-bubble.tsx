'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, MessageCircle, MoreHorizontal, Reply, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Comment {
  id: string
  content: string
  resolved: boolean
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  replies?: Comment[]
}

interface CommentBubbleProps {
  comment: Comment
  currentUserId: string
  onReply: (parentId: string) => void
  onResolve: (commentId: string) => void
  onDelete: (commentId: string) => void
  isReply?: boolean
}

export function CommentBubble({
  comment,
  currentUserId,
  onReply,
  onResolve,
  onDelete,
  isReply = false,
}: CommentBubbleProps) {
  const isOwner = comment.user.id === currentUserId
  const initials = comment.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || comment.user.email[0].toUpperCase()

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-8' : ''} ${comment.resolved ? 'opacity-60' : ''}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user.image || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {comment.user.name || comment.user.email}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {comment.resolved && (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
        <div className="flex items-center gap-1 mt-2">
          {!isReply && !comment.resolved && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onReply(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {!isReply && !comment.resolved && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onResolve(comment.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          )}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentBubble
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onResolve={onResolve}
                onDelete={onDelete}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
