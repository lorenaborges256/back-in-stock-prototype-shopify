# Shopify Back-in-Stock Notification Prototype
## Designing a Privacy-Conscious Back-in-Stock Email Notification Prototype for Shopify

**Assessment:** ISK1002 – Industry Skills II, Assessment 2: Technical Blog Post & Prototype

## Problem context

A small Shopify merchant may lose a potential sale when an interested customer visits an unavailable product but has no simple way to learn when the required variant becomes available. Existing third-party applications may include broader feature sets or ongoing costs that are disproportionate to a merchant who needs only a focused back-in-stock email workflow. Any cost or feature comparison used in the final article must be validated with current external evidence rather than presented only as personal experience.

## In scope

The project provides a back-in-stock notification system with product availability tracking, customer request collection, data validation, and email notifications. It includes measures for reliability, security, and privacy, such as duplicate prevention, webhook verification, and data minimisation. The project is supported by testing, documentation, and an article that discusses the problem, solution design, implementation, evaluation, and future improvements.

## Out of scope

To keep the project focused, several features were excluded. SMS notifications, phone number collection, and real customer email delivery were not included because the solution is designed for email notifications only. Marketing automation, Shopify App Store publication, merchant billing, and multi-store support were also excluded, as they add unnecessary complexity. The project does not include advanced analytics, stock reservation, production-scale queue management, or a full React administration interface because these features are not essential for demonstrating the core back-in-stock notification workflow.

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

The most appropriate architecture is a **Shopify-connected JavaScript prototype with a controlled fallback**. It uses the student’s existing JavaScript, Express and MongoDB experience while introducing only the Shopify-specific concepts needed to demonstrate the business problem. React should not be forced into the customer-facing product page: Shopify themes already render their storefront through Liquid, HTML, CSS and JavaScript, so a small theme component is more proportionate. React can be discussed as an alternative or reserved for a future administrative dashboard.

| Layer | Recommended choice | Purpose |
|---|---|---|
| Store and test products | Shopify development store | Provides a safe product, variant and inventory environment. |
| Storefront | Liquid, HTML, CSS and JavaScript | Displays the variant-aware “Notify me when available” control and form. |
| Server | Node.js and Express | Validates requests, processes inventory events and controls email generation. |
| Data | MongoDB with a small notification-request model | Stores pending, sent, failed or cancelled requests. |
| Inventory event | Shopify `inventory_levels/update` webhook | Notifies the server that an inventory level changed. |
| Controlled email | Nodemailer with Ethereal | Captures the generated message without delivering it to a real customer. |
| Optional fallback | Controlled inventory-event fixture/test endpoint | Demonstrates the same business workflow if genuine webhook delivery cannot be completed in time. |

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