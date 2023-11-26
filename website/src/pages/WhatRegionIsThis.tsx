export const WhatRegionIsThis = ({region}: {region: string})=>{
  return <p>Hello from the {region} region!</p>
}

export const getServerSideProps = async () => {
  const region = process.env.AWS_REGION;
  return {
    props: {
      region
    }
  }
}


export default WhatRegionIsThis;
