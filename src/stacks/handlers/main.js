function handler(event) {
  console.log(JSON.stringify(event, null, 2));
  const response = event.response;
  const request = event.request;
  if (/\/api/.test(request.uri)) {
    response.headers['cache-control'] = {value: 'no-cache, no-store, must-revalidate'};
  }

  return event.response;
}
