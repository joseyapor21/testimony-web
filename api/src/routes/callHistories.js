import { Router } from 'express';
import { getCallHistories, addCallHistory, deleteCallHistory } from '../controllers/callHistoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v3/testimonies/call-histories/:visitorId - Get call histories
router.get('/call-histories/:visitorId', getCallHistories);

// POST /api/v3/testimonies/call-histories/:visitorId - Add call history
router.post('/call-histories/:visitorId', addCallHistory);

// DELETE /api/v3/testimonies/call-histories/:visitorId/:historyId - Delete call history
router.delete('/call-histories/:visitorId/:historyId', deleteCallHistory);

export default router;
