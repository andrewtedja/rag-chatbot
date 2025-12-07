interface PromptSuggestionsRowProps {
	onPromptClick?: (prompt: string) => void;
}

export const PromptSuggestionsRow = ({
	onPromptClick,
}: PromptSuggestionsRowProps) => {
	const prompts = [
		"Ada jurusan apa aja sih di ITB?",
		"Ceritain dong kampus-kampus yang ada di ITB",
		"Rank the best makanan di sekitar ITB yang wajib dicoba!",
		"Untuk daftar ITB, requirementsnya apa saja?",
	];

	return (
		<div className="w-full grid gap-3 justify-center max-w-3xl mx-auto">
			{prompts.map((prompt, index) => (
				<button
					key={index}
					onClick={() => onPromptClick?.(prompt)}
					className="px-5 py-3 rounded-2xl bg-card text-foreground border border-border shadow-md hover:bg-muted hover:shadow-2xl hover:scale-105  hover:border-sky-300 active:scale-95 transition-all duration-200 cursor-pointer"
				>
					{prompt}
				</button>
			))}
		</div>
	);
};
