# Application Status State Machine

This document outlines the implementation of a state machine approach for managing application lifecycle states in the TAP Integration Platform.

## State Machine Design

### States

The application lifecycle includes the following states:

1. **DRAFT**
   - Initial state for new applications
   - Application is being configured and is not visible to end users
   - Only administrators can see and edit DRAFT applications

2. **PENDING_REVIEW**
   - Application configuration is complete and awaiting approval
   - Cannot be modified while in this state
   - Reviewers can approve or reject the application

3. **ACTIVE**
   - Application is published and available to authorized users
   - Core functionality is available
   - Can be used in integrations

4. **INACTIVE**
   - Application is temporarily unavailable
   - Existing integrations using this application may be impacted
   - Can be reactivated when needed

5. **DEPRECATED**
   - Application is marked for removal
   - Warning is shown to users
   - Cannot be used in new integrations, but existing ones continue to work

6. **ARCHIVED**
   - Application is no longer available for use
   - Records are maintained for historical purposes
   - All integrations using this application are disabled

### Transitions

Valid state transitions define the allowed paths between states:

| Current State   | Target State      | Trigger Action          | Validation Requirements |
|-----------------|-------------------|-------------------------|-------------------------|
| DRAFT           | PENDING_REVIEW    | Submit for review       | All required fields completed, validation tests pass |
| DRAFT           | ACTIVE            | Direct publish          | All required fields completed, validation tests pass, user has super admin role |
| PENDING_REVIEW  | DRAFT             | Reject                  | Reviewer comments provided |
| PENDING_REVIEW  | ACTIVE            | Approve                 | Reviewer approval recorded |
| ACTIVE          | INACTIVE          | Deactivate              | Reason provided |
| INACTIVE        | ACTIVE            | Reactivate              | None |
| ACTIVE          | DEPRECATED        | Deprecate               | Reason and end-of-life date provided |
| DEPRECATED      | ACTIVE            | Undeprecate             | Super admin approval |
| DEPRECATED      | ARCHIVED          | Archive                 | End-of-life date has passed |
| INACTIVE        | ARCHIVED          | Archive                 | Has been inactive for configured period |
| ARCHIVED        | DRAFT             | Restore                 | Super admin approval, new version number |

### Guards and Side Effects

Each transition includes guards (preconditions that must be met) and side effects (actions that occur upon transition):

#### Guards
- **Submit for review**: All required configuration is complete, validation passes
- **Direct publish**: User has super admin role, all validation passes
- **Approve**: User has reviewer role, no blocking issues
- **Deprecate**: Alternative application is available or reason provided
- **Archive**: All dependent integrations have been migrated or notification acknowledged

#### Side Effects
- **Submit for review**: Notification sent to reviewers
- **Approve/Direct publish**: Version is incremented, publication record created
- **Deactivate**: Notification sent to users of the application
- **Deprecate**: Warning banner added to UI, end-of-life countdown shown
- **Archive**: All associated integrations disabled, notification sent

## Implementation

### State Machine Class

