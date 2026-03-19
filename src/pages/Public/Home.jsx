export default function Home(){
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Krootal Review</h1>
      <p className="text-gray-600">Platform to collect and manage reviews, sell NFC cards, affiliates and payouts.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="card">
          <h3 className="font-semibold">For clubs</h3>
          <p className="text-sm text-gray-600">Collect reviews & manage your locations.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold">Affiliate program</h3>
          <p className="text-sm text-gray-600">Track clicks, conversions, payouts.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold">Shop</h3>
          <p className="text-sm text-gray-600">Sell NFC cards and subscriptions.</p>
        </div>
      </div>
    </div>
  );
}
