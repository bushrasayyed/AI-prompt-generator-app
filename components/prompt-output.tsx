"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PromptOutputProps {
  prompt: string
  onCopy?: () => void
}

export function PromptOutput({ prompt, onCopy }: PromptOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="p-6 space-y-4 bg-gradient-to-br from-card to-accent/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Generated Prompt</h3>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="relative overflow-hidden hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
          >
            <motion.div
              animate={{ scale: copied ? 0 : 1, opacity: copied ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </motion.div>
            <motion.div
              animate={{ scale: copied ? 1 : 0, opacity: copied ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Copied!
            </motion.div>
          </Button>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 border">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{prompt}</p>
        </div>
      </Card>
    </motion.div>
  )
}
