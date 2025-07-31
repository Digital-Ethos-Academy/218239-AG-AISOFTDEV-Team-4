# Architectural Decision Record (ADR)

## Title
Utilization of SQLite with Python FastAPI for Mental Health Check-In Application Backend

## Status
Accepted

## Context
The project involves developing a mental health check-in web application to track user moods and journal entries. The application requires a lightweight, self-contained database solution to handle user data, mood tracking, and journaling, aligning with the SQL schema provided. The primary requirements are simplicity, ease of deployment, low maintenance overhead, and compatibility with Python-based frameworks.

## Decision
The decision is to use SQLite as the database for the backend of the mental health check-in application, implemented using the Python FastAPI framework. SQLite is chosen due to its lightweight nature, ease of use, and seamless integration with Python, which aligns with FastAPI's strengths in building modern web applications. This setup provides a straightforward solution for managing the application's data requirements, including user authentication, mood tracking, and journaling.

## Consequences

### Positive Consequences
- **Simplicity and Ease of Use**: SQLite provides a simple database solution that is easy to set up and requires minimal configuration, making it ideal for a small to medium-scale application like this.
- **Portability**: As a self-contained, serverless database, SQLite can be easily integrated and deployed across different environments without additional dependencies.
- **Cost-Effective**: No need for a dedicated database server reduces both infrastructure costs and maintenance overhead.
- **Rapid Development**: FastAPI, combined with SQLite, allows for rapid development and iteration due to native support in Python, facilitating quick prototyping and deployment.

### Negative Consequences
- **Scalability Limits**: SQLite may not handle very high concurrent write operations efficiently, which could be a limitation if the application scales significantly in the future.
- **Concurrency Constraints**: SQLite uses file locks for concurrency control, which might lead to performance bottlenecks under heavy write loads.
- **Limited Advanced Features**: Compared to other database systems like PostgreSQL, SQLite has limited support for advanced features and optimization capabilities.

## Notes
While SQLite is an excellent choice for the current scale and scope of the project, it may be necessary to consider transitioning to a more robust database system if the application's user base grows significantly.

## Related Decisions
N/A

## Date
July 31, 2025

## Author
Team 4
