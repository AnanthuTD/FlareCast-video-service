import express from "express";
import  {
  handleTestEvents,
} from "../controllers/eventController";
import compression from "compression";

const router = express.Router();

router.use(compression());

router.get("/get", handleTestEvents);

export default router;
