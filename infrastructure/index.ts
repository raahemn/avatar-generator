import * as pulumi from "@pulumi/pulumi";
import { createServiceAccount } from "./resources/service_account";
import { createStorageBucket, createFirestore } from "./resources/storage";
import * as dotenv from "dotenv";

dotenv.config();

const projectName = "jetrr-raahem-nabeel-1";
const stackName = pulumi.getStack();

console.log(`Project: ${projectName}`);
console.log(`Stack: ${stackName}`);


const { serviceAccount, serviceAccountKey, storageAdminBinding, firestoreUserBinding, runAdminBinding  } = createServiceAccount(projectName, stackName);

const firestore = createFirestore(projectName, stackName);
const bucket = createStorageBucket(projectName, stackName);


export const serviceAccountEmail = serviceAccount.email;
export const keyJson = serviceAccountKey.privateKey.apply((key) => Buffer.from(key, 'base64').toString('utf8'));
export const bucketUrl = bucket.url;
export const firestoreId = firestore.id;