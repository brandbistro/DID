;; did-registry.clar
;; Main registry contract for DIDs

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-DID-EXISTS (err u101))
(define-constant ERR-DID-NOT-FOUND (err u102))
(define-constant ERR-INVALID-CLAIM (err u103))

;; Data structure for storing DIDs
(define-map dids
    { did: (string-ascii 100) }
    {
        owner: principal,
        created-at: uint,
        updated-at: uint,
        active: bool
    }
)

;; Data structure for verification claims
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

;; Counter for claim IDs
(define-data-var claim-id-counter uint u0)

;; Register a new DID
(define-public (register-did (did (string-ascii 100)))
    (let ((caller tx-sender))
        (if (is-none (map-get? dids {did: did}))
            (begin
                (map-set dids
                    {did: did}
                    {
                        owner: caller,
                        created-at: block-height,
                        updated-at: block-height,
                        active: true
                    }
                )
                (ok true)
            )
            ERR-DID-EXISTS
        )
    )
)


;; Update DID ownership
(define-public (transfer-did (did (string-ascii 100)) (new-owner principal))
    (let ((did-data (unwrap! (map-get? dids {did: did}) ERR-DID-NOT-FOUND)))
        (if (is-eq tx-sender (get owner did-data))
            (begin
                (map-set dids
                    {did: did}
                    {
                        owner: new-owner,
                        created-at: (get created-at did-data),
                        updated-at: block-height,
                        active: true
                    }
                )
                (ok true)
            )
            ERR-NOT-AUTHORIZED
        )
    )
)

;; Add a verification claim
(define-public (add-claim
    (did (string-ascii 100))
    (claim-type (string-ascii 50))
    (data (string-ascii 256))
    (expires-at uint)
)
    (let (
        (caller tx-sender)
        (current-claim-id (var-get claim-id-counter))
    )
        (var-set claim-id-counter (+ current-claim-id u1))
        (map-set verification-claims
            {
                did: did,
                claim-id: current-claim-id
            }
            {
                claim-type: claim-type,
                issuer: caller,
                issued-at: block-height,
                expires-at: expires-at,
                data: data,
                revoked: false
            }
        )
        (ok current-claim-id)
    )
)

;; Revoke a verification claim
(define-public (revoke-claim (did (string-ascii 100)) (claim-id uint))
    (let (
        (claim (unwrap! (map-get? verification-claims {did: did, claim-id: claim-id}) ERR-INVALID-CLAIM))
    )
        (if (is-eq tx-sender (get issuer claim))
            (begin
                (map-set verification-claims
                    {did: did, claim-id: claim-id}
                    (merge claim {revoked: true})
                )
                (ok true)
            )
            ERR-NOT-AUTHORIZED
        )
    )
)

;; Read-only functions

;; Get DID details
(define-read-only (get-did-info (did (string-ascii 100)))
    (map-get? dids {did: did})
)

;; Get claim details
(define-read-only (get-claim (did (string-ascii 100)) (claim-id uint))
    (map-get? verification-claims {did: did, claim-id: claim-id})
)

;; Verify if a claim is valid
(define-read-only (is-claim-valid (did (string-ascii 100)) (claim-id uint))
    (let ((claim (unwrap! (map-get? verification-claims {did: did, claim-id: claim-id}) false)))
        (and
            (not (get revoked claim))
            (>= (get expires-at claim) block-height)
        )
    )
)
