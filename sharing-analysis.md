# Sharing Implementation Analysis

This document outlines the current state of the sharing and permission architecture in the Xcalidraw codebase, comparing it against the desired requirements.

## 1. Domain Hierarchy

**Requirement:** Users -> Orgs -> Teams -> Spaces -> Boards
**Current Implementation:** ✅ **Implemented**

-   **Users & Orgs**: Handled in `TABLE_USERS_ORGS`. Users have specific types (`solo` vs `org`).
-   **Teams**: `TABLE_BOARDS` (Partition: `ORG#{orgId}`, Sort: `TEAM#{teamId}`).
-   **Spaces**: `TABLE_BOARDS` (Partition: `ORG#{orgId}`, Sort: `SPACE#{spaceId}`).
-   **Boards**: `TABLE_BOARDS` (Partition: `ORG#{orgId}`, Sort: `BOARD#{boardId}`).

The hierarchy is fully supported by the current DynamoDB schema.

## 2. Privacy & Visibility

**Requirement:**
-   Teams, Spaces, and Boards can be **Private** or **Public**.
-   Org members should access all Public Teams/Spaces/Boards.

**Current Implementation:** ⚠️ **Partially Implemented**

-   **Data Model**:
    -   `Team`: Has `is_private` flag.
    -   `Space`: Has `is_private` flag.
    -   `Board`: Has `is_private` flag.
-   **Logic**:
    -   The `is_private` flags exist in the database interfaces.
    -   API Lists (`listBoardsInTeam`, `listBoardsInSpace`) filter results:
        ```typescript
        boards = boards.filter(board => !board.is_private || accessibleBoardIds.has(board.board_id));
        ```
    -   **Gap**: The logic for "Auto-access to public teams" is implicit. Currently, `checkAccess` checks for direct permissions or explicit membership keys. It does not appear to have a broad "If team is public, allow all org members" rule implemented in the `checkAccess` function itself, relying instead on the user *joining* the team (creating a membership key) or the list endpoints filtering visibility.

## 3. Board Locking

**Requirement:**
-   Board can be **Locked**.
-   Locked behavior: Read-only for existing elements, but can add comments/new content.

**Current Implementation:** ❌ **Not Implemented**

-   **Schema**: The `Board` interface in `src/api/boards/service.ts` **does not** have an `is_locked` property.
-   **Logic**: There is no enforcement of "Read-only for existing elements" in the backend.

## 4. User Types (Solo vs Org)

**Requirement:**
-   **Solo User**: Default Org, Default Team, limits on creation.
-   **Org User**: Admin management, invites, RBAC.

**Current Implementation:** ✅ **Implemented**

-   **Schema**: `User` has `user_type: 'solo' | 'org'`.
-   **Onboarding**: `onboardUser` creates a default structure for solo users.
-   **Upgrades**: `upgradeSoloToOrg` logic exists to transition users.
-   **Limits**: `createTeam` checks `org.team_limit` (set to 1 for solo users).

## 5. Sharing Methods

**Requirement:**
1.  **Invite by Email**: Specific access (Viewer/Editor).
2.  **Link Sharing**: Public link with specific role.

**Current Implementation:** ✅ **Implemented**

-   **Email Invite**:
    -   Handled by `inviteGuestToBoard` in `permissions/service.ts`.
    -   Creates a `BOARD_KEY` in `TABLE_USERS_ORGS` (User becomes a "member" of the board).
    -   Creates a `Permission` record (`TABLE_PERMISSIONS`).
    -   This is the "Hybrid Approach" referenced in the code, designed for efficient sidebar listing.
-   **Link Sharing (Magic Links)**:
    -   Handled by `createMagicLink` and `validateMagicLink` in `permissions/service.ts`.
    -   Supports `access_level` (`viewer` | `editor`), passwords, and expiration.
    -   **Frontend**: Need to verify if the UI for creating/managing these links is fully exposed in the new Share Dialog.

## 6. RBAC (Permissions)

**Requirement:** Owner, Editor, Viewer roles.

**Current Implementation:** ✅ **Implemented**

