import { Command } from "commander";

export function createCLI() {
    const program = new Command();

    program
        .name("patchlogr")
        .version("0.0.0")
        .description("PatchlogrCLI : changelogs from openapi specs");

    program
        .command("help")
        .description("Display help information about patchlogr commands");

    program
        .command("canonicalize")
        .argument("<api-docs>", "Path to the OpenAPI specification file")
        .option("--canonicalize", "Canonicalize the OpenAPI specification")
        .option(
            "--skipValidation",
            "Skip validation of the OpenAPI specification",
        )
        .option(
            "-o, --output <file>",
            "Write result to file instead of stdout (default: stdout)",
        )
        .action(async (apiDocs, options) => {
            try {
                console.log("[patchlogr] Processing:", apiDocs, options);
            } catch (error) {
                console.error("[patchlogr] Error:", (error as Error).message);
                process.exitCode = 1;
            }
        });

    return program;
}