```python
from enum import Enum, auto
from typing import Dict, List, Optional, Callable, Any, Type, Union
from datetime import datetime
from pydantic import BaseModel, Field

class ApplicationStatus(str, Enum):
    """Application lifecycle states"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

class ApplicationAction(str, Enum):
    """Actions that trigger state transitions"""
    SUBMIT_FOR_REVIEW = "submit_for_review"
    APPROVE = "approve"
    REJECT = "reject"
    PUBLISH = "publish"
    DEACTIVATE = "deactivate"
    REACTIVATE = "reactivate"
    DEPRECATE = "deprecate"
    UNDEPRECATE = "undeprecate"
    ARCHIVE = "archive"
    RESTORE = "restore"

class TransitionGuardParams(BaseModel):
    """Parameters for transition guards"""
    application_id: int
    current_user_id: str
    current_user_role: str
    action_params: Dict[str, Any] = Field(default_factory=dict)

class StateMachineError(Exception):
    """Base exception for state machine errors"""
    pass

class InvalidTransitionError(StateMachineError):
    """Exception raised when an invalid transition is attempted"""
    pass

class GuardFailedError(StateMachineError):
    """Exception raised when a transition guard fails"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.details = details or {}

class StateTransition:
    """Defines a transition between states"""
    def __init__(
        self,
        source_state: ApplicationStatus,
        target_state: ApplicationStatus,
        action: ApplicationAction,
        guard: Optional[Callable[[TransitionGuardParams], bool]] = None,
        side_effect: Optional[Callable[[TransitionGuardParams], None]] = None,
        description: str = ""
    ):
        self.source_state = source_state
        self.target_state = target_state
        self.action = action
        self.guard = guard
        self.side_effect = side_effect
        self.description = description
    
    def can_transition(self, params: TransitionGuardParams) -> bool:
        """Check if the transition is allowed based on guard conditions"""
        if self.guard is None:
            return True
        return self.guard(params)
    
    def execute_side_effect(self, params: TransitionGuardParams) -> None:
        """Execute side effects after a successful transition"""
        if self.side_effect is not None:
            self.side_effect(params)

class ApplicationStateMachine:
    """State machine for managing application lifecycle"""
    def __init__(self):
        self.transitions: List[StateTransition] = []
        self._init_transitions()
    
    def _init_transitions(self) -> None:
        """Initialize all valid state transitions"""
        # DRAFT transitions
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.DRAFT,
            target_state=ApplicationStatus.PENDING_REVIEW,
            action=ApplicationAction.SUBMIT_FOR_REVIEW,
            guard=self._guard_validation_complete,
            side_effect=self._effect_notify_reviewers,
            description="Submit application for review"
        ))
        
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.DRAFT,
            target_state=ApplicationStatus.ACTIVE,
            action=ApplicationAction.PUBLISH,
            guard=self._guard_can_direct_publish,
            side_effect=self._effect_publish_application,
            description="Directly publish application (super admin only)"
        ))
        
        # PENDING_REVIEW transitions
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.PENDING_REVIEW,
            target_state=ApplicationStatus.DRAFT,
            action=ApplicationAction.REJECT,
            guard=self._guard_reviewer_role,
            side_effect=self._effect_add_review_comments,
            description="Reject application and return to draft"
        ))
        
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.PENDING_REVIEW,
            target_state=ApplicationStatus.ACTIVE,
            action=ApplicationAction.APPROVE,
            guard=self._guard_reviewer_role,
            side_effect=self._effect_publish_application,
            description="Approve application for publication"
        ))
        
        # ACTIVE transitions
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.ACTIVE,
            target_state=ApplicationStatus.INACTIVE,
            action=ApplicationAction.DEACTIVATE,
            guard=self._guard_reason_provided,
            side_effect=self._effect_notify_users,
            description="Deactivate an active application"
        ))
        
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.ACTIVE,
            target_state=ApplicationStatus.DEPRECATED,
            action=ApplicationAction.DEPRECATE,
            guard=self._guard_deprecation_info,
            side_effect=self._effect_setup_deprecation,
            description="Mark application as deprecated"
        ))
        
        # INACTIVE transitions
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.INACTIVE,
            target_state=ApplicationStatus.ACTIVE,
            action=ApplicationAction.REACTIVATE,
            guard=None,  # No guard needed
            side_effect=self._effect_notify_reactivation,
            description="Reactivate an inactive application"
        ))
        
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.INACTIVE,
            target_state=ApplicationStatus.ARCHIVED,
            action=ApplicationAction.ARCHIVE,
            guard=self._guard_inactive_period,
            side_effect=self._effect_disable_integrations,
            description="Archive an inactive application"
        ))
        
        # DEPRECATED transitions
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.DEPRECATED,
            target_state=ApplicationStatus.ACTIVE,
            action=ApplicationAction.UNDEPRECATE,
            guard=self._guard_super_admin,
            side_effect=self._effect_remove_warnings,
            description="Remove deprecated status (super admin only)"
        ))
        
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.DEPRECATED,
            target_state=ApplicationStatus.ARCHIVED,
            action=ApplicationAction.ARCHIVE,
            guard=self._guard_end_of_life_reached,
            side_effect=self._effect_disable_integrations,
            description="Archive a deprecated application"
        ))
        
        # ARCHIVED transitions
        self.transitions.append(StateTransition(
            source_state=ApplicationStatus.ARCHIVED,
            target_state=ApplicationStatus.DRAFT,
            action=ApplicationAction.RESTORE,
            guard=self._guard_super_admin,
            side_effect=self._effect_restore_application,
            description="Restore archived application to draft (super admin only)"
        ))
    
    def get_available_actions(
        self,
        current_state: ApplicationStatus,
        user_role: str
    ) -> List[ApplicationAction]:
        """Get list of available actions for the current state and user role"""
        actions = []
        
        # Create dummy params to check guards
        dummy_params = TransitionGuardParams(
            application_id=-1,
            current_user_id="",
            current_user_role=user_role,
            action_params={}
        )
        
        for transition in self.transitions:
            if transition.source_state == current_state:
                # If no guard or guard succeeds with minimal params
                if transition.guard is None or (
                    user_role == "super_admin" and 
                    transition.action not in [ApplicationAction.REJECT, ApplicationAction.APPROVE]
                ):
                    actions.append(transition.action)
        
        return actions
    
    def transition(
        self,
        current_state: ApplicationStatus,
        action: ApplicationAction,
        params: TransitionGuardParams
    ) -> ApplicationStatus:
        """
        Execute a state transition if valid
        
        Args:
            current_state: Current application status
            action: The action to perform
            params: Parameters for guards and side effects
            
        Returns:
            The new application status
            
        Raises:
            InvalidTransitionError: If the transition is not valid
            GuardFailedError: If the transition guard fails
        """
        # Find matching transition
        transition = None
        for t in self.transitions:
            if t.source_state == current_state and t.action == action:
                transition = t
                break
        
        if transition is None:
            raise InvalidTransitionError(
                f"Invalid transition: {action.value} from state {current_state.value}"
            )
        
        # Check guard condition
        if not transition.can_transition(params):
            raise GuardFailedError(
                f"Guard failed for transition: {action.value} from {current_state.value} to {transition.target_state.value}",
                {"transition": action.value, "from": current_state.value, "to": transition.target_state.value}
            )
        
        # Execute side effect
        transition.execute_side_effect(params)
        
        # Return new state
        return transition.target_state
    
    # Guard implementations
    def _guard_validation_complete(self, params: TransitionGuardParams) -> bool:
        """Check if all required fields are completed and validation passes"""
        # Implementation would check application data in database
        # and run validation rules
        return True
    
    def _guard_can_direct_publish(self, params: TransitionGuardParams) -> bool:
        """Check if user can directly publish (super admin + validation)"""
        return params.current_user_role == "super_admin" and self._guard_validation_complete(params)
    
    def _guard_reviewer_role(self, params: TransitionGuardParams) -> bool:
        """Check if user has reviewer role"""
        return params.current_user_role in ["super_admin", "admin", "reviewer"]
    
    def _guard_reason_provided(self, params: TransitionGuardParams) -> bool:
        """Check if reason is provided for the action"""
        return "reason" in params.action_params and bool(params.action_params["reason"])
    
    def _guard_deprecation_info(self, params: TransitionGuardParams) -> bool:
        """Check if deprecation info is provided"""
        has_reason = "reason" in params.action_params and bool(params.action_params["reason"])
        has_eol = "end_of_life_date" in params.action_params
        return has_reason and has_eol
    
    def _guard_inactive_period(self, params: TransitionGuardParams) -> bool:
        """Check if application has been inactive for required period"""
        # Implementation would check inactive_since date in database
        return True
    
    def _guard_super_admin(self, params: TransitionGuardParams) -> bool:
        """Check if user has super admin role"""
        return params.current_user_role == "super_admin"
    
    def _guard_end_of_life_reached(self, params: TransitionGuardParams) -> bool:
        """Check if end of life date has been reached"""
        # Implementation would check EOL date in database
        return True
    
    # Side effect implementations
    def _effect_notify_reviewers(self, params: TransitionGuardParams) -> None:
        """Notify reviewers that an application needs review"""
        pass
    
    def _effect_add_review_comments(self, params: TransitionGuardParams) -> None:
        """Add reviewer comments to application"""
        pass
    
    def _effect_publish_application(self, params: TransitionGuardParams) -> None:
        """Publish application and create publication record"""
        pass
    
    def _effect_notify_users(self, params: TransitionGuardParams) -> None:
        """Notify users of application status change"""
        pass
    
    def _effect_setup_deprecation(self, params: TransitionGuardParams) -> None:
        """Setup deprecation warning and end-of-life date"""
        pass
    
    def _effect_notify_reactivation(self, params: TransitionGuardParams) -> None:
        """Notify users of application reactivation"""
        pass
    
    def _effect_disable_integrations(self, params: TransitionGuardParams) -> None:
        """Disable all integrations using this application"""
        pass
    
    def _effect_remove_warnings(self, params: TransitionGuardParams) -> None:
        """Remove deprecation warnings"""
        pass
    
    def _effect_restore_application(self, params: TransitionGuardParams) -> None:
        """Restore application from archived state"""
        pass
```

