"use client";
import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";
import { useChat } from "ai/react";
import { Message } from "ai";

import { Bubble } from "@/components/Bubble";
import { LoadingBubble } from "@/components/LoadingBubble";
import { PromptSuggestionsRow } from "@/components/PromptSuggestionsRow";

export default function Home() {
	const {
		append,
		isLoading,
		messages,
		input,
		handleInputChange,
		handleSubmit,
	} = useChat();

	const noMessages = messages.length === 0;

	return (
		<main>
			<section className={noMessages ? "" : "populated"}>
				{noMessages ? (
					<>
						<p className="starter-text">
							The ultimate place for ITB related questions, we
							hope you are informed and entertained!
						</p>
						<br />
						<PromptSuggestionsRow />
					</>
				) : (
					// if there are messages
					<>
						{messages.map((message, index) => (
							<Bubble
								key={`message-${index}`}
								message={message}
							/>
						))}
						{isLoading && <LoadingBubble />}
					</>
				)}
				<form onSubmit={handleSubmit}>
					<input
						className="question-box"
						onChange={handleInputChange}
						value={input}
						placeholder="Ask me something..."
					/>
					<input type="submit" />
				</form>
			</section>
		</main>
	);
}
