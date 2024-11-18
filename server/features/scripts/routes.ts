// scripts/routes.ts
import express from 'express';
import {
  createScript,
  getAllScripts,
  getScriptById,
  updateScript,
  deleteScript,
  testScript,
} from './controllers';
import { authenticate, authorize } from '../../middleware/authMiddleware';

const router = express.Router();

// Route to create a new script (Admin only)
router.post('/', authenticate, authorize, createScript);

// Route to get all scripts (Admin only)
router.get('/', authenticate, authorize, getAllScripts);

// Route to get a single script by ID (Admin only)
router.get('/:id', authenticate, authorize, getScriptById);

// Route to update a script by ID (Admin only)
router.put('/:id', authenticate, authorize, updateScript);

// Route to delete a script by ID (Admin only)
router.delete('/:id', authenticate, authorize, deleteScript);

// Route to test a script
router.post('/:id/test', authenticate, authorize, testScript);

export default router;
