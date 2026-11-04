# Study Planner

A single-user study planner for the Cloud Application Development project. The React client stores modules and tasks through a FastAPI backend. A separate progress library summarises completion, overdue work, and the next four weeks.

There are no user accounts. Anyone who can open the site sees the same records.

## Run it locally

Docker and PostgreSQL are not installed on this machine, so the local API uses a SQLite file at `backend/planner.db`. The same tests run against PostgreSQL in GitHub Actions, and the EC2 deployment uses PostgreSQL.

In one terminal:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
```

In another:

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173. The client calls http://127.0.0.1:8000.

## Tests

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

```powershell
cd frontend
npm test
```

The API tests were committed before the implementation. The progress calculations were committed the same way.

## AWS

The Learner Lab budget is $50. Region `us-east-1`. EC2 and S3 are allowed. CloudFront is not. IAM users and roles cannot be created. The lab already has `LabInstanceProfile` and the `vockey` key pair. Credentials include a session token and expire when the lab session ends.

Terraform in `infra/` describes one `t3.micro` instance, a 20 GB gp3 volume for PostgreSQL, and an Elastic IP. It refuses to create those resources unless `confirm_budget=true`. The Deploy workflow creates the public website bucket and the private artifacts bucket with the AWS CLI, because the lab denies the object-lock check that Terraform's S3 resource performs.

Do not run Terraform, and do not start the Deploy workflow, until you mean to spend the budget. A running EC2 instance costs money, and the next **Start Lab** turns stopped instances back on. Stop the instance in the EC2 console when you finish for the day, then stop it again after you next start a lab session if you are not using it.

The GitHub repository has not been created. CI and Deploy workflows are in `.github/workflows` and will run after the project is pushed to GitHub.

## Layout

- `backend/` FastAPI app, `progresslib`, and tests
- `frontend/` Vite, React, and React Bootstrap
- `infra/` Terraform
- `docs/` report draft and video script
