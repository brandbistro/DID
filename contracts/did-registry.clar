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
