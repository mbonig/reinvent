import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";


const queryClient = new QueryClient()

export const ServerTime = () => {
  const query = useQuery({
    queryKey: ['getCurrentTime'],
    queryFn: async () => {
      const response = await fetch('/api/echo');
      const data = await response.json();
      return data;
    }
  })

  return <p>Current server time is: {query.isLoading ? 'calculating...' : query.data?.currentServerTime}</p>
}

export const WhatRegionIsThis = ({ region }: { region: string }) => {

  return <>
    <QueryClientProvider client={queryClient}>
      <ServerTime/>
    </QueryClientProvider>
    <p>Hello from the {region} region!</p>
  </>
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
