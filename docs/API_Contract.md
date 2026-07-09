# AI-Powered Task Management System

# API Contract (Version 1.0)

## Purpose

This document defines all backend REST APIs required for the AI-Powered Task Management System. Every frontend, AI, ML, and backend developer should follow this contract.

---

# Base URL

```
http://localhost:8000/api
```

---

# Authentication

Authentication will use JWT Token.

Every secured request should include:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# Response Format

Success Response

```json
{
    "success": true,
    "message": "Operation Successful",
    "data": {}
}
```

Error Response

```json
{
    "success": false,
    "message": "Error Message"
}
```
## 1.Authentication Module
## Register User

POST /api/auth/register

Request

```json
{
    "name":"Ganesh",
    "email":"ganesh@gmail.com",
    "password":"password123",
    "role":"Admin"
}
```

Response

```json
{
    "success": true,
    "message":"User Registered Successfully"
}
```

---

## Login

POST /api/auth/login

Request

```json
{
    "email":"ganesh@gmail.com",
    "password":"password123"
}
```

Response

```json
{
    "token":"JWT_TOKEN"
}
```
## 2.Employee Module
## Create Employee

POST /api/employees

Request

```json
{
    "name":"Rahul",
    "email":"rahul@gmail.com",
    "department":"Development",
    "skills":["Python","React"],
    "experience":2
}
```

---

## Get All Employees

GET /api/employees

---

## Get Employee

GET /api/employees/{id}

---

## Update Employee

PUT /api/employees/{id}

---

## Delete Employee

DELETE /api/employees/{id}

## 3.Project Module
POST /api/projects

GET /api/projects

GET /api/projects/{id}

PUT /api/projects/{id}

DELETE /api/projects/{id}

## 4.Task Module
## Create Task

POST /api/tasks

Request

```json
{
    "task_name":"Develop Login API",
    "description":"Create JWT Login",
    "priority":"High",
    "assigned_to":5,
    "due_date":"2026-08-01"
}
```

---

## Get Tasks

GET /api/tasks

---

## Get Task

GET /api/tasks/{id}

---

## Update Task

PUT /api/tasks/{id}

---

## Delete Task

DELETE /api/tasks/{id}

## 5.Ai module
## Auto Create Task

POST /api/tasks/auto-create

Input

Requirement Document

Output

Generated Tasks

---

## Auto Assign Task

POST /api/tasks/auto-assign

Output

Best Employee

---

## Predict Delay

GET /api/tasks/predict-delay

---

## Recommend Priority

POST /api/tasks/recommend-priority

## Dashboard Module
GET /api/dashboard

GET /api/dashboard/productivity

GET /api/dashboard/overdue

GET /api/dashboard/projects

## 7.Analytics Module
GET /api/analytics/dashboard

GET /api/analytics/team

GET /api/analytics/resource

GET /api/analytics/performance

## 8.Reports Module
GET /api/reports/daily

GET /api/reports/weekly

GET /api/reports/monthly

GET /api/reports/project

GET /api/reports/performance

## 9.Email Module
POST /api/email/send

POST /api/email/reminder

POST /api/email/escalation

POST /api/email/summary

## 10.Notification Module
GET /api/notifications

PUT /api/notifications/read/{id}

DELETE /api/notifications/{id}