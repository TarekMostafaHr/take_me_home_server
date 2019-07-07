import { Request, Response } from "express";

/**
 * GET /
 * Home page.
 */
export const upload = (req: Request, res: Response) => {
  console.log(req.body)
  if(req.file) {
    res.json(req.file);
}
};
