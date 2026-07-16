# Shopify Back-in-Stock Notification Prototype
## Designing a Privacy-Conscious Back-in-Stock Email Notification Prototype for Shopify

**Assessment:** ISK1002 – Industry Skills II, Assessment 2: Technical Blog Post & Prototype

## Problem context

A small Shopify merchant may lose a potential sale when an interested customer visits an unavailable product but has no simple way to learn when the required variant becomes available. Existing third-party applications may include broader feature sets or ongoing costs that are disproportionate to a merchant who needs only a focused back-in-stock email workflow. Any cost or feature comparison used in the final article must be validated with current external evidence rather than presented only as personal experience.

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

## Ethical and privacy safeguards

The minimum form will collect **email only**, with first name optional if the student can justify its use. A phone number will not be collected. Permission to receive the requested back-in-stock message will be explained clearly. Any optional general marketing consent must be separate, unticked by default and unnecessary for receiving the requested notification. The interface will state that the email does not reserve stock and availability may change before the customer returns.

Test data will use invented identities and non-sensitive addresses suitable for a fake SMTP service. Secrets will be loaded from environment variables and represented only by placeholder names in documentation. Logs will avoid full credentials, tokens and unnecessary personal information.

## Primary user stories

| ID | User story | Priority |
|---|---|---|
| US-01 | As a customer viewing an unavailable variant, I want to request an email notification so that I can return when that exact variant becomes available. | Must |
| US-02 | As a customer, I want to understand why my email is requested and what the notification does not guarantee so that I can make an informed choice. | Must |
| US-03 | As a customer, I want a clear confirmation or correction message after submitting the form so that I know whether the request was accepted. | Must |
| US-04 | As a merchant, I want duplicate requests to be prevented so that customers do not receive repeated messages. | Must |
| US-05 | As a merchant, I want pending requests processed when relevant inventory becomes available so that the workflow requires minimal manual intervention. | Must |
| US-06 | As a developer, I want failures and repeated events handled safely so that the prototype does not record false success or send duplicate notifications. | Must |
| US-07 | As an assessor, I want the prototype’s integrated, simulated and unfinished behaviour identified accurately so that the evidence is trustworthy. | Must |
| US-08 | As a merchant, I want a visual dashboard showing all requests and analytics. | Won’t in MVP |
| US-09 | As a customer, I want an SMS notification. | Won’t in MVP |



## References

1. [Shopify: Dev Stores for App Testing](https://shopify.dev/docs/apps/build/dev-dashboard/stores/development-stores)
2. [Shopify: About Webhooks](https://shopify.dev/docs/apps/build/webhooks)
3. [Shopify: Verify Webhook Deliveries](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries)
4. [Nodemailer: Testing with Ethereal](https://nodemailer.com/guides/testing-with-ethereal)