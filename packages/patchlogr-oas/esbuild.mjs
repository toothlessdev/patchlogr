import { build } from "esbuild";
import pkg from "./package.json" with { type: "json" };

await build({
    entryPoints: ["src/index.ts"],
    outdir: "dist",
    bundle: true,
    platform: "node",
    target: ["node18", "node20", "node24"],
    format: "esm",
    sourcemap: true,
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
});
