import { Note } from '../models/index.js';

// Get notes for a visitor
export async function getNotes(req, res) {
  try {
    const notes = await Note.find({ visitorId: req.params.visitorId })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Add note
export async function addNote(req, res) {
  try {
    const note = new Note({
      visitorId: req.params.visitorId,
      content: req.body.content,
      createdBy: req.body.createdBy || req.user?.name || 'User',
      status: req.body.status,
      metadata: req.body.metadata,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Update note
export async function updateNote(req, res) {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      {
        content: req.body.content,
        status: req.body.status,
        metadata: req.body.metadata,
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Delete note
export async function deleteNote(req, res) {
  try {
    const note = await Note.findByIdAndDelete(req.params.noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}
