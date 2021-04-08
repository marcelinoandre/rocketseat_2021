import { Request, Response } from 'express';
import CreateCourseService from './CreateCourseService';

export function CreateCourse(request: Request, response: Response) {
  CreateCourseService.execute({
    name: 'Python',
    educator: 'Andre FAUZE Marcelino'
  });

  CreateCourseService.execute({
    name: 'Python',
    educator: 'Andre FAUZE Marcelino',
    duration: 30
  });

  return response.send();
}
