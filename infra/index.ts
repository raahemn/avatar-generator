import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const projectName = pulumi.getProject();
const stackName = pulumi.getStack();

console.log(`Project Name: ${projectName}`);
console.log(`Stack Name: ${stackName}`);

// // Define a service account for your application
// const serviceAccount = new gcp.serviceaccount.Account(`${projectName}-${stackName}-sa`, {
//     accountId: `${projectName}-${stackName}-sa`,
//     displayName: "test pulumi",
// });

// // Create a service account key
// const serviceAccountKey = new gcp.serviceaccount.Key(`${projectName}-${stackName}-key`, {
//     serviceAccountId: serviceAccount.accountId,
// });

// // Define IAM bindings
// const iamBinding = new gcp.projects.IAMBinding(`${projectName}-${stackName}-binding`, {
//     members: [`serviceAccount:${serviceAccount.email}`],
//     role: "roles/storage.admin", // Example role, adjust as per your needs
// });
