export async function generateStaticParams() {
  return [{ id: 'fallback' }];
}

export default function MenuItemLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <>{children}</>;
}
