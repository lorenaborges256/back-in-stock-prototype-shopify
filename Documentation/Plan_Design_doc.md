# Project: Shopify Back-in-Stock Notification Prototype

## Problem context

A small Shopify merchant may lose a potential sale when an interested customer visits an unavailable product but has no simple way to learn when the required variant becomes available. Existing third-party applications may include broader feature sets or ongoing costs that are disproportionate to a merchant who needs only a focused back-in-stock email workflow. Any cost or feature comparison used in the final article must be validated with current external evidence rather than presented only as personal experience.

## Focused problem statement

> Customers who encounter an unavailable product variant need a clear and privacy-conscious way to request a one-time email notification. The merchant needs the request to be associated with the exact variant and processed automatically when inventory changes from zero to a positive quantity, without collecting unnecessary personal information or sending unrelated marketing.

## Project aim

The project aims to design and prototype a minimal Shopify-connected notification workflow that captures an email request for an unavailable product variant, stores that request securely, reacts to an inventory-availability event, generates one controlled test email, and records the outcome.

## Intended users and stakeholders

| Stakeholder | Need or interest |
|---|---|
| Customer | Request a notification easily, understand how the email address will be used, and avoid unrelated messages. |
| Store owner | Recover potential sales through a focused workflow without administering unnecessary features. |
| Developer/student | Produce an understandable, testable and well-documented prototype that demonstrates the article’s proposed solution. |


## Project objectives

| ID | Objective |
|---|---|
| O1 | Present a variant-aware **Notify me when available** control when the selected variant is unavailable. |
| O2 | Collect only the information required for an email notification, with clear and separate permission if optional marketing consent is included. |
| O3 | Validate the request on the server and prevent duplicate pending subscriptions for the same email and variant. |
| O4 | Store each request with a limited status lifecycle such as pending, sent, failed or cancelled. |
| O5 | Process a verified Shopify inventory event or a clearly labelled controlled event fixture representing a zero-to-positive stock change. |
| O6 | Generate one captured back-in-stock email through a safe test-email service rather than deliver to a real customer. |
| O7 | Record and test successful, invalid, duplicate and failed scenarios without exposing credentials or personal data. |
| O8 | Produce professional documentation that explains setup, versions, configuration, operation, testing, limitations and troubleshooting. |
| O9 | Connect the article’s analysis directly to the prototype’s design decisions, evidence, limitations and learning outcomes. |

## Agreed solution architecture

| Layer | Agreed technology or approach |
|---|---|
| Development commerce environment | Shopify development store |
| Storefront component | Shopify Liquid, HTML, CSS and browser JavaScript |
| Server-side application | Node.js and Express |
| Persistence | MongoDB |
| Inventory trigger | Shopify `inventory_levels/update` webhook, with a controlled inventory-event fixture as the time-bounded fallback |
| Email demonstration | Nodemailer with Ethereal |
| React | Excluded from the storefront MVP; retained only as a considered alternative or possible future administration interface |

Shopify documents development stores as controlled environments for testing applications without affecting a live merchant store.[1] Shopify’s webhook guidance supports event-driven application behaviour but also requires authenticity and reliability controls such as signature verification and duplicate-delivery handling.[2] [3] Ethereal captures generated messages for preview without delivering them to real recipients, making it appropriate for this controlled prototype.[4]

## In scope

| Area | Included capability |
|---|---|
| Storefront | Unavailable-state control, variant identification, accessible form, submission feedback and return-to-product link. |
| Data collection | Email address, exact product/variant identifiers, timestamps, request status and optional first name only if justified. |
| Validation | Required fields, basic email-format checking, valid variant reference and duplicate prevention. |
| Inventory workflow | Processing an inventory-level event and confirming that the relevant quantity became positive. |
| Notification | One controlled back-in-stock email preview for each eligible pending request. |
| Reliability | Idempotent handling so a completed request is not notified twice, plus safe failure recording. |
| Security and privacy | Server-side secret storage, webhook verification, data minimisation, neutral error responses and no secrets in documentation. |
| Testing | Documented normal, invalid, duplicate, irrelevant-event, repeated-event and email-failure cases. |
| Documentation | README, requirements, project plan, test evidence, decision log, limitations and troubleshooting. |
| Article | Problem validation, industry trends, technical and ethical analysis, solution, prototype, technology justification, plan, reflection and future improvements. |

