import { CallHistory } from '../models/index.js';

// Get call histories for a visitor
export async function getCallHistories(req, res) {
  try {
    const histories = await CallHistory.find({ visitorId: req.params.visitorId })
      .sort({ date: -1 });
    res.json(histories);
  } catch (error) {
    console.error('Get call histories error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Add call history
export async function addCallHistory(req, res) {
  try {
    const history = new CallHistory({
      visitorId: req.params.visitorId,
      date: req.body.date || new Date(),
      notes: req.body.notes,
      status: req.body.status,
    });

    await history.save();
    res.status(201).json(history);
  } catch (error) {
    console.error('Add call history error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Delete call history
export async function deleteCallHistory(req, res) {
  try {
    const history = await CallHistory.findByIdAndDelete(req.params.historyId);

    if (!history) {
      return res.status(404).json({ error: 'Call history not found.' });
    }

    res.json({ message: 'Call history deleted successfully.' });
  } catch (error) {
    console.error('Delete call history error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}
