import { Request, Response } from "express";

/**
 * GET /
 * Home page.
 */
export const test = (req: Request, res: Response) => {
  res.send({
    title: "test test"
  });
};
