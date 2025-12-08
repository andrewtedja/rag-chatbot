"use client";
import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";
import { useChat } from "ai/react";

import { Bubble } from "@/components/Bubble";
import { LoadingBubble } from "@/components/LoadingBubble";
import { PromptSuggestionsRow } from "@/components/PromptSuggestionsRow";
import { HibernationWarning } from "@/components/HibernationWarning";
import Navbar from "@/components/Navbar";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const {
		isLoading,
		messages,
		input,
		handleInputChange,
		handleSubmit,
		setInput,
	} = useChat();

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	const noMessages = messages.length === 0;

	const handlePromptClick = (prompt: string) => {
		setInput(prompt);
		// Auto-submit after setting the prompt
		const form = document.querySelector("form");
		if (form) {
			setTimeout(() => form.requestSubmit(), 0);
		}
	};

	return (
		<div className="flex flex-col h-screen bg-muted">
			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
					<HibernationWarning />
					{noMessages ? (
						<div className="flex-1 flex flex-col items-center justify-center space-y-8">
							<div className="text-center space-y-4">
								<div className="inline-block p-4 bg-linear-to-br from-sky-300 to-indigo-600 rounded-full shadow-2xl">
									<Image src={rogaLogo} alt="Roga" width={80} height={80} />
								</div>
								<h2 className="text-3xl font-bold text-foreground ">
									Halo! Saya RogaBot 👋
								</h2>
								<p className="text-md text-gray-500 max-w-2xl">
									Tempat terbaik untuk tanya-tanya soal ITB, semoga semua
									pertanyaanmu terjawab!
								</p>
							</div>
							<PromptSuggestionsRow onPromptClick={handlePromptClick} />
						</div>
					) : (
						<div className="flex-1 space-y-4 pb-4">
							{messages.map((message, index) => (
								<Bubble key={`message-${index}`} message={message} />
							))}
							{isLoading && <LoadingBubble />}
							<div ref={bottomRef} />
						</div>
					)}
				</div>
			</main>

			{/* Input */}
			<div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border shadow-lg">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<form onSubmit={handleSubmit} className="flex items-center gap-3">
						<input
							className="flex-1 px-4 py-3 rounded-xl bg-background text-foreground border border-border placeholder:text-muted-foreground focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-0 transition disabled:opacity-50 disabled:cursor-not-allowed"
							onChange={handleInputChange}
							value={input}
							placeholder="Ask me something about ITB..."
							disabled={isLoading}
						/>

						<button
							type="submit"
							disabled={!input.trim() || isLoading}
							className="p-3 rounded-xl cursor-pointer bg-indigo-300 text-white hover:bg-indigo-400 active:scale-95 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-300"
						>
							<Send size={20} />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
