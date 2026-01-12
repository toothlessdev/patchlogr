import { describe, expect, test, vitest } from "vitest";
import type { PipelineStage } from "../PipelineExecutor";
import { PipelineExecutor } from "../PipelineExecutor";

describe("PipelineExecutor", () => {
    test("should append stages correctly", () => {
        class Pipe1 implements PipelineStage<unknown> {
            execute(input: unknown): Promise<unknown> {
                return Promise.resolve(input);
            }
        }
        class Pipe2 implements PipelineStage<unknown> {
            execute(input: unknown): Promise<unknown> {
                return Promise.resolve(input);
            }
        }

        const executor = new PipelineExecutor();
        executor.add(new Pipe1());
        executor.add(new Pipe2());

        expect(executor.stages.length).toBe(2);
        expect(executor.stages[0]).toBeInstanceOf(Pipe1);
        expect(executor.stages[1]).toBeInstanceOf(Pipe2);
    });

    test("should execute stages in order", async () => {
        const pipe1ExecuteFn = vitest.fn();
        const pipe2ExecuteFn = vitest.fn();

        const pipe1: PipelineStage<unknown> = {
            execute: pipe1ExecuteFn,
        };
        const pipe2: PipelineStage<unknown> = {
            execute: pipe2ExecuteFn,
        };

        const executor = new PipelineExecutor();
        executor.add(pipe1);
        executor.add(pipe2);

        await executor.run({});

        expect(pipe1ExecuteFn).toHaveBeenCalledBefore(pipe2ExecuteFn);
    });
});
