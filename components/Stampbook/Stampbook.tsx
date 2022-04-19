interface IStampProps {
  id: number
  body: string
  createdBy: string
  updatedAt: string
}

export default function StampbookComponent({
  stamps,
}: {
  stamps: IStampProps[]
}) {
  console.log(stamps)
  return <div>i am stampbook comp hehe</div>
}
