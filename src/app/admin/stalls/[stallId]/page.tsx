// TODO: Stall detail / edit page
interface Props {
  params: Promise<{ stallId: string }>
}

export default async function StallDetailPage({ params }: Props) {
  const { stallId } = await params
  return (
    <div className="min-h-screen bg-[#060a12] text-white flex items-center justify-center">
      <p className="text-[#f7931a]">Stall: {stallId}</p>
    </div>
  )
}
