# Architectural Decision Record (ADR)

## Title
Modularization of Webpages into Separate Components with JSX Files

## Status
Accepted

## Context
As the complexity of our web application grows, maintaining and scaling the codebase has become increasingly challenging. A modular approach enables better organization, ease of maintenance, and scalability. The current challenge is to efficiently manage multiple UI views and components while ensuring a clear separation of concerns. This decision is driven by the need to enhance code readability, facilitate component reuse, and streamline the application development process.

## Decision
The application will adopt a component-based architecture where each webpage is broken down into smaller, reusable components, each housed in its own JSX file. The `app.jsx` file will be responsible for managing routes and navigation across these components, while the `index.jsx` file will handle rendering the root component of the application.

## Consequences

### Positive Consequences
- **Enhanced Maintainability:** Code is organized into distinct, manageable pieces, making it easier to track changes and debug issues.
- **Improved Reusability:** Components can be reused across different parts of the application, reducing redundancy and development time.
- **Scalability:** The application structure supports the addition of new features without significant rework, accommodating future growth.
- **Separation of Concerns:** By isolating routing logic in `app.jsx` and rendering in `index.jsx`, we maintain a clean separation between the application flow and the UI rendering.

### Negative Consequences
- **Initial Learning Curve:** Developers may need time to adapt to the new architectural style, especially those unfamiliar with component-based architecture.
- **Increased Overhead:** Setting up and managing multiple components can introduce additional overhead during the initial development phase.
- **Potential for Over-Engineering:** Risk of creating too many small components that complicate rather than simplify the application structure.

## Notes
This architectural decision aligns with industry best practices for building modern React applications and leverages the strengths of JSX in creating dynamic, component-based UIs.

## Related Decisions
- ADR for selecting React as the frontend framework, which complements this component-based approach.
- ADR regarding the adoption of a state management library for handling application state across components.

## Date
August 1, 2025

## Author
Team 4

---

This ADR provides a comprehensive overview of the decision to modularize the application using separate JSX components, detailing the rationale, expected outcomes, and implications of this architectural choice.