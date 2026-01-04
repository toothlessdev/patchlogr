export interface PipelineStage<T> {
    execute(input: T): Promise<T>;
}

export class PipelineExecutor<T> {
    stages: PipelineStage<T>[] = [];

    add(stage: PipelineStage<T>) {
        this.stages.push(stage);
        return this;
    }

    async run(input: T) {
        let output: T = input;
        for (const stage of this.stages) {
            output = await stage.execute(output);
        }
        return output;
    }
}
