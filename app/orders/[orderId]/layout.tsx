export async function generateStaticParams() {
  return [{ orderId: 'fallback' }];
}

export default function OrderLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <>{children}</>;
}
