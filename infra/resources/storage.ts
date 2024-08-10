import * as gcp from "@pulumi/gcp";

export function createStorageBucket(projectName: string, stackName: string) {
    const bucket = new gcp.storage.Bucket(`${projectName}-${stackName}-bucket`, {
        location: "us-central1",
    });

    return bucket;
}


export function createFirestore(projectName: string, stackName: string) {
    const database = new gcp.firestore.Database("database", {
        project: projectName,
        name: "(default)",
        locationId: "nam5",
        type: "FIRESTORE_NATIVE",
    });

    return database;
}