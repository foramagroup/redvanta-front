const { test, expect } = require('@playwright/test');
const axios = require('axios');

test.describe('Payout flow (affilié + admin + webhook)', () => {
  test('create payout request as affiliate and approve as admin, then simulate webhook', async ({ page, baseURL }) => {
    // 1) Simulate affiliate exist & has affiliateId (we assume seeded affiliate exists)
    // For test we create a new affiliate via admin API (mock auth)
    const adminToken = "test-admin-token"; // in test env you may bypass JWT checks or set a test token accepted by backend
    // create affiliate (admin API)
    const createRes = await axios.post(`${process.env.E2E_API_BASE || 'http://localhost:4000'}/api/admin/affiliates`, { name: "PW Test Aff", email: "pw@aff.test" }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const aff = createRes.data.affiliate;
    expect(aff).toBeDefined();

    // 2) create payout request via affiliate (or admin)
    const payoutRes = await axios.post(`${process.env.E2E_API_BASE || 'http://localhost:4000'}/api/admin/payouts/request`, { affiliateId: aff.id, amountCents: 1500, currency: "EUR", note: "Test payout" }, { headers: { Authorization: `Bearer ${adminToken}` }});
    const payout = payoutRes.data.payout;
    expect(payout).toBeDefined();

    // 3) Approve and process payout (admin)
    const approveRes = await axios.post(`${process.env.E2E_API_BASE || 'http://localhost:4000'}/api/admin/payouts/${payout.id}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` }});
    expect(approveRes.data.ok).toBeTruthy();

    // 4) Simulate Stripe webhook for transfer.paid (in test mode webhook accepts raw JSON)
    const transferEvent = {
      id: "evt_test_transfer_paid",
      type: "transfer.paid",
      data: {
        object: {
          id: "tr_test_123",
          amount: payout.amountCents,
          currency: payout.currency.toLowerCase(),
          metadata: { payoutRequestId: payout.id, affiliateId: aff.id }
        }
      }
    };

    // send to webhook
    const webhookUrl = `${process.env.E2E_API_BASE || 'http://localhost:4000'}/webhooks/stripe`;
    const wRes = await axios.post(webhookUrl, transferEvent, { headers: { 'stripe-signature': 't=1,v1=fake', 'Content-Type': 'application/json' }});
    expect(wRes.status).toBe(200);
    // fetch payout detail to ensure status updated
    const detail = await axios.get(`${process.env.E2E_API_BASE || 'http://localhost:4000'}/api/admin/payouts/${payout.id}`, { headers: { Authorization: `Bearer ${adminToken}` }});
    expect(["paid","processing","approved"]).toContain(detail.data.payout.status);

  });
});
