# TAP Integration Platform - Database Schema

## Core Entities

### Users and Authentication

```
+------------------+       +--------------------+       +----------------------+
|     User         |       |    UserMFA         |       |  UserLoginHistory    |
+------------------+       +--------------------+       +----------------------+
| id (PK)          |<----->| id (PK)            |       | id (PK)              |
| username         |       | user_id (FK)       |       | user_id (FK)         |
| email            |       | mfa_enabled        |       | ip_address           |
| name             |       | mfa_verified       |       | user_agent           |
| role             |       | mfa_secret         |       | login_time           |
| tenant_id        |       | mfa_recovery_codes |       | success              |
| auth_provider    |       | created_at         |       | failure_reason       |
| hashed_password  |       | updated_at         |       +----------------------+
| account_status   |       | last_verified      |                 ^
| bypass_mfa       |       +--------------------+                 |
| created_at       |                                              |
| last_login       +----------------------------------------------+
+--------+---------+
         |
         v
+-----------------+
|   Invitation    |
+-----------------+
| id (PK)         |
| email           |
| token           |
| expiration_date |
| created_by (FK) |
| status          |
| role            |
| created_at      |
| accepted_at     |
+-----------------+
```

### Multi-Tenancy

```
+------------------+          +----------------------------+          +---------------------------+
|     Tenant       |<---------| TenantApplicationAssoc     |--------->|       Application         |
+------------------+          +----------------------------+          +---------------------------+
| id (PK)          |          | id (PK)                    |          | id (PK)                   |
| name             |          | tenant_id (FK)             |          | name                      |
| description      |          | application_id (FK)        |          | type                      |
| status           |          | is_active                  |          | description               |
| tier             |          | granted_at                 |          | auth_type                 |
| settings         |          | granted_by                 |          | status                    |
| created_at       |          +----------------------------+          | is_public                 |
| updated_at       |                                                  | connection_parameters     |
+------------------+          +----------------------------+          | documentation_url         |
        ^                     | TenantDatasetAssoc         |          | support_url               |
        |                     +----------------------------+          | tenant_id                 |
        |                     | id (PK)                    |          | created_at                |
        |                     | tenant_id (FK)             |          | updated_at                |
        |                     | dataset_id (FK)            |          +------------+--------------+
        |                     | is_active                  |                       |
        |                     | granted_at                 |                       |
        |                     | granted_by                 |                       v
        |                     +-------------+--------------+          +---------------------------+
        |                                   |                         |       Dataset             |
        |                                   +------------------------>+---------------------------+
        |                                                            | id (PK)                   |
        |                                                            | name                      |
        |                                                            | description               |
        |                                                            | status                    |
        |                                                            | schema                    |
        |                                                            | sample_data               |
        |                                                            | tenant_id                 |
        |                                                            | created_at                |
        |                                                            | updated_at                |
        |                                                            +-----------+---------------+
        |                                                                        |
        |                                                                        v
        |      +-------------------------------+                     +---------------------------+
        |      |      MFASettings              |                     |      DatasetField         |
        +----->+-------------------------------+                     +---------------------------+
               | id (PK)                       |                     | id (PK)                   |
               | tenant_id (FK)                |                     | dataset_id (FK)           |
               | enforcement_type              |                     | name                      |
               | grace_period_days             |                     | description               |
               | totp_enabled                  |                     | data_type                 |
               | recovery_codes_enabled        |                     | is_required               |
               | created_at                    |                     | is_primary_key            |
               | updated_at                    |                     | format                    |
               +-------------------------------+                     | constraints               |
                                                                    | created_at                |
                                                                    | updated_at                |
                                                                    +---------------------------+
```

### Integrations

```
+------------------+       +--------------------+       +----------------------+
|   Integration    |<----->| FieldMapping       |       |    IntegrationRun    |
+------------------+       +--------------------+       +----------------------+
| id (PK)          |       | id (PK)            |       | id (PK)              |
| name             |       | integration_id (FK)|       | integration_id (FK)  |
| type             |       | source_field       |       | status               |
| source           |       | destination_field  |       | start_time           |
| destination      |       | transformation     |       | end_time             |
| description      |       | required           |       | records_processed    |
| tenant_id        |       | description        |       | warnings             |
| owner_id         |       | created_at         |       | error                |
| health           |       | updated_at         |       +----------------------+
| schedule         |       +--------------------+                 ^
| created_at       |                                              |
| updated_at       |       +--------------------+                 |
| last_run_at      |<----->| Webhook            |<-+              |
+---------+--------+       +--------------------+ |              |
          |                | id (PK)            | |              |
          |                | name               | |              |
          |                | url                | |              |
          |                | auth_type          | |              |
          |                | events             | |              |
          |                | filters            | |              |
          |                | integration_id (FK)| |              |
          |                | application_id (FK)| |              |
          |                | status             | |              |
          |                +--------------------+ |              |
          |                         ^             |              |
          |                         |             |              |
          v                         |             v              |
+------------------+                |       +----------------------+
| integration_tags |                |       |    WebhookLog        |
+------------------+                |       +----------------------+
| integration_id   |                +-------| webhook_id (FK)      |
| tag_id           |                        | event_type           |
+------------------+                        | payload              |
                                           | response_status_code |
                                           | is_success           |
                                           | created_at           |
                                           +----------------------+
```

### Earnings Mapping

