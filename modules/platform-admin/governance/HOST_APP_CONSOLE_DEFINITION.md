# Host App / Console Definition (Gate 16)

## 1. System Overview

### 1.1 Host App Definition (Shell / Brand / Container)

The **Host App** is the top-level container (Shell) for the Platform Admin module. It serves as the entry point for authorized users, providing the foundational branding and navigation structure.

- **Role:** Host Application Container.
- **Responsibility:** Access Context, Navigation Structure, Layout Scaffolding.
- **Brand:** "Bassan" (Platform Name), owned by Shavi Company.
- **No Business Logic:** The Host App itself contains NO business logic; it merely hosts the Console.

### 1.2 Console Definition (Admin Surface)

The **Console** is the administrative surface embedded within the Host App. It is the functional area where authorized users perform administrative tasks.

- **Role:** Administrative Dashboard & Management Interface.
- **Scope:** Platform Administration (User Management, Org Management, Monitoring).
- **Constraint:** Docs-Only definition; implementation logic is OUT OF SCOPE.

## 2. User Types (Docs-Only)

### 2.1 Owner (Super Admin)

- **Definition:** The highest-level administrative user with full access to all Platform Admin features.
- **Permissions:** Authorized to manage all organizations, users, system settings, and audit logs.
- **Source:** Defined in existing RBAC governance (consumed here).

### 2.2 Internal Admin

- **Definition:** A support or operational role with scoped access.
- **Permissions:** Authorized for view-only access to critical logs and management of specific subsets of users/orgs.
- **Source:** Defined in existing RBAC governance (consumed here).

## 3. Navigation & Screens Map (Placeholders)

### 3.1 Global Navigation (Shell Level)

- **Top Bar:** User Profile, Notifications (Placeholder), Global Search (Placeholder).
- **Side Bar:** Main Module Navigation.

### 3.2 Screen Hierarchy

1.  **Dashboard (Home)**
    - _Content explicitly Client-Defined and NOT locked here._
2.  **User Management**
    - List Users
    - User Details
3.  **Organization Management**
    - List Organizations
    - Organization Details
4.  **Audit Logs**
    - System Activity (Read-Only)
5.  **Settings**
    - Platform Configuration

## 4. Auth & Integration Boundaries

### 4.1 Authentication Boundary

- **UI Access Principle:** Access is permitted ONLY via approved authorization methods (defined in future gate).
- **Validation Principle:** All access is subject to governance-defined authorization rules.
- **Constraint:** UI is FORBIDDEN from holding Core artifacts. UI is FORBIDDEN from calling Core directly.

### 4.2 Integration Boundary

- **Platform-Admin Module Only:** All console features MUST operate strictly within the `modules/platform-admin` scope.
- **Core Interaction:** Interaction with Core is restricted to strictly defined contracts (`CORE_CONTRACT_V1_EXTRACT.md`).

## 5. Explicit Forbidden Behaviors

- ❌ **Direct Core Access:** The Console UI MUST NOT attempt to fetch data directly from Core APIs.
- ❌ **Exposure of Core Artifacts:** Core artifacts MUST NOT be exposed to the Host App.
- ❌ **Undefined Features:** No "Beta" features or unauthorized modules.
- ❌ **Hardcoded Business Logic:** The Host App MUST remain agnostic to specific client business rules not defined in governance.

## 6. Dashboard Content Statement

> [!IMPORTANT]
> **Dashboard content is client-defined and not locked here.**
> The specific widgets, charts, and KPIs displayed on the Dashboard screen are subject to client requirements and are explicitly excluded from this definition. We define the _slot_ for the dashboard, not the _content_.
