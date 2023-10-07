// todo: remove all imports from file
import { existsSync } from "node:fs";

import { ModelName, modelFileNames } from "./model.js";

// return as syntax for whisper.cpp command
export function createCppCommand({
	filePath,
	modelName = undefined,
	modelPath = undefined,
	options = { wordTimestamps: true },
}: CppCommandTypes) {
	const model = modelPathOrName(modelName, modelPath);
	return `./main ${getFlags(options)} -m ${model} -f ${filePath}`;
}

function modelPathOrName(
	modelName: ModelName | undefined,
	modelPath: string | undefined,
) {
	if (modelName && modelPath) {
		throw new Error("Submit a modelName OR a modelPath. NOT BOTH!");
	}
	if (!modelName && !modelPath) {
		throw new Error("No 'modelName' or 'modelPath' provided");
	}

	if (modelPath) {
		return modelPath;
	}

	if (!modelName || !(modelName in modelFileNames)) {
		throw new Error(`Invalid model name: "${modelName}"`);
	}

	const correspondingPath = `./models/${modelFileNames[modelName]}`;
	if (!existsSync(correspondingPath)) {
		throw new Error(
			`"${modelName}" not found. Run "npx @pr0gramm/fluester download"`,
		);
	}
	return correspondingPath;
}

// option flags list: https://github.com/ggerganov/whisper.cpp/blob/master/README.md?plain=1#L91
function getFlags(flags: FlagTypes): string {
	const s = [];

	// output files
	if (flags.generateTxt) {
		s.push("-otxt");
	}
	if (flags.generateSubtitles) {
		s.push("-osrt");
	}
	if (flags.generateVtt) {
		s.push("-ovtt");
	}

	// timestamps
	if (flags.timestampSize) {
		s.push(`-ml ${flags.timestampSize}`);
	}
	if (flags.wordTimestamps) {
		s.push("-ml 1");
	}

	return s.join(" ");
}

export interface CppCommandTypes {
	filePath: string;
	modelName?: ModelName;
	modelPath?: string;
	options?: FlagTypes;
}

export interface FlagTypes {
	/** Build TXT? */
	generateTxt?: boolean;
	/** Build SRT? */
	generateSubtitles?: boolean;
	/** Build VTT? */
	generateVtt?: boolean;
	timestampSize?: number;
	wordTimestamps?: boolean;
}
