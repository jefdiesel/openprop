import { Send } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Send className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold">OpenProposal</span>
      </div>
      {children}
    </div>
  )
}
