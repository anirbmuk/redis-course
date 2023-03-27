## REDIS-COURSE
A sample **NodeJS** application with **Redis** cache  

### Installation
- Install **Redis** from https://redis.io/docs/getting-started/  
- Install the dependencies  
```
yarn install
```
- Build the application
```
yarn build
```
- Start the local express server on `http://localhost:3000`  
```
yarn start
```

### Sample API calls
```
GET http://localhost:3000/posts/1
```

> Run the above end-points consecutive times and note the difference in fetch timings. The first request is fetched from the server and the response is cached for 10s. The subsequent request will be faster since it will be fetched from Redis cache, instead of the server.  