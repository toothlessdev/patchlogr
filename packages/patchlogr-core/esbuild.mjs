import { build } from "esbuild";

const common = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    sourcemap: true,
    platform: "node",
    target: ["node18"],
    external: [],
};

await build({
    ...common,
    format: "esm",
    outfile: "dist/index.js",
});

await build({
    ...common,
    format: "cjs",
    outfile: "dist/index.cjs",
});
