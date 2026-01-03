import { build } from "esbuild";

esbuild.build({
    entryPoints: ["src/cli.ts"],
    outfile: "dist/cli.js",
    platform: "node",
    banner: {
        js: "#!/usr/bin/env node",
    },
});
