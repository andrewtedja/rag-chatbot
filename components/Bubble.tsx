import { Message } from "ai";
import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";

// ini buat markdown
import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

interface BubbleProps {
	message: Message;
}

export const Bubble = ({ message }: BubbleProps) => {
	const isUser = message.role === "user";
	if (!message?.content?.trim()) return null;

	return (
		<div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
			<div
				className={`
          shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md
          border border-border
          ${isUser ? "bg-indigo-400 text-white" : "bg-muted"}
        `}
			>
				{isUser ? (
					<span className="font-bold text-sm">You</span>
				) : (
					<Image
						src={rogaLogo}
						alt="Roga"
						width={40}
						height={40}
						className="rounded-full"
					/>
				)}
			</div>

			<div
				className={`
          relative max-w-xl px-5 py-3.5 rounded-2xl shadow-md border border-border
          text-foreground
          ${isUser ? "bg-card rounded-br-md" : "bg-card rounded-bl-md"}
        `}
			>
				<div className="prose prose-sm dark:prose-invert max-w-none [&_a]:text-blue-500 [&_a]:underline hover:[&_a]:text-blue-600 dark:[&_a]:text-blue-400 dark:hover:[&_a]:text-blue-300">
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{message.content}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
};
