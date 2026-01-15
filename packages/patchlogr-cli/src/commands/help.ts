import { Command, program } from "commander";

export const helpCommand = new Command("help")
    .description("Display help information about patchlogr commands")
    .action(() => {
        program.outputHelp();
    });
