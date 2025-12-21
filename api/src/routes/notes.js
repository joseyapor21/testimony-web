import { Router } from 'express';
import { getNotes, addNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v3/testimonies/notes/:visitorId - Get notes for visitor
router.get('/notes/:visitorId', getNotes);

// POST /api/v3/testimonies/notes/:visitorId - Add note
router.post('/notes/:visitorId', addNote);

// PUT /api/v3/testimonies/notes/:visitorId/:noteId - Update note
router.put('/notes/:visitorId/:noteId', updateNote);

// DELETE /api/v3/testimonies/notes/:visitorId/:noteId - Delete note
router.delete('/notes/:visitorId/:noteId', deleteNote);

export default router;
