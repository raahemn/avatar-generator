import * as pulumi from "@pulumi/pulumi";
import { createServiceAccount } from "./resources/service_account";
import { createStorageBucket, createFirestore } from "./resources/storage";
import * as dotenv from "dotenv";

dotenv.config();

const projectName = "jetrr-raahem-nabeel-1";
const stackName = pulumi.getStack();

console.log(`Project: ${projectName}`);
console.log(`Stack: ${stackName}`);


const { serviceAccount, serviceAccountKey, iamBinding } = createServiceAccount(projectName, stackName);

const firestore = createFirestore(projectName, stackName);
const bucket = createStorageBucket(projectName, stackName);


export const serviceAccountEmail = serviceAccount.email;
export const bucketUrl = bucket.url;
export const firestoreId = firestore.id;