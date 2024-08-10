import * as gcp from "@pulumi/gcp";

export function createServiceAccount(projectName: string, stackName: string) {
    const serviceAccount = new gcp.serviceaccount.Account(
        `${projectName}-${stackName}-sa`,
        {
            accountId: `${projectName}-${stackName}-sa`,
            displayName: "Module 2",
        }
    );

    const serviceAccountKey = new gcp.serviceaccount.Key(
        `${projectName}-${stackName}-key`,
        {
            serviceAccountId: serviceAccount.accountId,
        }
    );

    const iamBinding = new gcp.serviceaccount.IAMBinding(
        `${projectName}-${stackName}-binding`,
        {
            serviceAccountId: serviceAccount.accountId,
            role: "roles/storage.admin",

            members: [`serviceAccount:${serviceAccount.email}`],
        }
    );

    return { serviceAccount, serviceAccountKey, iamBinding };
}
