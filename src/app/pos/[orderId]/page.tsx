// TODO: Order detail / payment status page
interface Props {
  params: Promise<{ orderId: string }>
}

export default async function OrderPage({ params }: Props) {
  const { orderId } = await params
  return (
    <div className="min-h-screen bg-[#060a12] text-white flex items-center justify-center">
      <p className="text-[#f7931a]">Order: {orderId}</p>
    </div>
  )
}
