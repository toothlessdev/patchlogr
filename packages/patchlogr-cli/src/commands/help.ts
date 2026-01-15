import { Command } from "commander";

export const helpCommand = new Command("help")
    .description("Display help information about patchlogr commands")
    .action((_options, command) => {
        command.parent?.outputHelp();
    });
