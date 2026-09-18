// Re-mounted on every navigation: gives each screen a soft entrance.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up flex min-h-full flex-col motion-reduce:animate-none">{children}</div>
}
