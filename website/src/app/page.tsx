import Link from "next/link";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col w-full justify-around text-4xl p-8 text-center">

      <p>COM302 | Advanced AWS CDK: Lessons learned from 4 years of use</p>
      <Link href={'/TalkingHeads'}>Tuesday Nov 28th - 12:30pm PDT</Link>
      <a href="https://matthewbonig.sidkik.app" className={"underline"}>My Advanced CDK Course</a>
    </main>
  )
}


