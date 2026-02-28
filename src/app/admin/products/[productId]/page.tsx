// TODO: Product detail / edit page (NIP-15 kind:30018)
interface Props {
  params: Promise<{ productId: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params
  return (
    <div className="min-h-screen bg-[#060a12] text-white flex items-center justify-center">
      <p className="text-[#f7931a]">Product: {productId}</p>
    </div>
  )
}
