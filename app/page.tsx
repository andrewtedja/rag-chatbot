"use client";
import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";
import { useChat } from "ai/react";

import { Bubble } from "@/components/Bubble";
import { LoadingBubble } from "@/components/LoadingBubble";
import { PromptSuggestionsRow } from "@/components/PromptSuggestionsRow";
import { ChangeEvent } from "react";
import Navbar from "@/components/Navbar";
import { Send } from "lucide-react";

export default function Home() {
	const { isLoading, messages, input, handleInputChange, handleSubmit } =
		useChat();

	const noMessages = messages.length === 0;

	return (
		<div className="flex flex-col h-screen bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
			{/* Navbar */}
			<Navbar />

			{/* Main Content Area */}
			<main className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
					{noMessages ? (
						<div className="flex-1 flex flex-col items-center justify-center space-y-8">
							<div className="text-center space-y-4">
								<div className="inline-block p-4 bg-linear-to-br from-sky-300 to-indigo-600 rounded-full shadow-2xl">
									<Image
										src={rogaLogo}
										alt="Roga"
										width={80}
										height={80}
									/>
								</div>
								<h2 className="text-3xl font-bold text-gray-800 dark:text-white">
									Halo! Saya RogaBot 👋
								</h2>
								<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
									The ultimate place for ITB related
									questions, we hope you are informed and
									entertained!
								</p>
							</div>
							<PromptSuggestionsRow
								onPromptClick={(prompt) => {
									handleInputChange({
										target: { value: prompt },
									} as ChangeEvent<HTMLInputElement>);
								}}
							/>
						</div>
					) : (
						<div className="flex-1 space-y-4 pb-4">
							{messages.map((message, index) => (
								<Bubble
									key={`message-${index}`}
									message={message}
								/>
							))}
							{isLoading && <LoadingBubble />}
						</div>
					)}
				</div>
			</main>

			{/* Fixed Input Area */}
			<div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-blue-100 dark:border-gray-700 shadow-lg">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<form
						onSubmit={handleSubmit}
						className="flex items-center gap-3"
					>
						<input
							className="
							flex-1 px-4 py-3 
							rounded-xl border border-indigo-300 
							bg-white dark:bg-gray-800
							text-gray-900 dark:text-gray-100
							placeholder:text-gray-400 dark:placeholder:text-gray-500
							focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
							transition
							"
							onChange={handleInputChange}
							value={input}
							placeholder="Ask me something about ITB..."
						/>

						<button
							type="submit"
							disabled={!input.trim()}
							className="
								p-3 rounded-xl cursor-pointer
								bg-indigo-300 text-white 
								hover:bg-indigo-400 
								active:scale-95 
								transition flex items-center justify-center
								"
						>
							<Send size={20} />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
