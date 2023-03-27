import express, { json } from 'express';
import { createClient } from 'redis';
import axios, { AxiosError, isAxiosError } from 'axios';

const PREFIX = 'REDIS_TUTORIAL';
const MOCK_SERVER = 'https://jsonplaceholder.typicode.com';

type Post = {
  userId: string;
  id: number;
  title: string;
  body: string;
};

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

const app = express();
app.use(json());

app.post('/', async (req, res) => {
  const { key, value } = req.body;
  const response = await redisClient.set(`${PREFIX}_${key}`, value);
  res.status(204).json(response);
});

app.get<{ key: string }>('/:key', async (req, res) => {
  const { key } = req.params;
  const response = await redisClient.get(`${PREFIX}_${key}`);
  res.status(200).json(response);
});

app.get<{ id: string }>('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const cachedPost = (await redisClient.get(`${PREFIX}_POSTS_${id}`)) as
    | string
    | null;

  if (!id?.trim() || isNaN(+id)) {
    return res
      .status(400)
      .send({ error: 'PostId is either missing or malformed in request body' });
  }

  if (cachedPost) {
    // eslint-disable-next-line no-console
    console.log(`Returning data from cache for id: ${id}`);
    return res.status(200).json(JSON.parse(cachedPost));
  }

  // eslint-disable-next-line no-console
  console.warn(`No data found in cache for id: ${id}, fetching from server`);
  let data = {} as Post;
  try {
    const response = await axios.get<Post>(`${MOCK_SERVER}/posts/${id}`);
    data = response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error(
        `${(error as AxiosError).code} - ${(error as AxiosError).message}`
      );
    }
  } finally {
    await redisClient.set(`${PREFIX}_POSTS_${id}`, JSON.stringify(data), {
      EX: 10
    });
  }
  return res.status(200).json(data);
});

app.listen(3000, async () => {
  await redisClient.connect();
  // eslint-disable-next-line no-console
  console.log('Listening on port 3000');
});
