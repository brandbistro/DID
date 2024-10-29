# Decentralized Identity (DID) Smart Contract System

A robust, blockchain-based Decentralized Identity system implemented in Clarity smart contracts. This system enables self-sovereign identity management where users maintain complete control over their digital identities and associated claims.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Smart Contract Interface](#smart-contract-interface)
- [Usage Examples](#usage-examples)
- [Security Considerations](#security-considerations)
- [Best Practices](#best-practices)

## Overview

This DID system implements core functionality for decentralized identity management, allowing users to:
- Create and manage their own decentralized identifiers (DIDs)
- Issue and manage verifiable claims
- Transfer identity ownership
- Maintain a verifiable history of identity-related actions

## Features

### Core Features
- **DID Registration**: Create and register new decentralized identifiers
- **Claim Management**: Issue, verify, and revoke claims
- **Identity Transfer**: Transfer DID ownership to new principals
- **Verification System**: Validate claims and their current status
- **Expiration Management**: Automatic handling of claim expiration
- **Revocation Support**: Ability to revoke claims when needed

### Security Features
- Ownership verification for all critical operations
- Immutable history of all identity-related actions
- Time-bound claims with automatic expiration
- Revocation tracking for compromised or outdated claims

## Architecture

### Data Structures

#### DID Registry
```clarity
(define-map dids
    { did: (string-ascii 100) }
    {
        owner: principal,
        created-at: uint,
        updated-at: uint,
        active: bool
    }
)
```

#### Verification Claims
```clarity
(define-map verification-claims
    { 
        did: (string-ascii 100),
        claim-id: uint
    }
    {
        claim-type: (string-ascii 50),
        issuer: principal,
        issued-at: uint,
        expires-at: uint,
        data: (string-ascii 256),
        revoked: bool
    }
)
```

## Getting Started

### Prerequisites
- Clarity CLI tools
- Access to a Stacks blockchain node
- Basic understanding of DID concepts

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd did-system
```

2. Deploy the contract:
```bash
clarinet contract publish did-registry.clar
```

## Smart Contract Interface

### Public Functions

#### Register DID
```clarity
(register-did (did (string-ascii 100)))
```
- Parameters:
    - `did`: The DID string to register
- Returns: (ok true) on success, (err u101) if DID exists

#### Add Claim
```clarity
(add-claim 
    (did (string-ascii 100))
    (claim-type (string-ascii 50))
    (data (string-ascii 256))
    (expires-at uint)
)
```
- Parameters:
    - `did`: Target DID
    - `claim-type`: Type of verification claim
    - `data`: Claim data
    - `expires-at`: Expiration block height
- Returns: (ok uint) with claim ID on success

#### Transfer DID
```clarity
(transfer-did (did (string-ascii 100)) (new-owner principal))
```
- Parameters:
    - `did`: DID to transfer
    - `new-owner`: Principal to transfer ownership to
- Returns: (ok true) on success, (err u100) if not authorized

### Read-Only Functions

#### Get DID Info
```clarity
(get-did-info (did (string-ascii 100)))
```
- Returns: DID details including owner and status

#### Verify Claim
```clarity
(is-claim-valid (did (string-ascii 100)) (claim-id uint))
```
- Returns: Boolean indicating claim validity

## Usage Examples

### Creating a New DID
```clarity
(contract-call? .did-registry register-did "did:stx:example123")
```

### Adding a Verification Claim
```clarity
(contract-call? .did-registry add-claim 
    "did:stx:example123"
    "EmailVerification"
    "email@example.com"
    (+ block-height u50000)
)
```

### Transferring DID Ownership
```clarity
(contract-call? .did-registry transfer-did 
    "did:stx:example123"
    'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
)
```

## Security Considerations

1. **Access Control**
    - Only DID owners can transfer ownership
    - Only claim issuers can revoke their claims
    - All operations verify caller authorization

2. **Data Validation**
    - Input validation for all parameters
    - Strict type checking
    - Proper error handling

3. **Time-Based Security**
    - Claims have explicit expiration times
    - Automatic expiration checking
    - Revocation tracking

## Best Practices

1. **DID Management**
    - Regularly verify DID ownership
    - Monitor active claims
    - Keep private keys secure

2. **Claim Issuance**
    - Set appropriate expiration times
    - Include sufficient claim metadata
    - Verify claim data before issuance

3. **System Integration**
    - Implement proper error handling
    - Cache frequently accessed data
    - Monitor contract events

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information or support, please open an issue in the repository or contact the maintainers.
