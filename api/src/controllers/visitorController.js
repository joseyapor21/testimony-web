import { Visitor } from '../models/index.js';

// Get all visitors with pagination
export async function getVisitors(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [visitors, total] = await Promise.all([
      Visitor.find().sort({ created_at: -1 }).skip(skip).limit(limit),
      Visitor.countDocuments()
    ]);

    res.json({
      data: visitors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Get single visitor
export async function getVisitor(req, res) {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    res.json(visitor);
  } catch (error) {
    console.error('Get visitor error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Create visitor
export async function createVisitor(req, res) {
  try {
    const visitor = new Visitor(req.body);
    await visitor.save();
    res.status(201).json(visitor);
  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Update visitor
export async function updateVisitor(req, res) {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    res.json(visitor);
  } catch (error) {
    console.error('Update visitor error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Delete visitor
export async function deleteVisitor(req, res) {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    res.json({ message: 'Visitor deleted successfully.' });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Add call status to visitor
export async function addCallStatus(req, res) {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    // Generate a unique callStatusId
    const newCallStatus = {
      ...req.body,
      callStatusId: req.body.callStatusId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    visitor.callStatusInfo.push(newCallStatus);
    await visitor.save();

    res.status(201).json(visitor);
  } catch (error) {
    console.error('Add call status error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Update call status
export async function updateCallStatus(req, res) {
  try {
    const { id, callStatusId } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    // If callStatusId is provided in params, update that specific status
    if (callStatusId) {
      const statusIndex = visitor.callStatusInfo.findIndex(
        cs => cs.callStatusId === callStatusId
      );

      if (statusIndex === -1) {
        return res.status(404).json({ error: 'Call status not found.' });
      }

      visitor.callStatusInfo[statusIndex] = {
        ...visitor.callStatusInfo[statusIndex],
        ...req.body,
        callStatusId: visitor.callStatusInfo[statusIndex].callStatusId,
      };
    } else {
      // Add new call status or update if callStatusId in body
      if (req.body.callStatusId) {
        const statusIndex = visitor.callStatusInfo.findIndex(
          cs => cs.callStatusId === req.body.callStatusId
        );

        if (statusIndex !== -1) {
          visitor.callStatusInfo[statusIndex] = {
            ...visitor.callStatusInfo[statusIndex],
            ...req.body,
          };
        } else {
          visitor.callStatusInfo.push(req.body);
        }
      } else {
        // Generate new callStatusId for new entries
        const newCallStatus = {
          ...req.body,
          callStatusId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        visitor.callStatusInfo.push(newCallStatus);
      }
    }

    await visitor.save();
    res.json(visitor);
  } catch (error) {
    console.error('Update call status error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

// Delete call status
export async function deleteCallStatus(req, res) {
  try {
    const { id, callStatusId } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    const statusIndex = visitor.callStatusInfo.findIndex(
      cs => cs.callStatusId === callStatusId
    );

    if (statusIndex === -1) {
      return res.status(404).json({ error: 'Call status not found.' });
    }

    visitor.callStatusInfo.splice(statusIndex, 1);
    await visitor.save();

    res.json({ message: 'Call status deleted successfully.' });
  } catch (error) {
    console.error('Delete call status error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}
