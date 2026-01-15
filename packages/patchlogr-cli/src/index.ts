import { createCLI } from "./createCLI";

const program = createCLI();

program.parseAsync(process.argv).catch((error) => {
    console.error("[patchlogr] Error:", error);
    process.exitCode = 1;
});