## Out of scope

| Excluded feature | Reason for exclusion |
|---|---|
| SMS and phone-number collection | Not required for an email-only problem and increases privacy, security and integration scope. |
| Real customer email delivery | A controlled email preview is sufficient to demonstrate the workflow safely. |
| General marketing automation | The project is a requested transactional notification, not a campaign platform. |
| Public Shopify App Store publication | Distribution, review, billing and multi-merchant requirements are disproportionate to the assessment window. |
| Merchant billing | Not necessary to validate the technical solution. |
| Multi-store tenancy | The prototype targets one development store. |
| Complex analytics dashboard | Does not contribute directly to the core problem. |
| Stock reservation or waiting-list priority | The email informs the customer but does not guarantee availability. |
| Production-scale queues and reconciliation | Important future work, but not essential to the bounded prototype. |
| Full React administration interface | Adds scope without improving the core customer workflow. |

## ERD

| Category | Entity | Include? | Reason |
| --- | --- | --- | --- |
| Prototype collection | `NotificationRequest` | Yes | Stores the customer’s one-time request and its lifecycle. |
| Prototype collection | `ProcessedInventoryEvent` | Yes | Records event deliveries and prevents repeated processing. |
| External Shopify record | `ShopifyProduct` | Yes | Provides the product identity, title and page context. |
| External Shopify record | `ShopifyVariant` | Yes | Identifies the exact size, colour or other option requested. |
| External Shopify record | `ShopifyInventoryItem` | Yes | Connects the variant to the inventory-change event. |
| Customer | `Customer` | No | The MVP does not create customer accounts; the email belongs directly to the request. |
| Email message | `EmailMessage` | No | One controlled message is sufficiently represented by fields on `NotificationRequest`. A separate entity would be unnecessary scope. |
| Store | `ShopifyStore` | No | The prototype supports one development store; `shopDomain` can remain a field. |

## data model

| Field                       | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `email`                     | Address used for the controlled notification.                     |
| `firstName`                 | Optional personalisation; omit it if unused.                      |
| `productId`                 | Identifies the Shopify product.                                   |
| `variantId`                 | Identifies the exact size, colour or other variant requested.     |
| `inventoryItemId`           | Connects the request to Shopify’s inventory event.                |
| `productTitle`              | Describes the product in the email.                               |
| `variantTitle`              | Describes the selected variant.                                   |
| `productUrl`                | Sends the customer back to the product page.                      |
| `status`                    | Records `pending`, `processing`, `sent`, `failed` or `cancelled`. |
| `notificationConsentAt`     | Records when the customer requested the notification.             |
| `createdAt` and `updatedAt` | Record the request lifecycle.                                     |
| `sentAt`                    | Added only after a successful test email.                         |
| `emailMessageId`            | Stores the Ethereal test-message reference.                       |
| `lastErrorCode`             | Stores a safe failure category without sensitive details.         |


## API endpoints

| Method and endpoint                          | Used by             | Purpose                                                                     |
| -------------------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| `POST /api/notifications`                    | Storefront form     | Creates a back-in-stock request.                                            |
| `POST /api/webhooks/inventory-levels-update` | Shopify             | Sends an inventory-change event to the server.                              |
| `POST /api/test/inventory-event`             | Developer/test only | Simulates the inventory event if webhook integration is incomplete.         |
| `GET /health`                                | Developer           | Confirms that the server is reachable without exposing private information. |


##  Implement variant-aware storefront control and form
This choice should be recorded in your decision log: the duplicated-theme editor was selected because it has lower setup complexity for the deadline; local CLI development remains a stronger future workflow for local preview and version control.



## References

[1]: https://shopify.dev/docs/apps/build/dev-dashboard/stores/development-stores "Shopify: Dev Stores for App Testing"
[2]: https://shopify.dev/docs/apps/build/webhooks "Shopify: About Webhooks"
[3]: https://shopify.dev/docs/apps/build/webhooks/verify-deliveries "Shopify: Verify Webhook Deliveries"
[4]: https://nodemailer.com/guides/testing-with-ethereal "Nodemailer: Testing with Ethereal"
[5]: https://files.manuscdn.com/user_upload_by_module/session_file/310519663577220189/uDfbfYJjcEOBbzMV.pdf "ISK1002 Assessment 2 Brief"
