import { Command, CommandOptions, program } from "commander";

export const helpCommand = program
    .command("help")
    .description("Display help information about patchlogr commands")
    .action(() => {
        program.outputHelp();
    });
