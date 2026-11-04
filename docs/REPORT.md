# Study planner: project report

National College of Ireland  
Cloud Application Development  
Individual project

This draft is written from the implementation in this repository. Before Moodle submission, export it to PDF, add the public GitHub link, the Teams video link, the live URLs, and a small number of captioned screenshots. Rewrite the reflection in your own words.

## 1. Introduction

Students keep coursework in several places: module pages, calendars, and notes. Deadlines are then easy to miss, and it is hard to see which module still needs time. This project is a small software-as-a-service study planner. A student records modules and tasks, and a progress view shows what is finished, what is overdue, and how the remaining minutes fall across the next four weeks.

The application is split into a standalone REST backend and a standalone browser client. The client never reads the database. It calls the API. That split is the architecture the brief asks for, and it is also what makes a later cloud deployment possible: the client is a static site, and the API is a separate process.

The useful behaviour beyond create, read, update, and delete is the progress summary. It lives in its own Python package, `progresslib`, so the rules can be tested without FastAPI or a database. The API loads records and passes them to that package. The React page only renders the result.

## 2. Requirements

Functional requirements:

1. Create, list, read, update, and delete a module. A module has a name, a code, and a positive number of credits.
2. Create, list, read, update, and delete a task. A task has a title, optional details, a deadline, a status of `todo`, `in_progress`, or `done`, a positive estimate in minutes, and a module.
3. Reject an empty name, code, or title, a missing deadline, an unknown status, credits or minutes that are not positive, and a task whose module does not exist.
4. Deleting a module deletes its tasks.
5. Provide a progress summary: overall and per-module completion, overdue open tasks, open tasks due within seven days, remaining minutes, and open minutes grouped into the next four weeks.
6. Keep the records after the browser is refreshed.

Non-functional requirements:

1. The client and the API are separate programs.
2. Automated tests describe the behaviour before the implementation is accepted.
3. GitHub Actions runs the tests on every push, with no AWS credentials.
4. Deployment to AWS is described in Terraform and started by a manual workflow.
5. The deployment fits the AWS Academy Learner Lab: region `us-east-1`, no new IAM roles, no CloudFront, and no RDS.

The product is single-user. Login was considered and left out. That is recorded as a limitation in section 8.

## 3. Design and architecture

A module owns many tasks. The task holds a foreign key to the module. Deleting the module deletes the tasks, both in the ORM relationship and with `ON DELETE CASCADE` for PostgreSQL.

The API is organised in layers:

- Routers accept HTTP and return status codes.
- Pydantic schemas validate input before it reaches the database.
- A small data-access module runs the SQLAlchemy queries.
- `progresslib` is a pure function. It receives plain records and a date, and it returns the summary.

The date is an argument so the tests do not depend on the day the test runs. The HTTP route uses today's date when the caller does not pass one, and the tests pass `today=2026-11-04`.

Routes:

- `GET` and `POST /modules`
- `GET`, `PATCH`, and `DELETE /modules/{id}`
- `GET` and `POST /tasks`, with an optional `module_id` filter
- `GET`, `PATCH`, and `DELETE /tasks/{id}`
- `GET /health`
- `GET /dashboard`

Create returns 201. Delete returns 204. A missing record returns 404. A validation failure, including a task for a missing module, returns 422.

The browser application uses React Router. The shared layout and navbar are one partial. Empty states, the module form, and the task form are others. Pages compose those partials. Bootstrap supplies the grid, cards, table, badges, and forms. A short stylesheet sets the navy navbar and the page background. On a deployed site the React build is static files. A refresh of a client route must return `index.html`, which the S3 website error document is set up to do. Locally, the Vite server does the same. The API is called by its own origin, so a page refresh is not mistaken for an API call.

The progress rules are:

- A task is complete only when its status is `done`.
- Completion is completed tasks divided by all tasks. If there are no tasks, the ratio is 0 rather than an error.
- An open task is overdue when its calendar date is before the injected date. A deadline on that date is not overdue.
- "Due within seven days" means an open task dated from the injected date through the sixth day after it.
- Weekly load uses four windows of seven days, starting on the injected date, and counts estimated minutes of open tasks only.
- A task whose module id is unknown still counts in the overall figures. It does not invent a module row.

## 4. Technology choices

FastAPI was chosen over Flask. Both can expose JSON. FastAPI generates the OpenAPI page from the same schemas that validate requests, so the validation rules and the documentation stay together. Pydantic rejects a bad payload before a route body runs.

