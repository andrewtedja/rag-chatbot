"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	const handleToggle = useCallback(() => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}, [resolvedTheme, setTheme]);

	return (
		<button
			onClick={handleToggle}
			aria-label="Toggle theme"
			className="
				p-2 rounded-lg
				bg-background/50 hover:bg-background/70
				shadow border border-border
				transition cursor-pointer
			"
		>
			{resolvedTheme === "dark" ? (
				<Moon className="h-5 w-5 text-foreground" />
			) : (
				<Sun className="h-5 w-5 text-amber-500" />
			)}
		</button>
	);
}
