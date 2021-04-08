import express, { response } from 'express';
import { CreateCourse } from './routes';

const app = express();

app.get('/', CreateCourse);

app.listen(3333, () => {
  console.log('🚀 Run app in port 3333');
});
