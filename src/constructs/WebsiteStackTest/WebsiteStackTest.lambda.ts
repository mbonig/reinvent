declare var fetch: (url: string) => Promise<void>;
export const URL = 'URL';

export const handler = async () => {
  await fetch(process.env[URL]!);
};


