export const createBatches = (records, batchSize = 10) => {

    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
        batches.push(records.slice(i, i + batchSize));
    }

    return batches;
};