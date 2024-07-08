import * as pulumi from "@pulumi/pulumi";
import { createServiceAccount } from "./resources/service_account";
// import { createStorageBucket } from "./components/storageBucket";
// import { createFirestore } from "./components/firestore";

const projectName = pulumi.getProject();
const stackName = pulumi.getStack();

// const { serviceAccount, serviceAccountKey, iamBinding } = createServiceAccount(projectName, stackName);
// const bucket = createStorageBucket(projectName, stackName);
// const firestore = createFirestore(projectName, stackName);

// export const serviceAccountEmail = serviceAccount.email;
// export const bucketUrl = bucket.url;