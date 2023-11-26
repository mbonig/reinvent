import './globals.css'

import TalkingHead from "@/app/TalkingHead";
import Ben from "@/app/images/ben.png";
import Jeremy from "@/app/images/jeremy.png";
import DevDnsDistribution from './resources/DevDns-Distribution-resources.json';
import DevPrimaryDatabase from './resources/DevPrimary-Database-resources.json';
import DevPrimaryMediaTranscoder from './resources/DevPrimary-MediaTranscoder-resources.json';
import DevPrimaryWebsite from './resources/DevPrimary-Website-resources.json';
import ProdPrimaryDatabase from './resources/ProdPrimary-Database-resources.json'
import ProdPrimaryVpc from './resources/ProdPrimary-Vpc-resources.json'
import ProdPrimaryWebsite from './resources/ProdPrimary-Website-resources.json'
import { useElementSize } from "usehooks-ts";

interface TalkingHeadsProps {
  devWords: string[];
  prodWords: string[];
}

export const TalkingHeads = ({ devWords, prodWords }: TalkingHeadsProps) => {

  const [ref, { width, height }] = useElementSize();
  const isPortrait = height > width;
  return <main className="flex min-h-screen flex-col items-center justify-between p-4 relative overflow-x-hidden"
               ref={ref}>
    {isPortrait ? <p>Please turn your phone sideways to landscape mode</p> :
      <>
        <div className="w-full items-center justify-between flex align-middle relative" style={{ maxWidth: '1200px' }}>
          <TalkingHead image={Ben} description="Ben Kehoe" whatSide="left" words={devWords}/>
          <TalkingHead image={Jeremy} description="Jeremy Daly" whatSide="right" words={prodWords}/>
        </div>
        <p>Tap their faces</p>
      </>
    }
  </main>
}

export const getStaticProps = async () => {
  let devWords: string[] = [
    ...DevDnsDistribution.resources,
    ...DevPrimaryDatabase.resources,
    ...DevPrimaryMediaTranscoder.resources,
    ...DevPrimaryWebsite.resources
  ];
  return {
    props: {
      devWords,
      prodWords: [
        ...ProdPrimaryDatabase.resources,
        ...ProdPrimaryVpc.resources,
        ...ProdPrimaryWebsite.resources,
      ]
    }
  }
};

export default TalkingHeads;
