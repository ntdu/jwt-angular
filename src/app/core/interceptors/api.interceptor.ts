import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // const apiReq = req.clone({ url: `http://localhost:8000/api/v1${req.url}` });
  const apiReq = req.clone({ url: `https://api.realworld.show/api${req.url}` });
  return next(apiReq);
};
