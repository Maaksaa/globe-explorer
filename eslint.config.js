//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
	...tanstackConfig,
	{
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.app.json", "./tsconfig.node.json"],
			},
		},
	},
	{
		rules: {
			"@typescript-eslint/array-type": [
				"error",
				{ default: "array-simple" },
			],
		},
	},
];