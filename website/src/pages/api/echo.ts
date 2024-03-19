export default function handler(req: any, res: any) {
  let currentTime = new Date().toISOString();
  res.status(200).json({
    currentServerTime: currentTime
  });
}
