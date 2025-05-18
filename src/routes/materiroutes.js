import express from "express";
import {
  createMateriController,
  getAllMateriController,
  getMateriByIdController,
  updateMateriController,
  deleteMateriController,
} from "../controllers/matericontroller.js";

const router = express.Router();

router.post("/create", createMateriController);
router.get("/show", getAllMateriController);
router.get("/show/:id", getMateriByIdController);
router.put("/update/:id", updateMateriController);
router.delete("/delete/:id", deleteMateriController);

export default router;
