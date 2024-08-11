import * as gcp from "@pulumi/gcp";

export function createStorageBucket(projectName: string, stackName: string) {
    const bucket = new gcp.storage.Bucket("Mod2b-Bucket", {
        project: projectName,
        name: "mod2b-bucket",
        location: "us-central1",
        
    });

    return bucket;
}


export function createFirestore(projectName: string, stackName: string) {
    console.log("Creating Firestore database");
    console.log("Project Name: ", projectName);
    console.log("Stack Name: ", stackName);

    const database = new gcp.firestore.Database(`${projectName}-${stackName}-db`, {
        project: "jetrr-raahem-nabeel-1",
        name: "mod2b-db",
        locationId: "nam5",
        type: "FIRESTORE_NATIVE",
        concurrencyMode: "OPTIMISTIC",
        appEngineIntegrationMode: "DISABLED",
        pointInTimeRecoveryEnablement: "POINT_IN_TIME_RECOVERY_ENABLED",
        deleteProtectionState: "DELETE_PROTECTION_ENABLED",
        deletionPolicy: "DELETE",
    });

    return database; 
}


