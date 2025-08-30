"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Copy, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface HistoryItem {
  id: string;
  prompt: string;
  topic: string;
  category: string;
  timestamp: number;
}

interface HistoryListProps {
  history: HistoryItem[];
  onCopy: (prompt: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const categories = [
  "All",
  "Writing",
  "Coding",
  "Art",
  "Fun",
  "Business",
  "Education",
];

export function HistoryList({
  history,
  onCopy,
  onDelete,
  onClear,
}: HistoryListProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredHistory = history.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Prompt History
        </h3>
        {history.length > 0 && (
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2 " />
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className="text-xs"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* History Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              {selectedCategory === "All"
                ? "No prompts generated yet"
                : `No ${selectedCategory.toLowerCase()} prompts found`}
            </motion.div>
          ) : (
            filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-muted/30 rounded-lg p-4 space-y-2 border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1 truncate">
                      {item.topic}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => onCopy(item.prompt)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => onDelete(item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
