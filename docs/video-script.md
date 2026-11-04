# 12-minute demonstration script

Record in Teams with the camera on. Do not submit the slides. Keep them on screen only for the opening. Stay under 12 minutes. The order after the opening is fixed: frontend, library, backend, testing, then CI/CD and deployment.

Fill the live URLs after the Deploy workflow has succeeded. If the lab session is not running, start it, paste fresh credentials into the GitHub secrets, and run Deploy before you record the last section.

## 0:00 to 2:30. Design

Say what the app is for: coursework is spread across modules and deadlines are easy to lose. The requirements are modules, tasks, validation, and a progress summary. Show a simple diagram: browser, React on S3, FastAPI and PostgreSQL on one EC2 instance.

State the choices in one sentence each. FastAPI rather than Flask, because validation and the OpenAPI page come from the same models. React rather than server templates, because the brief asks for a separate client. PostgreSQL on the instance rather than RDS, because RDS can keep charging after the lab session ends. Terraform because the deployment had to be infrastructure as code.

## 2:30 to 4:00. The difficult part

The difficult part was the Learner Lab, not the forms. Keys include a session token and expire. New IAM users and roles are blocked. CloudFront is not allowed. EC2 instances stop at the end of a session and start again the next time the lab starts. Show `infra/variables.tf` and the `confirm_budget` guard, and the Deploy workflow secrets: access key, secret, and session token. Say that tests run on every push with no AWS keys, and deploy is started by hand after a fresh token is copied in.

## 4:00 to 6:00. Frontend

Open the website. Create a module, then a task. Edit the task status. Refresh the page and show that the task is still there. Delete it and show the on-page confirmation. Point at the navbar, the empty state, and a form, and say these are the partials, built with React Bootstrap.

## 6:00 to 7:30. Library

Open the dashboard and show completion, an overdue task, and the four week table. Then open `backend/progresslib/dashboard.py` and `backend/tests/test_progresslib.py`. Say the package does not import FastAPI or the database, and the tests inject a fixed date so "overdue" does not mean "before whatever day the test happens to run".

## 7:30 to 9:00. Backend

Open the API docs at the API origin plus `/docs`. Create or list a module there, or show a rejected request with empty credits. Mention the layers: router, Pydantic schema, SQLAlchemy, and the progress library. Mention that deleting a module deletes its tasks.

## 9:00 to 10:15. Testing

Show the git history, with the test commits before the implementation commits. Run `pytest` or show a green GitHub Actions log. Say the counts: 25 backend tests and 3 frontend tests, covering validation, CRUD, the progress rules, and one dashboard render.

## 10:15 to 12:00. CI/CD and the live URL

Show the CI workflow file and a green run. Show the Deploy workflow and the Terraform files for S3, the instance, the gp3 volume, and the Elastic IP. Open the live website and the live `/health` URL. Create one record on the live site so it is obvious this is not the laptop.

Stop the EC2 instance when the recording is finished, unless you still need it the same day.
