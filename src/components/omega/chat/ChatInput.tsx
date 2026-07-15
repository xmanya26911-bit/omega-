"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Globe,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Square,
} from "lucide-react";
import { useChatStore } from "../store/chat-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200; // ~6 rows

interface ToolbarButtonProps {
  "aria-label": string;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

function ToolbarButton({
  "aria-label": ariaLabel,
  active = false,
  disabled = false,
  tooltip,
  onClick,
  children,
  className,
}: ToolbarButtonProps) {
  const btn = (
    <button
      type="button"
      data-cursor="hover"
      aria-label={ariaLabel}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--omega-ring)]",
        disabled
          ? "cursor-not-allowed text-[var(--omega-muted)] opacity-50"
          : active
            ? "bg-[oklch(0.82_0.17_162_/_0.14)] text-[var(--omega-emerald)]"
            : "text-[var(--omega-fg-dim)] hover:bg-[oklch(0.82_0.17_162_/_0.08)] hover:text-[var(--omega-fg)]",
        className
      )}
    >
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="omega-glass border-[var(--omega-glass-border)] bg-[var(--omega-bg-2)] text-[var(--omega-fg)]"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

/**
 * ChatInput — auto-resizing textarea + bottom toolbar.
 *  - Enter to send, Shift+Enter for newline
 *  - search toggle reads/writes searchEnabled
 *  - upload / image / voice are disabled with "coming soon" tooltips
 *  - send button becomes a stop button while streaming
 */
export function ChatInput() {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isStreaming = useChatStore((s) => s.isStreaming);
  const searchEnabled = useChatStore((s) => s.searchEnabled);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopGeneration = useChatStore((s) => s.stopGeneration);
  const toggleSearch = useChatStore((s) => s.toggleSearch);

  // Auto-resize the textarea on input.
  const autoResize = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";
  }, []);

  React.useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  const canSend = text.trim().length > 0 && !isStreaming;

  const handleSubmit = () => {
    if (!canSend) return;
    const value = text;
    setText("");
    // reset height on next tick
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    });
    void sendMessage(value, {
      onAuthError: () => {
        // surface to auth store via global hook elsewhere; here just stop
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* top gradient fade suggestion */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-0 right-0 h-6"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--omega-bg) 90%)",
        }}
      />

      <div
        className={cn(
          "omega-glass rounded-2xl p-2.5",
          "transition-all duration-300",
          "focus-within:border-[oklch(0.82_0.17_162_/_0.4)]"
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          data-cursor="hover"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          rows={1}
          placeholder="Message Omega…"
          aria-label="Message input"
          className={cn(
            "block max-h-[200px] w-full resize-none bg-transparent px-2 py-1.5",
            "text-sm leading-relaxed text-[var(--omega-fg)]",
            "placeholder:text-[var(--omega-muted)]",
            "focus:outline-none omega-scrollbar-hide"
          )}
          style={{ minHeight: "28px" }}
        />

        {/* Toolbar */}
        <div className="mt-1 flex items-center gap-1">
          <ToolbarButton
            aria-label="Toggle web search"
            tooltip="Web search"
            active={searchEnabled}
            onClick={toggleSearch}
          >
            <Globe className="size-4" strokeWidth={2} />
          </ToolbarButton>

          <ToolbarButton
            aria-label="Upload file"
            tooltip="Coming soon"
            disabled
          >
            <Paperclip className="size-4" strokeWidth={2} />
          </ToolbarButton>

          <ToolbarButton
            aria-label="Attach image"
            tooltip="Coming soon"
            disabled
          >
            <ImageIcon className="size-4" strokeWidth={2} />
          </ToolbarButton>

          <ToolbarButton
            aria-label="Voice input"
            tooltip="Coming soon"
            disabled
          >
            <Mic className="size-4" strokeWidth={2} />
          </ToolbarButton>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Send / Stop */}
          {isStreaming ? (
            <motion.button
              key="stop"
              type="button"
              data-cursor="hover"
              aria-label="Stop generation"
              onClick={stopGeneration}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg",
                "bg-[oklch(0.7_0.21_14_/_0.16)] text-[var(--omega-rose)]",
                "border border-[oklch(0.7_0.21_14_/_0.4)]",
                "transition-colors duration-200 hover:bg-[oklch(0.7_0.21_14_/_0.26)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.7_0.21_14_/_0.5)]"
              )}
            >
              <Square className="size-3.5 fill-current" strokeWidth={0} />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              type="button"
              data-cursor="hover"
              aria-label="Send message"
              disabled={!canSend}
              onClick={handleSubmit}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--omega-ring)]",
                canSend
                  ? "bg-[var(--omega-emerald)] text-[oklch(0.06_0.01_264)] shadow-[0_6px_24px_-8px_oklch(0.82_0.17_162_/_0.7)] hover:bg-[oklch(0.88_0.15_162)]"
                  : "cursor-not-allowed bg-[oklch(0.2_0.012_264_/_0.5)] text-[var(--omega-muted)]"
              )}
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </motion.button>
          )}
        </div>
      </div>

      {/* helper hint */}
      <div className="mt-1.5 px-1 text-center font-mono text-[10px] text-[var(--omega-muted)]">
        <kbd className="font-mono">Enter</kbd> to send ·{" "}
        <kbd className="font-mono">Shift+Enter</kbd> for newline
      </div>
    </div>
  );
}

export default ChatInput;
