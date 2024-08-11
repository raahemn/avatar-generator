import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export function createServiceAccount(projectName: string, stackName: string) {
    const serviceAccount = new gcp.serviceaccount.Account(
        `${projectName}-${stackName}-sa`,
        {
            accountId: `mod2b-pulumi-sa`,
            displayName: "Module 2 Pulumi Service Account",
        }
    );

    const serviceAccountKey = new gcp.serviceaccount.Key(
        `${projectName}-${stackName}-key`,
        {
            serviceAccountId: serviceAccount.id,
        }
    );

    const serviceAccountId = pulumi.interpolate`projects/${projectName}/serviceAccounts/${serviceAccount.accountId}@${projectName}.iam.gserviceaccount.com`;

    // Correctly interpolate service account email and other fields
    const iamBinding = new gcp.serviceaccount.IAMBinding(
        `${projectName}-${stackName}-binding`,
        {
            serviceAccountId: serviceAccountId,
            role: "roles/iam.serviceAccountUser",
            members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        { dependsOn: [serviceAccount] } // Ensure this is created after the service account
    );

    return { serviceAccount, serviceAccountKey, iamBinding };
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