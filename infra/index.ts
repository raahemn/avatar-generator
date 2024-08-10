import * as pulumi from "@pulumi/pulumi";
import { createServiceAccount } from "./resources/service_account";
import { createStorageBucket, createFirestore } from "./resources/storage";


const projectName = pulumi.getProject();
const stackName = pulumi.getStack();

const { serviceAccount, serviceAccountKey, iamBinding } = createServiceAccount(projectName, stackName);
const bucket = createStorageBucket(projectName, stackName);
const firestore = createFirestore(projectName, stackName);

export const serviceAccountEmail = serviceAccount.email;
export const bucketUrl = bucket.url;