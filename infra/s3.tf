locals {
  account_id       = data.aws_caller_identity.current.account_id
  frontend_bucket  = "study-planner-web-${local.account_id}"
  artifacts_bucket = "study-planner-artifacts-${local.account_id}"
}

# The buckets are created by the Deploy workflow with the AWS CLI.
# The Learner Lab service control policy denies s3:GetBucketObjectLockConfiguration,
# and the AWS provider calls that API while reading an aws_s3_bucket resource.