### State Machine Visualization

```
┌────────┐         submit_for_review         ┌───────────────┐
│        │─────────────────────────────────▶│               │
│        │                                   │               │
│ DRAFT  │                                   │ PENDING_REVIEW│
│        │◀────────────────────────────────│               │
│        │            reject                 │               │
└────────┘                                   └───────────────┘
    │                                                │
    │                                                │
    │                                                │
    │ publish                                        │ approve
    │ (super admin)                                  │
    ▼                                                ▼
┌────────┐            deprecate            ┌───────────────┐
│        │─────────────────────────────────▶│               │
│        │                                   │               │
│ ACTIVE │                                   │  DEPRECATED   │
│        │◀────────────────────────────────│               │
│        │           undeprecate             │               │
└────────┘                                   └───────────────┘
    ▲                                                │
    │                                                │
    │                                                │
    │ reactivate                                     │ end-of-life
    │                                                │ reached
    │                                                ▼
┌────────┐            long inactive        ┌───────────────┐
│        │─────────────────────────────────▶│               │
│        │                                   │               │
│INACTIVE│                                   │   ARCHIVED    │
│        │                                   │               │
│        │                                   │               │
└────────┘                                   └───────────────┘
                                                    │
                                                    │ restore
                                                    │ (super admin)
                                                    │
                                                    ▼
                                                  DRAFT
```

