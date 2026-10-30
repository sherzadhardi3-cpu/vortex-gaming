'use client';

// VORTEX GAMING — Seamless Order Forwarder to /account/orders/[orderId]

import React, { Suspense, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

function OrderForwarderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = params?.orderId as string;
    if (orderId) {
      const qs = searchParams.toString();
      router.replace(`/account/orders/${encodeURIComponent(orderId)}${qs ? `?${qs}` : ''}`);
    }
  }, [params, searchParams, router]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#07070a] flex items-center justify-center text-white text-xs">
      Redirecting to order details...
    </div>
  );
}

export default function OrderForwarderPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-24 min-h-screen bg-[#07070a] flex items-center justify-center text-white text-xs">
          Loading order...
        </div>
      }
    >
      <OrderForwarderContent />
    </Suspense>
  );
}
