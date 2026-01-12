import { build } from "esbuild";
import path from "path";

await build({
    entryPoints: [path.resolve("src/index.ts")],
    outfile: "dist/index.js",
    platform: "node",
    bundle: true,
    sourcemap: true,
    banner: {
        js: "#!/usr/bin/env node",
    },
});
