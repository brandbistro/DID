import { Clarinet, Tx, Chain, Account, types } from 'clarinet';
import { describe, test, expect } from 'vitest';

describe('DID Registry Contract', () => {
  test('register DID successfully', async () => {
    let chain = new Chain();
    let deployer = chain.accounts.get('deployer');
    let wallet1 = chain.accounts.get('wallet_1');
    let did = "did:example:123";
    
    // Register the DID
    let block = chain.mineBlock([
      Tx.contractCall('did-registry', 'register-did', [types.ascii(did)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.ok(true));
    
    // Attempt to register the same DID again, expect ERR-DID-EXISTS
    block = chain.mineBlock([
      Tx.contractCall('did-registry', 'register-did', [types.ascii(did)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.err(types.uint(101)));
  });
  
  test('transfer DID ownership', async () => {
    let chain = new Chain();
    let wallet1 = chain.accounts.get('wallet_1');
    let wallet2 = chain.accounts.get('wallet_2');
    let did = "did:example:456";
    
    // Register a new DID
    chain.mineBlock([
      Tx.contractCall('did-registry', 'register-did', [types.ascii(did)], wallet1.address)
    ]);
    
    // Transfer ownership
    let block = chain.mineBlock([
      Tx.contractCall('did-registry', 'transfer-did', [types.ascii(did), types.principal(wallet2.address)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.ok(true));
    
    // Unauthorized transfer attempt by wallet2 (should fail with ERR-NOT-AUTHORIZED)
    block = chain.mineBlock([
      Tx.contractCall('did-registry', 'transfer-did', [types.ascii(did), types.principal(wallet1.address)], wallet2.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.err(types.uint(100)));
  });
  
  test('add and revoke verification claim', async () => {
    let chain = new Chain();
    let wallet1 = chain.accounts.get('wallet_1');
    let did = "did:example:789";
    let claimType = "email-verification";
    let data = "user@example.com";
    let expiresAt = 5000;
    
    // Register the DID
    chain.mineBlock([
      Tx.contractCall('did-registry', 'register-did', [types.ascii(did)], wallet1.address)
    ]);
    
    // Add a verification claim
    let block = chain.mineBlock([
      Tx.contractCall('did-registry', 'add-claim', [
        types.ascii(did),
        types.ascii(claimType),
        types.ascii(data),
        types.uint(expiresAt)
      ], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.ok(types.uint(0))); // First claim ID should be 0
    
    // Attempt to revoke the claim with the correct issuer
    block = chain.mineBlock([
      Tx.contractCall('did-registry', 'revoke-claim', [types.ascii(did), types.uint(0)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.ok(true));
    
    // Unauthorized revocation attempt (expect ERR-NOT-AUTHORIZED)
    let wallet2 = chain.accounts.get('wallet_2');
    block = chain.mineBlock([
      Tx.contractCall('did-registry', 'revoke-claim', [types.ascii(did), types.uint(0)], wallet2.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.err(types.uint(100)));
  });
  
  test('verify claim validity', async () => {
    let chain = new Chain();
    let wallet1 = chain.accounts.get('wallet_1');
    let did = "did:example:101";
    let claimType = "membership";
    let data = "premium-member";
    let expiresAt = 5000;
    
    // Register the DID
    chain.mineBlock([
      Tx.contractCall('did-registry', 'register-did', [types.ascii(did)], wallet1.address)
    ]);
    
    // Add a claim
    chain.mineBlock([
      Tx.contractCall('did-registry', 'add-claim', [
        types.ascii(did),
        types.ascii(claimType),
        types.ascii(data),
        types.uint(expiresAt)
      ], wallet1.address)
    ]);
    
    // Check claim validity (should be valid)
    let block = chain.mineBlock([
      Tx.contractCall('did-registry', 'is-claim-valid', [types.ascii(did), types.uint(0)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toEqual(types.bool(true));
  });
  
  test('get DID and claim details', async () => {
    let chain = new Chain();
    let wallet1 = chain.accounts.get('wallet_1');
    let did = "did:example:202";
    let claimType = "profile";
    let data = "user-profile";
    let expiresAt = 10000;
    
    // Register the DID
    chain.mineBlock([
      Tx.contractCall('did-registry', 'register-did', [types.ascii(did)], wallet1.address)
    ]);
    
    // Add a claim
    chain.mineBlock([
      Tx.contractCall('did-registry', 'add-claim', [
        types.ascii(did),
        types.ascii(claimType),
        types.ascii(data),
        types.uint(expiresAt)
      ], wallet1.address)
    ]);
    
    // Fetch DID info
    let block = chain.mineBlock([
      Tx.contractCall('did-registry', 'get-did-info', [types.ascii(did)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toMatchObject({
      owner: wallet1.address,
      created-at: types.uint(block.blockHeight),
    updated-at: types.uint(block.blockHeight),
        active: types.bool(true)
  });
    
    // Fetch claim details
    block = chain.mineBlock([
      Tx.contractCall('did-registry', 'get-claim', [types.ascii(did), types.uint(0)], wallet1.address)
    ]);
    
    expect(block.receipts[0].result).toMatchObject({
      claim-type: types.ascii(claimType),
        issuer: wallet1.address,
        data: types.ascii(data),
        revoked: types.bool(false)
  });
  });
});
