import * as gcp from "@pulumi/gcp";

export function createServiceAccount(projectName: string, stackName: string) {
    const serviceAccount = new gcp.serviceaccount.Account(`${projectName}-${stackName}-sa`, {
        accountId: `${projectName}-${stackName}-sa`,
        displayName: "test pulumi",
    });

    const serviceAccountKey = new gcp.serviceaccount.Key(`${projectName}-${stackName}-key`, {
        serviceAccountId: serviceAccount.accountId,
    });

    // const iamBinding:any = new gcp.projects.IAMBinding(`${projectName}-${stackName}-binding`, {
    //     members: [`serviceAccount:${serviceAccount.email}`],
    //     role: "roles/storage.admin", // Example role, adjust as per your needs
    // });

    // return { serviceAccount, serviceAccountKey, iamBinding };
}