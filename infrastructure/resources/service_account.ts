import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createServiceAccount(projectName: string, stackName: string) {
    const serviceAccount = new gcp.serviceaccount.Account(
        `${projectName}-${stackName}-sa`,
        {
            accountId: `mod2-sa`,
            displayName: "Module 2 Pulumi Service Account",
            project: projectName,
        }
    );

    const serviceAccountKey = new gcp.serviceaccount.Key(
        `${projectName}-${stackName}-type-key`,
        {
            serviceAccountId: serviceAccount.id,
            privateKeyType: "TYPE_GOOGLE_CREDENTIALS_FILE",
           
        }
    );

    const serviceAccountId = pulumi.interpolate`projects/${projectName}/serviceAccounts/${serviceAccount.accountId}@${projectName}.iam.gserviceaccount.com`;

    // Correctly interpolate service account email and other fields
    // const iamBinding = new gcp.serviceaccount.IAMBinding(
    //     `${projectName}-${stackName}-binding`,
    //     {
    //         serviceAccountId: serviceAccountId,
    //         role: "roles/iam.serviceAccountUser",
    //         members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
    //     },
    //     { dependsOn: [serviceAccount] } // Ensure this is created after the service account
    // );

    const storageAdminBinding = new gcp.projects.IAMBinding(
        `${projectName}-${stackName}-storage-admin-binding`,
        {
            project: projectName,
            role: "roles/storage.admin",
            members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        { dependsOn: [serviceAccount] } // Ensure this is created after the service account
    );

    const firestoreUserBinding = new gcp.projects.IAMBinding(
        `${projectName}-${stackName}-firestore-binding`,
        {
            project: projectName,
            role: "roles/datastore.user",
            members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        { dependsOn: [serviceAccount] } // Ensure this is created after the service account
    );

    const runAdminBinding = new gcp.projects.IAMBinding(
        `${projectName}-${stackName}-runAdmin-binding`,
        {
            project: projectName,
            role: "roles/run.admin",
            members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        { dependsOn: [serviceAccount] } // Ensure this is created after the service account
    );

    return { serviceAccount, serviceAccountKey, storageAdminBinding, firestoreUserBinding, runAdminBinding };
}

// import * as gcp from "@pulumi/gcp";

// export function createServiceAccount(projectName: string, stackName: string) {
//     const serviceAccount = new gcp.serviceaccount.Account(
//         `${projectName}-${stackName}-sa`,
//         {
//             accountId: `${projectName}-${stackName}-sa`,
//             displayName: "Module 2",
//         }
//     );

//     const serviceAccountKey = new gcp.serviceaccount.Key(
//         `${projectName}-${stackName}-key`,
//         {
//             serviceAccountId: serviceAccount.accountId,
//         }
//     );
//     const serviceAccountId = pulumi.interpolate`projects/${projectName}/serviceAccounts/${serviceAccount.accountId}@${projectName}.iam.gserviceaccount.com`;


//     const iamBinding = new gcp.serviceaccount.IAMBinding(
//         `${projectName}-${stackName}-binding`,
//         {
//             serviceAccountId: serviceAccountId,
//             role: "roles/storage.admin",
//             members: [`serviceAccount:${serviceAccount.email}`],
//         },
//         { dependsOn: [serviceAccount] } // Ensure this is created after the service account
//     );

//     return { serviceAccount, serviceAccountKey, iamBinding };
// }