"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface RobotMascotProps {
  isTyping?: boolean
  isGenerating?: boolean
  className?: string
}

export function RobotMascot({ isTyping = false, isGenerating = false, className = "" }: RobotMascotProps) {
  const [shouldBlink, setShouldBlink] = useState(false)
  const [shouldWave, setShouldWave] = useState(false)

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShouldBlink(true)
      setTimeout(() => setShouldBlink(false), 200)
    }, 3000)

    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    if (isTyping) {
      setShouldWave(true)
      setTimeout(() => setShouldWave(false), 500)
    }
  }, [isTyping])

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{
          y: isGenerating ? [-5, 5, -5] : [0, -8, 0],
        }}
        transition={{
          duration: isGenerating ? 0.5 : 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <svg
          width="120"
          height="140"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Robot Base Platform */}
          <ellipse cx="60" cy="130" rx="35" ry="8" fill="#E5E7EB" opacity="0.6" />

          {/* Robot Body */}
          <ellipse cx="60" cy="95" rx="28" ry="35" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />

          {/* Robot Head */}
          <circle cx="60" cy="45" r="32" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />

          {/* Head Top Accent */}
          <ellipse cx="60" cy="20" rx="20" ry="8" fill="#6EE7B7" />

          {/* Face Screen */}
          <ellipse cx="60" cy="45" rx="22" ry="18" fill="#1F2937" />

          {/* Eyes */}
          <motion.ellipse
            cx="50"
            cy="42"
            rx="6"
            ry={shouldBlink ? "1" : "4"}
            fill="#00D9FF"
            animate={{
              scaleY: shouldBlink ? 0.2 : 1,
            }}
            transition={{ duration: 0.1 }}
          />
          <motion.ellipse
            cx="70"
            cy="42"
            rx="6"
            ry={shouldBlink ? "1" : "4"}
            fill="#00D9FF"
            animate={{
              scaleY: shouldBlink ? 0.2 : 1,
            }}
            transition={{ duration: 0.1 }}
          />

          {/* Eye Glow Effect */}
          {isGenerating && (
            <>
              <ellipse cx="50" cy="42" rx="8" ry="6" fill="#00D9FF" opacity="0.3" />
              <ellipse cx="70" cy="42" rx="8" ry="6" fill="#00D9FF" opacity="0.3" />
            </>
          )}

          {/* Left Arm */}
          <motion.ellipse
            cx="25"
            cy="75"
            rx="8"
            ry="15"
            fill="#6EE7B7"
            animate={{
              rotate: shouldWave ? [-10, 10, -10, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: "25px 60px" }}
          />

          {/* Right Arm */}
          <ellipse cx="95" cy="75" rx="8" ry="15" fill="#6EE7B7" />

          {/* Body Accent */}
          <ellipse cx="60" cy="80" rx="15" ry="20" fill="#6EE7B7" opacity="0.7" />

          {/* Chest Panel */}
          <rect x="50" y="85" width="20" height="15" rx="3" fill="#E5E7EB" />

          {/* Status Light */}
          <motion.circle
            cx="60"
            cy="92"
            r="2"
            fill={isGenerating ? "#10B981" : "#6B7280"}
            animate={{
              scale: isGenerating ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 0.8,
              repeat: isGenerating ? Number.POSITIVE_INFINITY : 0,
            }}
          />
        </svg>
      </motion.div>

      {/* Typing Indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            Thinking...
          </div>
        </motion.div>
      )}
    </div>
  )
}