React with Vite was chosen over server-rendered templates. The brief asks for a standalone client that calls the API. React components are the partials: layout, navbar, empty state, and forms. React Bootstrap provides the Bootstrap components the marking scheme names. Vue would also have met the split. React was chosen because the component model maps cleanly onto those partials and the Vite toolchain is small.

PostgreSQL was chosen over SQLite for the deployed system because modules and tasks are relational, and the same engine can run on the EC2 host and in GitHub Actions. SQLite is the local file only because this PC has neither Docker nor a PostgreSQL install. The application reads `DATABASE_URL`. The models do not change between the two engines. Moving the laptop onto PostgreSQL later means setting that variable. It does not mean rewriting the API.

The API runs in Docker on one `t3.micro` EC2 instance, beside a PostgreSQL container whose data directory is a 20 GB gp3 volume. Elastic Beanstalk, ECS, and Lambda are allowed in parts of the lab, but they need more roles and moving pieces. One instance is enough for this project and stays inside the instance-size rules. RDS PostgreSQL is allowed, and it was rejected. The lab does not stop an RDS instance when the session ends, and a stopped instance can be started again by AWS after seven days. On a $50 budget that is a poor default. The volume on EC2 stops costing compute when the instance is stopped. The disk cost remains small.

Terraform was chosen over CloudFormation because the deployment artefact had to be Terraform. The configuration is the source of the infrastructure, and the GitHub workflow runs `terraform apply`. It does not click through the console.

GitHub Actions was chosen over CodePipeline. The brief points at GitHub, and the test workflow does not need AWS credentials. That separation matters in this lab, because the credentials expire.

## 5. Implementation

Validation is in the Pydantic models. Blank text is stripped and rejected. Credits and minutes must be greater than zero. Status is an enum. The task route then checks that the module exists, because that rule needs the database.

The local database file is created on startup with `create_all`. That is simpler than a migration tool and is a limitation: a change to a column does not alter an existing file. Deleting `backend/planner.db` recreates it. On the server, the same call runs against PostgreSQL. Startup retries for about a minute so the API can wait until the database container is accepting connections.

The client forms check the same obvious rules before sending, and they also show the API's error text. Delete asks for confirmation on the page. A native confirmation dialog was avoided because it is easy to miss and hard to demonstrate.

`progresslib` imports neither FastAPI nor SQLAlchemy. The dashboard route is the only place that joins the library to the tables.

Two practical problems showed up while the screens were checked. First, a Vite proxy on `/modules` also captured a full page reload of `/modules/1` and returned JSON instead of the React app. The client now calls the API origin directly, and the page server only serves the client. Second, parallel filling of form fields in an automated browser could overwrite a controlled React input. The screens themselves were saving the values once each field was set on its own.

## 6. Learner Lab constraints

The lab pages and the credential panel were read before any infrastructure was written.

- The budget shown was $50, with $0 spent at the time of the check.
- A session lasts four hours and can be started again.
- Created resources remain. EC2 instances are stopped at the end of a session. The next **Start Lab** starts them again, so an instance left behind spends credit as soon as the next session begins.
- The CLI snippet includes `AWS_SESSION_TOKEN`. The keys die with the session. They are not stored in git.
- Service access is limited to `us-east-1` and `us-west-2`. This project uses `us-east-1` only.
- EC2 and S3 are on the allowed list. Instance sizes are nano through large. The existing instance profile is `LabInstanceProfile`, and the key pair in `us-east-1` is `vockey`.
- CloudFront is not on the allowed list, so the static site is the S3 website endpoint over HTTP.
- IAM cannot create users, groups, or ordinary roles. GitHub cannot be given a long-lived user or an OIDC role in this account.
- RDS is allowed and is not used, for the cost reason in section 4.
- EBS volumes are limited to 100 GB and general-purpose SSD. The data volume is 20 GB gp3.
- A public IP changes when an instance stops and starts, unless an Elastic IP is attached. The configuration allocates one. An address that is associated with a stopped instance can still incur a small charge, which is another reason to destroy the stack after the video if it is no longer needed.

Nothing was created in the account while the lab was inspected.

## 7. Testing

The tests were written to fail before the code they describe was added. The git history shows that order for the API and for `progresslib`.

Backend, 25 tests, pytest:

- Health check.
- Module and task create, list, read, update, and delete.
- Blank text, missing fields, non-positive credits and minutes, and an unknown status.
- A task for a missing module.
- Cascade delete of tasks.
- Missing records return 404.
- Progress calculations: empty input, all tasks done, a deadline on the injected date, an overdue deadline, the seven-day window, a task in a later week, a task outside four weeks, an unknown module, and an ISO timestamp.
- The dashboard HTTP response for a fixed date.

