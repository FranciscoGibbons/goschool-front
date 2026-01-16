// src/app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
