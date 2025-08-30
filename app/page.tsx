"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, History, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RobotMascot } from "@/components/robot-mascot";
import { ThemeToggle } from "@/components/theme-toggle";
import { PromptOutput } from "@/components/prompt-output";
import { HistoryList, type HistoryItem } from "@/components/history-list";
import { useToast } from "@/hooks/use-toast";

const categories = ["Writing", "Coding", "Art", "Fun", "Business", "Education"];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Fun");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setMounted(true); // marks that client has mounted
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // set initial width
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("prompt-history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("prompt-history", JSON.stringify(history));
  }, [history]);

  // Handle typing detection
  useEffect(() => {
    if (topic.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [topic]);

  const generatePrompt = async () => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "I need something to work with! 🤖",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        prompt: data.prompt,
        topic: topic.trim(),
        category: selectedCategory,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]); // Keep last 50 items

      toast({
        title: "Prompt generated! ✨",
        description: "Your AI prompt is ready to use!",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (prompt: string) => {
    toast({
      title: "Copied to clipboard! 📋",
      description: "Ready to paste into your AI tool!",
    });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Deleted from history",
      description: "Prompt removed successfully.",
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast({
      title: "History cleared",
      description: "All prompts have been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Prompt Generator
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {history.length}
                </Badge>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center mb-6">
                <RobotMascot
                  isTyping={isTyping}
                  isGenerating={isGenerating}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-3xl font-bold text-balance">
                Generate Amazing AI Prompts
              </h2>
              <p className="text-muted-foreground text-balance max-w-2xl mx-auto">
                Tell me what you're working on, and I'll create the perfect
                prompt to get the best results from any AI tool!
              </p>
            </motion.div>

            {/* Input Section */}
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium mb-2"
                  >
                    What would you like to create?
                  </label>
                  <Input
                    id="topic"
                    placeholder="e.g., a sci-fi story about robots, a Python web scraper, a logo design..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generatePrompt()}
                    className="text-base"
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Choose a category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        disabled={isGenerating}
                        className="transition-all duration-200"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generatePrompt}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full text-base py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <motion.div
                    animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isGenerating ? Number.POSITIVE_INFINITY : 0,
                      ease: "linear",
                    }}
                  >
                    <Wand2 className="h-5 w-5 mr-2" />
                  </motion.div>
                  {isGenerating ? "Generating Magic..." : "Generate Prompt"}
                </Button>
              </div>
            </Card>

            {/* Output Section */}
            <AnimatePresence>
              {generatedPrompt && (
                <PromptOutput
                  prompt={generatedPrompt}
                  onCopy={() => handleCopy(generatedPrompt)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {mounted && (showHistory || windowWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HistoryList
                    history={history}
                    onCopy={handleCopy}
                    onDelete={handleDeleteHistory}
                    onClear={handleClearHistory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
