```mermaid
graph TB
    Client[Client Browser] --> FE[Frontend React App]
    FE -- "REST API Calls" --> API[FastAPI Backend]
    API -- "SQL Queries" --> DB[(Database)]
    
    subgraph Frontend
        FE --> Router[React Router]
        Router --> Pages[Page Components]
        Pages --> UIComponents[UI Components]
        UIComponents --> DSComponents[Design System]
        Pages --> StateManagement[State Management]
        StateManagement --> Contexts[Context Providers]
        StateManagement --> Hooks[Custom Hooks]
        FE --> Services[API Services]
        Services --> Auth[Auth Service]
        Services --> IntService[Integration Service]
        Services --> UserService[User Service]
        Services --> ErrorService[Error Tracking]
    end
    
    subgraph Backend
        API --> Middleware[Middleware Layer]
        Middleware --> AuthMiddleware[Auth Middleware]
        Middleware --> RateLimit[Rate Limiter]
        Middleware --> SecurityHeaders[Security Headers]
        Middleware --> Timing[Request Timing]
        API --> Routes[API Routes]
        Routes --> IntController[Integration Controller]
        Routes --> AdminController[Admin Controller]
        Routes --> UserController[User Controller]
        Routes --> EarningsController[Earnings Controller]
        IntController --> IntService[Integration Service]
        AdminController --> AdminService[Admin Service]
        UserController --> UserService[User Service]
        EarningsController --> EarningsService[Earnings Service]
        IntService --> IntModels[Integration Models]
        AdminService --> AdminModels[Admin Models]
        UserService --> UserModels[User Models]
        EarningsService --> EarningsModels[Earnings Models]
        API --> Connectors[Integration Connectors]
        Connectors --> AzureConn[Azure Connector]
        Connectors --> S3Conn[S3 Connector]
        Connectors --> APIConn[API Connector]
        Connectors --> SharePointConn[SharePoint Connector]
        Connectors --> DBConn[Database Connector]
        API --> Runner[Integration Runner]
        Runner --> Scheduler[Scheduler]
        Runner --> DataTransform[Data Transformation]
        Runner --> FieldMapping[Field Mapping]
        Runner --> ErrorHandling[Error Handling]
    end
    
    subgraph Infrastructure
        DB --> Models[Data Models]
        Models --> IntegrationModel[Integration]
        Models --> UserModel[User]
        Models --> TenantModel[Tenant]
        Models --> ApplicationModel[Application]
        Models --> DatasetModel[Dataset]
        Models --> FieldMappingModel[FieldMapping]
        Models --> WebhookModel[Webhook]
        DB --> Migrations[DB Migrations]
    end
    
    subgraph External Systems
        Connectors --> AzureBlob[Azure Blob Storage]
        Connectors --> S3[Amazon S3]
        Connectors --> SharePoint[SharePoint]
        Connectors --> ExternalAPIs[External APIs]
        Connectors --> ExternalDB[External Databases]
    end
    
    subgraph Security
        AuthMiddleware --> JWT[JWT Authentication]
        JWT --> OAuth[OAuth Flow]
        JWT --> MFA[Multi-Factor Auth]
        Security[Security Layer] --> Encryption[Data Encryption]
        Security --> RBAC[Role-Based Access]
        Security --> TenantIsolation[Tenant Isolation]
    end
    
    class Client,FE,API,DB,AzureBlob,S3,SharePoint,ExternalAPIs,ExternalDB emphasis
```