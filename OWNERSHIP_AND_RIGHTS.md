# Ownership and Rights

## Platform Information

**Platform Name:** Bassan  
**Owner:** Shavi Company  
**Effective Date:** 2026-01-27  
**All Rights Reserved © Shavi Company**

---

## Scope of Ownership

This document establishes ownership and rights for the Bassan platform and its associated components, including but not limited to:

- **Architecture**: System design, architectural patterns, component structure, and integration models
- **Governance Framework**: Governance documents, policies, procedures, gate systems, and compliance frameworks
- **Documentation**: Technical documentation, specifications, implementation plans, and operational guides
- **Source Code**: All source code, scripts, configurations, and related artifacts
- **Derived Works**: Any modifications, extensions, or derivative works based on the above
- **Operational Models**: Deployment strategies, operational procedures, and system management approaches

### Platform Components

**Bassan.os Core:**  
The Core layer is treated as a black-box, immutable foundation. All Core components, interfaces, and internal implementations are proprietary and confidential.

**Suite Layer:**  
The Suite layer is a proprietary control-plane layer built on top of Bassan.os Core. It includes all BFF (Backend-for-Frontend) components, UI applications, Suite-specific databases, and integration adapters. The Suite layer and all its governance, architecture, and implementation are proprietary to Shavi Company.

**Core Access Constraints:**  
All Core access is strictly server-only via the BFF layer. UI applications MUST NOT call Core directly under any circumstances. Core service tokens MUST NOT be exposed to UI or client-side code. This architectural boundary is a fundamental security invariant of the platform.

---

## Rights Declaration

**All Rights Reserved.**

All components listed in the Scope of Ownership are the exclusive property of Shavi Company. No rights are granted to any third party except as explicitly authorized in writing by Shavi Company.

---

## Restrictions

The following activities are **strictly prohibited** without explicit written authorization from Shavi Company:

1. **Reproduction**: Copying, duplicating, or reproducing any part of the platform, its architecture, governance framework, documentation, or source code.

2. **Redistribution**: Distributing, sharing, publishing, or making available any part of the platform to third parties.

3. **Commercial Use**: Using any part of the platform, its architecture, governance framework, documentation, or source code for commercial purposes.

4. **Derivative Works**: Creating modifications, extensions, or derivative works based on the platform without authorization.

5. **Reverse Engineering**: Attempting to reverse engineer, decompile, or extract proprietary information from the platform.

---

## Authorization Process

Any request for authorization to use, reproduce, redistribute, or create derivative works must be submitted in writing to Shavi Company and must include:

- Detailed description of the intended use
- Scope and duration of the requested authorization
- Commercial or non-commercial nature of the use
- Any other relevant information

Authorization will be granted at the sole discretion of Shavi Company.

---

## Contact Information

For authorization requests or questions regarding ownership and rights:

**Shavi Company**  
Email: [To be provided]  
Address: [To be provided]

---

## Disclaimer

This document is not a legal contract but serves as a clear statement of ownership and rights. Shavi Company reserves the right to enforce its ownership rights through all available legal means.

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-27  
**Status:** ACTIVE
