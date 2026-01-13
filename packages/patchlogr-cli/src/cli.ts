import { Command } from "commander";
import { runCanonicalize } from "./commands/runCanonicalize";

export function createCLI() {
    const program = new Command();

    program
        .name("patchlogr")
        .version("0.0.0")
        .description("PatchlogrCLI : changelogs from openapi specs");

    program
        .command("help")
        .description("Display help information about patchlogr commands")
        .action(() => {
            program.outputHelp();
        });

    program
        .command("canonicalize")
        .argument("<api-docs>", "Path to the OpenAPI specification file")
        .option(
            "--skipValidation",
            "Skip validation of the OpenAPI specification",
        )
        .option(
            "-o, --output <file>",
            "Write result to file instead of stdout (default: stdout)",
            "stdout",
        )
        .action(async (apiDocs, options) => {
            try {
                await runCanonicalize(apiDocs, options);
            } catch (error) {
                console.error(error);
                process.exitCode = 1;
            }
        });

    return program;
}