Frontend, 3 tests, Vitest and Testing Library:

- The task form blocks a save when the title is empty.
- The task form submits trimmed fields.
- The dashboard view renders completion, an overdue task, and a module row.

GitHub Actions runs the backend tests against PostgreSQL 16 and runs the frontend tests plus a production build. That workflow has no AWS keys. A smoke check of `/health` is also the last step of the remote start script after a deploy.

The screens were exercised in a browser against the local API: create a module, create a task, edit the status, reload the module URL, delete the task, and delete the module. The dashboard page was then opened with saved records and showed the completion percentage and the overdue task.

## 8. Continuous integration and deployment

CI is `.github/workflows/ci.yml`. It runs on every push and pull request.

Deployment is `.github/workflows/deploy.yml`. It runs only when someone starts it by hand. The job configures AWS from the access key, secret, and session token secrets, creates a private state bucket if needed, and runs `terraform apply` with `confirm_budget=true`. It then builds the React app with the API address, uploads the build to the website bucket, uploads the API files to the private artifacts bucket, and asks Systems Manager to download them and run Docker Compose. Systems Manager is used because the lab documents `LabInstanceProfile` for that purpose, and the `vockey` private key does not need to be copied into GitHub.

This report does not claim a live URL yet. Applying the stack spends the $50 budget and needs a lab session that is actually running. The evidence block below should be filled after that run, with the workflow log and the two URLs.

Deployment evidence, to be completed after the first apply:

- GitHub Actions run:
- Website URL:
- API health URL:
- Date and time:

## 9. Limitations and extensions

There are no accounts. Every visitor shares one set of records. The extension is register and login, with each module owned by a user. That was left out so the progress library could be the feature beyond CRUD.

The local database is SQLite. Production and CI use PostgreSQL. A developer on this PC does not exercise the PostgreSQL path until CI runs, unless they install Docker later.

`create_all` does not migrate existing tables. A schema change needs a new database or a migration tool such as Alembic.

The website is HTTP, because CloudFront and a registered domain are not available. The lab also forbids domain registration in Route 53.

Fully unattended deployment is not possible with expiring lab credentials. The mitigation is a manual workflow that fails closed until fresh secrets are pasted in, plus `confirm_budget` so a casual `terraform apply` does not create the instance.

The Elastic IP and the stopped-instance behaviour need care. After the demonstration, the instance should be stopped, and it should be stopped again the next time a session starts if it is not in use. Destroying the stack with Terraform removes the ongoing cost.

Possible extensions are per-user data, a calendar export, and email reminders for overdue tasks.

## 10. Reflection

Draft, to be rewritten in your own words before submission.

The part that took the most care was not the CRUD screens. It was fitting a normal cloud deployment into a lab account that expires its keys, stops and later restarts EC2, and refuses new IAM roles. Writing the tests first made the progress rules precise: the overdue boundary and the four week windows are easy to get wrong if they are only checked by looking at the page.

## References

Amazon Web Services (2026) *Amazon EC2*. Available at: https://docs.aws.amazon.com/ec2/ (Accessed: 4 November 2026).

Amazon Web Services (2026) *Amazon S3*. Available at: https://docs.aws.amazon.com/s3/ (Accessed: 4 November 2026).

AWS Academy (2026) *AWS Academy Learner Lab* [Lab instructions]. Available through the AWS Academy course portal (Accessed: 4 November 2026).

Beck, K. (2002) *Test-driven development: by example*. Boston: Addison-Wesley.

Bootstrap (2026) *Bootstrap documentation*. Available at: https://getbootstrap.com/docs/ (Accessed: 4 November 2026).

FastAPI (2026) *FastAPI documentation*. Available at: https://fastapi.tiangolo.com/ (Accessed: 4 November 2026).

Fielding, R.T. (2000) *Architectural styles and the design of network-based software architectures*. Doctoral dissertation. University of California, Irvine.

GitHub (2026) *GitHub Actions documentation*. Available at: https://docs.github.com/en/actions (Accessed: 4 November 2026).

HashiCorp (2026) *Terraform documentation*. Available at: https://developer.hashicorp.com/terraform/docs (Accessed: 4 November 2026).

Pydantic (2026) *Pydantic documentation*. Available at: https://docs.pydantic.dev/ (Accessed: 4 November 2026).

React (2026) *React documentation*. Available at: https://react.dev/ (Accessed: 4 November 2026).

SQLAlchemy (2026) *SQLAlchemy documentation*. Available at: https://docs.sqlalchemy.org/ (Accessed: 4 November 2026).