-   **Roles**: `Permission` interface supports `'viewer' | 'editor' | 'admin' | 'owner'`.
-   **Check Logic**: `checkAccess` in `permissions/service.ts` resolves access via:
    1.  Direct Permission Table (Explicit grants).
    2.  Resource Ownership.
    3.  Implicit Access (Board/Space/Team Keys existing in user's profile).
    4.  Org Membership (Admins/Owners have blanket access).

## 7. Scalability & Code Quality Assessment

**Status:** 🟡 **Moderate / Good**

-   **Database Pattern (DynamoDB Single Table Design)**: The schema uses single-table design principles effectively (`PK/SK` patterns).
-   **"Hybrid Approach"**: Storing Membership Keys (`BOARD_KEY`) in the User's partition (`TABLE_USERS_ORGS`) is a **highly scalable** choice. It allows fetching the Sidebar (all user resources) in a single fast query (`getSidebarData`), rather than scanning tables.
-   **Red Flag**: The `getResourceDetails` function contains a "TEMPORARY FIX" comment:
    ```typescript
    // TEMPORARY FIX: Return null and rely on direct permission checks
    // TODO: Add a ResourceIndex GSI with resource_id as partition key
    ```
    This means verifying access for a resource ID without knowing its Org ID is inefficient or currently broken (`checkAccess` might fail if `orgId` isn't passed). This needs to be addressed for scalable public link sharing where the Org ID might not be in the URL.
-   **Transactions**: Critical operations (Onboarding, Inviting) use `TransactWriteCommand`, ensuring data integrity.

## Recommendations (What needs to be implemented)

1.  **Implement Board Locking**:
    -   Add `is_locked` boolean to `Board` schema.
    -   Update `updateBoard` handler to check this flag.
    -   If `is_locked` is true, reject updates to *existing* element IDs, but allow adding *new* element IDs (comments).

2.  **Refine Privacy Logic**:
    -   Ensure `checkAccess` explicitly handles the "Public Team/Space" visualization logic so standard org members can access them without needing an explicit invite.

3.  **Admin Settings UI**:
    -   While backend supports user management (`addMember`, `updateMemberRole`), the Frontend likely needs a dedicated "Admin Console" for Org users to manage these roles effectively.

## 8. Magic Link Workflow (Analysis of "How it works now")

**User Scenario:** Nadeem (Solo) shares a board with Savera (No Account) via a Magic Link.

**Current State Analysis:**
-   **Logic Exists**: `createMagicLink` and `validateMagicLink` functions exist in `permissions/service.ts`.
-   **Handlers Exist**: `permissions/handlers.ts` has the API logic.
-   **Configuration Missing**: The handlers are **NOT registered** in `src/api/boards/index.ts`.
-   **Infrastructure Blocker**: `apigateway_http.tf` enforces `JWT` authorization on `ANY /boards/{proxy+}`. This means the API Gateway will **reject** any anonymous request before it reaches the Lambda.

**How it SHOULD work (Implementation Plan):**

1.  **Creation (Authenticated)**:
    -   Nadeem clicks "Share via Link".
    -   Frontend calls `POST /boards/{id}/link`.
    -   This route is covered by the existing `ANY /boards/{proxy+}` with JWT auth.
    -   Backend generates a `token`, stores it in `TABLE_PERMISSIONS`, and returns the URL.

2.  **Validation & Access (Anonymous)**:
    -   **Infrastructure Change**: We MUST add specific routes in **Terraform** (`apigateway_http.tf`) with `authorization_type = "NONE"` to bypass the default JWT check.
        -   `POST /boards/{boardId}/validate-link`
        -   `GET /boards/{boardId}/public` (New endpoint for fetching data with token)
    
    -   **Code Change**:
        -   Register `validateMagicLink` in `index.ts`.
        -   Create a new public handler `getBoardPublic` (or update `getBoard` logic) that accepts a token, validates it using `validateMagicLink` logic, and returns board data if valid.

**Answers to specific questions:**
-   **How would this go through the API Gateway?**:
    -   Currently, it **would not**. It would be blocked (401/403).
    -   We need to explicitly define **Public Routes** in Terraform that overlap with the `boards` Lambda but have `authorization_type = "NONE"`. AWS HTTP API routing uses "most specific match", so defining `/boards/{boardId}/public` will override the wildcard `ANY /boards/{proxy+}` auth setting.

### Proposed Terraform Change
```hcl
# Explicit Public Route (Overrides Wildcard)
resource "aws_apigatewayv2_route" "boards_public_get" {
  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = "GET /boards/{boardId}/public" 
  target             = "integrations/${aws_apigatewayv2_integration.boards_integration.id}"
  authorization_type = "NONE" # No Auth required
}
```
