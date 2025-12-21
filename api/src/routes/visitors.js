import { Router } from 'express';
import {
  getVisitors,
  getVisitor,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  addCallStatus,
  updateCallStatus,
  deleteCallStatus,
} from '../controllers/visitorController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v3/testimonies/visitors - Get all visitors
router.get('/visitors', getVisitors);

// GET /api/v3/testimonies/visitors/:id - Get single visitor
router.get('/visitors/:id', getVisitor);

// POST /api/v3/testimonies/visitors - Create visitor
router.post('/visitors', createVisitor);

// PUT /api/v3/testimonies/visitors/:id - Update visitor
router.put('/visitors/:id', updateVisitor);

// DELETE /api/v3/testimonies/visitors/:id - Delete visitor
router.delete('/visitors/:id', deleteVisitor);

// POST /api/v3/testimonies/call-status/:id - Add/Update call status
router.post('/call-status/:id', updateCallStatus);

// DELETE /api/v3/testimonies/call-status/:id/:callStatusId - Delete call status
router.delete('/call-status/:id/:callStatusId', deleteCallStatus);

export default router;
