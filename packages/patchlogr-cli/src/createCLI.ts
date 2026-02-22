import { Command } from "commander";
import pkg from "../package.json";

import { helpCommand } from "./commands/help";
import { canonicalizeCommand } from "./commands/canonicalize";
import { diffCommand } from "./commands/diff";

export function createCLI() {
    return new Command()
        .name("patchlogr")
        .version(pkg.version)
        .description("PatchlogrCLI : changelogs from openapi specs")
        .addCommand(helpCommand)
        .addCommand(canonicalizeCommand)
        .addCommand(diffCommand);
}
