# Deployment

`terraform apply` creates billable resources in the Learner Lab. The configuration will not apply unless `-var="confirm_budget=true"` is set.

The intended path is the manual **Deploy** GitHub Actions workflow, after these secrets exist:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

Copy a fresh set from **AWS Details** each time. The session token expires when the lab session ends.

The workflow uses region `us-east-1` only. It does not create IAM users or roles. The instance attaches the existing `LabInstanceProfile`. Systems Manager is used to start the containers, so the `vockey` private key is not stored in GitHub.

After a successful run, stop the EC2 instance if you are finished. Starting the lab again starts that instance again.