## API Endpoints

To support the state machine, the following new API endpoints will be implemented:

### 1. GET /api/admin/applications/{application_id}/status

Returns the current status and available actions for an application.

#### Response (200 OK)
```json
{
  "application_id": 42,
  "name": "ERP Integration API",
  "current_status": "draft",
  "available_actions": ["submit_for_review", "publish"],
  "status_history": [
    {
      "status": "draft",
      "timestamp": "2025-03-15T10:30:00Z",
      "user": {
        "id": "user-uuid-12345",
        "name": "John Doe"
      },
      "comment": "Initial creation"
    }
  ]
}
```

### 2. POST /api/admin/applications/{application_id}/transition

Executes a state transition action on an application.

#### Request Body
```json
{
  "action": "submit_for_review",
  "params": {
    "comment": "Ready for review",
    "notify_reviewers": true
  }
}
```

#### Response (200 OK)
```json
{
  "application_id": 42,
  "name": "ERP Integration API",
  "previous_status": "draft",
  "current_status": "pending_review",
  "transition_timestamp": "2025-03-30T15:30:00Z",
  "transition_by": {
    "id": "user-uuid-12345",
    "name": "John Doe"
  },
  "available_actions": []
}
```

#### Response (400 Bad Request)
```json
{
  "error": "invalid_transition",
  "message": "Cannot transition from 'draft' to 'active' using action 'deactivate'",
  "details": {
    "current_status": "draft",
    "requested_action": "deactivate",
    "available_actions": ["submit_for_review", "publish"]
  }
}
```

#### Response (403 Forbidden)
```json
{
  "error": "guard_failed",
  "message": "Cannot publish application: validation failed",
  "details": {
    "validation_errors": [
      "Missing required connection parameters: api_url",
      "Authentication configuration is incomplete"
    ]
  }
}
```

## Database Schema Changes

To support the state machine, we'll need to add/modify the following database tables:

### 1. applications
Add new fields:
- `status_history_id`: Foreign key to the latest status history entry

### 2. application_status_history
New table to track status changes:
- `id`: Primary key
- `application_id`: Foreign key to applications table
- `status`: Status enum value
- `previous_status`: Previous status enum value (nullable)
- `changed_at`: Timestamp when status changed
- `changed_by`: User ID who changed the status
- `comment`: Optional comment explaining the change
- `action`: Action that triggered the change
- `params`: JSON object with parameters used in the transition

### 3. application_status_warnings
New table for active warnings on applications:
- `id`: Primary key
- `application_id`: Foreign key to applications table
- `warning_type`: Type of warning (e.g., "deprecation", "maintenance")
- `message`: Warning message
- `start_date`: When warning becomes active
- `end_date`: When warning expires (nullable)
- `severity`: Warning severity level
- `dismissible`: Whether users can dismiss the warning

## Advantages of State Machine Approach

1. **Clear Visualization of Application Lifecycle**
   - The state diagram provides a clear visual representation of the possible application states and transitions
   - Makes it easier to understand and document the application lifecycle

2. **Explicit Validation and Business Rules**
   - Each transition has explicit guard conditions
   - Business rules are centralized and consistently applied

3. **Audit Trail and Traceability**
   - Every state change is recorded with timestamp, user, and reason
   - Complete history of application status changes is maintained

4. **Separation of Concerns**
   - State transitions are decoupled from the API endpoints
   - Business logic is encapsulated in the state machine

5. **Extensibility**
   - New states and transitions can be added without changing existing code
   - Side effects can be enhanced independently

6. **Enhanced Security**
   - Permission checks are built into the state machine
   - Actions are explicitly allowed or denied based on user role

7. **Improved User Experience**
   - Available actions can be dynamically determined
   - Clear feedback on why certain actions are not available

This implementation provides a robust foundation for application lifecycle management with strong validation, clear transitions, and comprehensive audit history.