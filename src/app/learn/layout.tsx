export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hide-footer">{children}</div>;
}
