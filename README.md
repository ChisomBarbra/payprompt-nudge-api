# PayPrompt Nudge API

![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-blue)
![Bruno Collection](https://img.shields.io/badge/Bruno-Collection-orange)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen)

A clean, structured API for scheduling, sending, and tracking loan repayment reminders (nudges) across SMS, Email, and WhatsApp. Designed for micro-lenders, fintech platforms, credit products, and internal finance/ops teams that need predictable repayment communication flows without building a messaging pipeline from scratch.

---

# Table of Contents

- [1. Overview](#1-overview)
  - [1.1 What is PayPrompt Nudge API?](#11-what-is-payprompt-nudge-api)
  - [1.2 Core Concepts](#12-core-concepts)
  - [1.3 API Capabilities](#13-api-capabilities)
  - [1.4 Typical Use Cases](#14-typical-use-cases)
- [2. Getting Started](#2-getting-started)
  - [2.1 Base URLs](#21-base-urls)
  - [2.2 Environments](#22-environments)
  - [2.3 API Keys](#23-api-keys)
  - [2.4 Making Your First Request](#24-making-your-first-request)
- [3. Authentication](#3-authentication)
- [4. Requests & Responses](#4-requests--responses)
- [5. Errors](#5-errors)
- [6. Resources & Endpoints](#6-resources--endpoints)
  - [6.1 Borrowers](#61-borrowers)
  - [6.2 Loans](#62-loans)
  - [6.3 Reminders](#63-reminders)
  - [6.4 Webhooks](#64-webhooks)
- [7. Messaging Templates](#7-messaging-templates)
- [8. Guides](#8-guides)
- [9. Reference](#9-reference)
- [10. Changelog](#10-changelog)

---

# 1. Overview

The PayPrompt Nudge API provides a clean, structured way for developers and lending teams to automate repayment reminders across multiple channels. Whether you're building a micro-lending solution, integrating repayment workflows into a fintech product or designing an internal operations tool, this API offers predictable high-clarity endpoints for managing borrowers, loans and reminder schedules.

The API follows industry standards including:

- RESTful resource modeling  
- OpenAPI 3.x specification  
- Predictable error structures  
- Idempotent writes  
- Webhooks for event delivery  

This section introduces the core concepts behind the API, who it is designed for, and the problem it solves.

---

## 1.1 What is PayPrompt Nudge API?

The PayPrompt Nudge API is a lightweight, developer-friendly API that enables lenders and financial platforms to schedule, send, and track loan repayment reminders (“nudges”).

It abstracts the complexity of building a notification system by providing:

- A structured way to register borrowers  
- A reliable framework for tracking loans  
- Automated reminder scheduling  
- Multi-channel delivery (SMS, email, WhatsApp)  
- Delivery tracking and webhook support  

Optimized for:

- Micro-lenders  
- Consumer lending apps  
- SME loan providers  
- Internal finance/ops teams  
- Fintech platforms building credit or lending workflows  

Developers use PayPrompt to build automated “nudge” sequences that reduce missed payments, improve collections, and eliminate aggressive or harmful messaging practices.

---

## 1.2 Core Concepts

**Borrower**  
Represents a customer with one or more active loans. Includes name, phone, email, and active/inactive status.

**Loan**  
Belongs to a single borrower, containing principal, currency, due date, and repayment status.

**Reminder (Nudge)**  
Defines when and how repayment alerts should be sent. Includes:

- Trigger timing (before, on, after due date)
- Days offset
- Channel (SMS, email, WhatsApp)
- Status tracking

**Channels**

- SMS  
- Email  
- WhatsApp  
- Optional fallback channels (e.g., try SMS then email)

---

## 1.3 API Capabilities

PayPrompt Nudge API enables clients to:

**Register customers**  
Create and manage borrower records.

**Attach loan details**  
Add loans, set due dates, and update statuses.

**Schedule repayment reminders**  
Configure delivery timing, channels, and fallback.

**Track reminder delivery**  
Monitor states: scheduled → sent → failed → cancelled.

**Receive webhook notifications**  
Get real-time delivery outcomes for dashboards and escalation workflows.

---

## 1.4 Typical Use Cases

- **Single repayment reminder** (e.g., SMS 3 days before due date)  
- **Multi-touch reminder sequence** (before → on → after due date)  
- **Internal finance alerts via webhooks**  
- **Loan management dashboards**  
- **Compliance-friendly logs for audits**

---

# 2. Getting Started

This section covers everything you need to begin integrating PayPrompt: environments, URLs, authentication, and your first request.

---

## 2.1 Base URLs

**Production**  
Used for live data and real message delivery:  
`https://api.payprompt.dev/v1`

**Sandbox**  
Used for testing without sending real messages:  
`https://sandbox.payprompt.dev/v1`

Both environments share the same request/response formats.

---

## 2.2 Environments

**Production Environment**

- Real borrowers  
- Real loans  
- Real outbound messages  
- Real webhook events  

**Sandbox Environment**

- Fully isolated  
- No actual message delivery  
- Webhooks fire simulated (but properly structured) events  
- Safe for QA, staging, and development  

Switch environments by changing the base URL.

---

## 2.3 API Keys

Every request must include an API key.

Header:

```
x-api-key: YOUR_API_KEY
```

Types:

- Live API keys — production  
- Sandbox API keys — sandbox  

Keys are managed via:

`Dashboard → Developers → API Keys`

Never expose keys in client-side code.

---

## 2.4 Making Your First Request

Example: **Create a Borrower**

**Request**

```
POST https://sandbox.payprompt.dev/v1/borrowers
Content-Type: application/json
x-api-key: SANDBOX_API_KEY
```

**Body**

```json
{
  "fullName": "Ada Chidi",
  "phone": "+234801234578",
  "email": "adachidi@example.com"
}
```

**Response (201 Created)**

```json
{
  "id": "bor_12345",
  "fullName": "Ada Chidi",
  "email": "adachidi@example.com",
  "phone": "+2348012345678",
  "status": "active",
  "createdAt": "2025-11-13T10:22:00Z"
}
```

---

# 3. Authentication

All requests require a valid API key.

### Header

```
x-api-key: YOUR_API_KEY
```

### Example

```
GET /borrowers
Host: sandbox.payprompt.dev
x-api-key: SANDBOX_API_KEY
```

### Unauthorized Scenarios

| Status | Meaning |
|--------|---------|
| **401** | Invalid or missing API key |
| **403** | Valid key but action not permitted |

---

# 4. Requests & Responses

### 4.1 JSON Format

```
Content-Type: application/json
Accept: application/json
```

### 4.2 Timestamps  
ISO 8601, UTC.

```
2025-11-13T10:22:00Z
```

### 4.3 Idempotency  

```
Idempotency-Key: UNIQUE_KEY
```

Prevents duplicate borrower/loan/reminder creation during retries.

### 4.4 Pagination Example

```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "total": 125,
  "hasMore": true
}
```

---

# 5. Errors

## 5.1 Standard Error Schema

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "The phone number is invalid.",
    "details": [
      { "field": "phone", "issue": "must be in E.164 format" }
    ]
  }
}
```

## 5.2 Error Codes

| Code | Meaning |
|------|---------|
| INVALID_INPUT | Bad or missing fields |
| NOT_FOUND | No matching resource |
| UNAUTHORIZED | Invalid/missing API key |
| FORBIDDEN | Operation not permitted |
| RATE_LIMITED | Too many requests |
| INTERNAL_ERROR | Unexpected server error |

## 5.3 Examples

**Invalid Input**

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "dayOffset is required."
  }
}
```

**Resource Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Borrower not found."
  }
}
```

---

# 6. Resources & Endpoints

---

## 6.1 Borrowers

### Model

```json
{
  "id": "bor_12345",
  "fullName": "Ada Chidi",
  "email": "adachidi@example.com",
  "phone": "+2348012345678",
  "status": "active",
  "createdAt": "2025-11-13T10:22:00Z"
}
```

### Endpoints

- `POST /borrowers` — Create borrower  
- `GET /borrowers/{id}` — Retrieve borrower  
- `GET /borrowers` — List borrowers  

---

## 6.2 Loans

### Model

```json
{
  "id": "loan_98765",
  "borrowerId": "bor_12345",
  "principal": 50000,
  "currency": "NGN",
  "dueDate": "2025-12-01",
  "status": "active",
  "createdAt": "2025-11-10T09:00:00Z"
}
```

### Endpoints

- `POST /loans` — Create loan  
- `GET /loans/{id}` — Retrieve loan  
- `GET /loans` — List loans  

---

## 6.3 Reminders

A reminder is a scheduled notification sent before, on, or after a loan’s repayment due date.

### Model

```json
{
  "id": "rem_001",
  "loanId": "loan_98765",
  "type": "sms",
  "triggerType": "before_due",
  "daysOffset": 3,
  "status": "scheduled",
  "channelFallback": ["email"],
  "lastSentAt": null,
  "createdAt": "2025-11-10T09:00:00Z"
}
```

### Endpoints

- `POST /reminders` — Schedule reminder  
- `GET /reminders/{id}` — Get reminder  
- `GET /reminders` — List reminders  
- `POST /reminders/{id}/test` — Send test reminder  

### Template-Aware Reminders

PayPrompt supports two ways to define what the borrower will actually see:

1. **Template-based**  
   Use the `templateType` field to pick from PayPrompt’s curated messaging templates  
   (for example: `pre_due_soft`, `due_day`, `post_due_soft`), which keep your tone firm, professional, and non-abusive.

2. **Custom copy**  
   Use the `customMessage` field to send your own message text, including variables
   like `{{name}}`, `{{amount}}`, and `{{due_date}}` that your system can substitute before calling the API.

If both fields are provided in the same request, `customMessage` takes priority for the
final message body, while `templateType` is still stored on the reminder for reporting
and analytics.

#### Example 1: Schedule a pre-due reminder using a template

**Request**

```json
POST /reminders
Host: sandbox.payprompt.dev
x-api-key: SANDBOX_API_KEY
Content-Type: application/json

{
  "loanId": "loan_98765",
  "type": "sms",
  "triggerType": "before_due",
  "daysOffset": 3,
  "templateType": "pre_due_soft",
  "channelFallback": ["email"]
}
```

### Example 2: Reminder using a custom message (`customMessage`)

#### Example: Schedule a reminder with your own message

**Request**

```json
POST /reminders
Host: sandbox.payprompt.dev
x-api-key: SANDBOX_API_KEY
Content-Type: application/json

{
  "loanId": "loan_98765",
  "type": "whatsapp",
  "triggerType": "after_due",
  "daysOffset": 1,
  "customMessage": "Hi {{name}}, your repayment of {{amount}} was due on {{due_date}} and is now overdue. Please complete your payment as soon as possible to avoid extra charges.",
  "channelFallback": ["sms"]
}
```

**Sample response (truncated)**

```json
{
  "id": "rem_001",
  "loanId": "loan_98765",
  "type": "whatsapp",
  "triggerType": "after_due",
  "daysOffset": 1,
  "status": "scheduled",
  "templateType": "post_due_soft",
  "messagePreview": "Hi Ada, your repayment of NGN 50,000 was due on 2025-12-01 and is now overdue...",
  "createdAt": "2025-11-11T14:30:00Z"
}
```

---

## 6.4 Webhooks

### Event Types

| Event | Description |
|--------|-------------|
| reminder.sent | Reminder successfully delivered |
| reminder.failed | Delivery failed after retries |

### Payload: reminder.sent

```json
{
  "id": "evt_01HFQ3J5V6M9T2",
  "type": "reminder.sent",
  "createdAt": "2025-11-13T15:04:05Z",
  "data": {
    "reminder": { },
    "delivery": {
      "channel": "sms",
      "status": "sent",
      "attempts": 1,
      "lastAttemptAt": "2025-11-13T15:04:05Z",
      "failureReason": null
    }
  }
}
```

### Payload: reminder.failed

```json
{
  "id": "evt_01HFQ4JTT8LM9X",
  "type": "reminder.failed",
  "createdAt": "2025-11-13T15:10:00Z",
  "data": {
    "reminder": { },
    "delivery": {
      "channel": "sms",
      "status": "failed",
      "attempts": 3,
      "lastAttemptAt": "2025-11-13T15:10:00Z",
      "failureReason": "Phone unreachable"
    }
  }
}
```

### Retry Logic

- Up to 3 retries  
- Exponential backoff  
- Permanent failure after final attempt  

### Signature Verification

```
x-payprompt-signature: t=1699990000, s=39fde92acb9e44a...
```

---

# 7. Messaging Templates

PayPrompt Nudge API includes a set of **clean, respectful, and effective repayment reminder templates** designed to replace the aggressive, unprofessional, and harmful messages commonly seen in the lending space.

These templates focus on:

- **Prompting action without threats**
- **Maintaining borrower dignity**
- **Creating urgency through clarity, not fear**
- **Improving repayment rates using behavioral insights**
- **Protecting lenders from reputational damage**

Every reminder created through the API can be linked to one of these templates, or you may supply your own custom message.


## 7.1 Template Variables

The examples below use simple variables that your system can substitute before calling the API:


| Variable | Description |
|--------|-------------|
| {{name}} | Borrower’s first name or full name |
| {{amount}} | Amount due (with currency) |
| {{due_date}} | Loan repayment due date |
| {{loan_id}} | Loan identifier |
| {{reference}} | Your internal reference |

## 7.2 Pre-Due Reminders

(3 days, 1 day, or a few hours before due date)

**Template A (3 days before)**

```
Hi {{name}}, just a quick reminder 😊  
Your loan repayment of {{amount}} is due on {{due_date}}.  
Kindly plan ahead to avoid any late fees.  
If you’ve already paid, thank you!
```

**Why it works:**
Soft, proactive, and polite. Helps the borrower plan mentally.

**Template B (1 day before)**

```
Hi {{name}}, this is a reminder that your repayment of {{amount}} is due tomorrow ({{due_date}}).  
Making it on time keeps your account in good standing.  
Thank you!
```

**Why it works:**

- Clear urgency, but still calm and respectful.
- Frames repayment as "keeping a good record", not fear.

## 7.3 Due-Day Reminders

```
Hi {{name}}, your repayment of {{amount}} is due today ({{due_date}}).  
You can make your payment now to avoid any penalties or late fees on your account.  
Thank you for your prompt response.
```

**Why it works:**
Direct, action-oriented, and still warm.

## 7.4 Post-Due Reminders (After Due Date)

This is the hardest category; lenders are usually angry, borrowers are embarrassed, tensions are high.

Your templates MUST be:

- Calm
- Clear
- Firm but respectful
- Focused on resolution

**Template A (1 day late)**

```
Hi {{name}}, we noticed your repayment of {{amount}} was due on {{due_date}} and is now overdue.  
Please make your payment as soon as possible to avoid additional late fees.  
If you’ve already paid, thank you — kindly ignore this message.
```

**Why it works:**
Acknowledges delay without shaming. Gives them an easy “way out.”

**Template B (3 days late - higher urgency)**

```
Hi {{name}}, your repayment of {{amount}} is still outstanding.  
Please complete your payment today to prevent further charges or restrictions on your account.  
If you're having any issues, you can reach out for support.
```

**Why it works:**
Introduces consequences without hostility. 

**Template C (7 days late — maximum seriousness without threats)**

```
Hi {{name}}, your repayment of {{amount}} remains unpaid and your account is now at risk of escalation.  
To avoid additional charges or formal recovery steps, please complete your payment immediately.  
If you're experiencing difficulties, reply or contact support so we can assist.
```

**Why it works:**
Leaves room for honest difficulty ("if you're having issues....").

## 7.4 Behavioural Psychology Principles Used

When using PayPrompt, we recommend that all templates:

- **Avoid threats** (no insults, curses, or violence)
- **Avoid shaming language** (no “you are irresponsible”, “you’re a bad person”)
- **Stay factual and action-focused** (amount, date, what to do)
- **Offer a path to resolution** (“reach out if you’re having difficulties”)

This protects:

- the borrower’s dignity,
- your brand reputation,
- and your compliance posture.


## 7.6 Using Templates With PayPrompt

You can:

- Use these templates directly in your system (substituting variables),
- Store your own variations, or
- Mix both: your own copy & our structure.

In a future version, PayPrompt can expose **template types** (e.g, `pre_due_soft`, `due_day`, `post_due_firm`) directly in the API so you can trigger presets instead of managing text yourself.

---

# 8. Guides

Guide 1: Send Your First Reminder in 10 Minutes  
Guide 2: Build a 3-Touch Reminder Flow  
Guide 3: Handle Failed Reminders via Webhooks  

---

# 9. Reference (OpenAPI + Tools)

**OpenAPI Specification**  
`openapi.json`

**Swagger UI**  
- Explore endpoints  
- Run authenticated requests  
- Inspect schemas  

**Bruno Testing**  
- Import `bruno_collection.json`  
- Configure environments  
- Run and save responses  

---

# 10. Changelog

### v1.0 — Initial Release

- Borrowers  
- Loans  
- Reminders  
- Webhooks  
- Pagination  
- Idempotency  
- Full OpenAPI 3.0.3 Specification  
- Sandbox + Production Support