```
+------------------+       +--------------------+       +----------------------+
| EmployeeRoster   |<----->| Employee           |<----->| EmployeeEarnings     |
+------------------+       +--------------------+       +----------------------+
| id (PK)          |       | id (PK)            |       | id (PK)              |
| name             |       | roster_id (FK)     |       | employee_id (FK)     |
| source_id        |       | external_id        |       | source_type          |
| destination_id   |       | source_id          |       | amount               |
| description      |       | destination_id     |       | hours                |
| tenant_id        |       | first_name         |       | period_start         |
| owner_id         |       | last_name          |       | period_end           |
| integration_id   |       | email              |       | attributes           |
| last_sync_at     |       | attributes         |       | created_at           |
| created_at       |       | created_at         |       +----------------------+
| updated_at       |       | updated_at         |
+--------+---------+       +--------------------+
         |
         |
         |     +--------------------+       +----------------------+
         +---->| EarningsMap        |<----->| EarningsCode         |
         |     +--------------------+       +----------------------+
         |     | id (PK)            |       | id (PK)              |
         |     | roster_id (FK)     |       | code                 |
         |     | source_type        |       | name                 |
         |     | earnings_code_id   |       | description          |
         |     | default_map        |       | destination_system   |
         |     | condition          |       | is_overtime          |
         |     | created_at         |       | attributes           |
         |     | updated_at         |       | created_at           |
         |     +--------------------+       | updated_at           |
         |                                   +----------------------+
         |
         |
         |     +--------------------+
         +---->| BusinessRule       |
               +--------------------+
               | id (PK)            |
               | roster_id (FK)     |
               | name               |
               | description        |
               | rule_type          |
               | rule_definition    |
               | earnings_code_id   |
               | is_active          |
               | created_at         |
               | updated_at         |
               +--------------------+
```

### Monitoring and Analytics

```
+------------------+       +--------------------+       +----------------------+
| DocumentView     |       | EmailConfiguration |       | ErrorLog             |
+------------------+       +--------------------+       +----------------------+
| id (PK)          |       | id (PK)            |       | id (PK)              |
| document_id      |       | tenant_id (FK)     |       | level                |
| user_id (FK)     |       | provider           |       | message              |
| timestamp        |       | settings           |       | source               |
| feedback         |       | from_email         |       | context              |
| doc_metadata     |       | from_name          |       | user_id              |
+------------------+       | reply_to           |       | tenant_id            |
                          | created_at         |       | created_at           |
                          | updated_at         |       +----------------------+
                          +--------------------+

+------------------+       +--------------------+
| EmailTemplate    |       | Tag                |
+------------------+       +--------------------+
| id (PK)          |       | id (PK)            |
| name             |       | name               |
| subject          |       | description        |
| html_content     |       +--------------------+
| text_content     |
| tenant_id (FK)   |
| created_at       |
| updated_at       |
+------------------+
```

## Relationships

1. **User to Tenant**: Many-to-One (Users belong to a tenant)
2. **User to MFA**: One-to-One (Each user can have MFA settings)
3. **User to LoginHistory**: One-to-Many (Users have multiple login records)
4. **Tenant to Applications**: Many-to-Many (Tenants can access multiple applications)
5. **Tenant to Datasets**: Many-to-Many (Tenants can access multiple datasets)
6. **Tenant to MFASettings**: One-to-One (Each tenant has MFA configuration)
7. **Integration to FieldMapping**: One-to-Many (Integrations have multiple field mappings)
8. **Integration to IntegrationRun**: One-to-Many (Integrations have multiple execution records)
9. **Integration to Webhook**: One-to-Many (Integrations can have multiple webhooks)
10. **Webhook to WebhookLog**: One-to-Many (Webhooks have multiple execution logs)
11. **Integration to Tags**: Many-to-Many (Integrations can have multiple tags)
12. **Application to Dataset**: Many-to-Many (Applications can use multiple datasets)
13. **Dataset to DatasetField**: One-to-Many (Datasets have multiple fields)
14. **EmployeeRoster to Employee**: One-to-Many (Rosters contain multiple employees)
15. **Employee to EmployeeEarnings**: One-to-Many (Employees have multiple earnings records)
16. **EmployeeRoster to EarningsMap**: One-to-Many (Rosters have multiple earnings mappings)
17. **EarningsMap to EarningsCode**: Many-to-One (Earnings maps reference an earnings code)
18. **EmployeeRoster to BusinessRule**: One-to-Many (Rosters have multiple business rules)
19. **Integration to EmployeeRoster**: One-to-Many (Integrations can manage multiple rosters)

## Encryption

The schema uses encrypted fields for sensitive data:

- `hashed_password` in User
- `azure_blob_config` in Integration
- `connection_parameters` in Application
- `auth_credentials` and `secret_key` in Webhook
- `mfa_secret` and `mfa_recovery_codes` in UserMFA
- `settings` in EmailConfiguration

## Special Features

1. **Multi-tenancy**: Complete tenant isolation with associations to shared resources
2. **Earnings Mapping**: Specialized subsystem for earnings code mapping and transformation
3. **Invitation System**: Complete workflow for inviting and onboarding new users
4. **MFA Security**: Comprehensive multi-factor authentication system
5. **Webhook Notifications**: Event-based integration with external systems
6. **Documentation Analytics**: Tracking of documentation usage for analytics
7. **Business Rules Engine**: Custom rules for earnings calculations and transformations