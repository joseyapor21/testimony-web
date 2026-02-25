import { Visitor } from '../models/index.js';

// Transform raw document to frontend format
function transformVisitor(doc) {
  return {
    id: doc._id,
    _id: doc._id,
    photo: doc.photo || '',
    personalInfo: doc.personalInfo || {},
    appointmentInfo: doc.appointment ? {
      departureDate: doc.appointment.departureDate || '',
      departureTime: doc.appointment.departureTime || '',
      interviewDate: doc.appointment.interviewDate || '',
      prayerDate: doc.appointment.prayerDate || '',
    } : {},
    medicalInfo: doc.medicalInfo || {},
    interview: doc.interview || {},
    status: doc.status || [],
    statusNotes: doc.statusNotes || {},
    metadata: doc.metadata || {},
    callStatuses: doc.callStatusInfo || [],
  };
}

// Parse date string in various formats to Date object
function parseDateString(dateStr) {
  if (!dateStr) return null;

  // Try ISO format (yyyy-MM-dd or full ISO)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Try MM/dd/yyyy format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

// Build filter query from request params
function buildFilterQuery(query) {
  const filter = {};

  // Search query (name, phone)
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { 'personalInfo.firstName': searchRegex },
      { 'personalInfo.lastName': searchRegex },
      { 'personalInfo.phone': searchRegex },
    ];
  }

  // Evangelist name filter
  if (query.evangelistName) {
    filter['callStatusInfo.evangelistName'] = new RegExp(query.evangelistName, 'i');
  }

  // Call status filter
  if (query.callStatus) {
    filter['callStatusInfo.callStatus'] = new RegExp(`^${query.callStatus}$`, 'i');
  }

  // Follow up only
  if (query.followUpOnly === 'true') {
    filter['callStatusInfo.followUp'] = true;
  }

  // Has testimony only
  if (query.hasTestimonyOnly === 'true') {
    filter['callStatusInfo.hasTestimony'] = true;
  }

  return filter;
}

// Build date filter for aggregation pipeline
function buildDateFilter(query) {
  if (!query.dateFrom && !query.dateTo) return null;

  const dateField = {
    prayer: '$appointment.prayerDate',
    interview: '$appointment.interviewDate',
    call: { $arrayElemAt: ['$callStatusInfo.dateOfCall', 0] },
    testimony: { $arrayElemAt: ['$callStatusInfo.dateOfTestimony', 0] },
  }[query.dateType] || '$appointment.prayerDate';

  const conditions = [];

  // Parse the date field - handle both MM/dd/yyyy and yyyy-MM-dd formats
  const parsedDate = {
    $cond: {
      if: { $regexMatch: { input: dateField, regex: /^\d{4}-\d{2}-\d{2}/ } },
      then: { $dateFromString: { dateString: dateField, onError: null, onNull: null } },
      else: {
        $dateFromString: {
          dateString: dateField,
          format: '%m/%d/%Y',
          onError: null,
          onNull: null
        }
      }
    }
  };

  if (query.dateFrom) {
    const fromDate = new Date(query.dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    conditions.push({ $gte: [parsedDate, fromDate] });
  }

  if (query.dateTo) {
    const toDate = new Date(query.dateTo);
    toDate.setHours(23, 59, 59, 999);
    conditions.push({ $lte: [parsedDate, toDate] });
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

// Get all visitors with pagination
export async function getVisitors(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = buildFilterQuery(req.query);
    const dateFilter = buildDateFilter(req.query);
    const hasFilters = Object.keys(filter).length > 0 || dateFilter;

    let visitors, total;

    if (dateFilter) {
      // Use aggregation for date filtering
      const pipeline = [];

      // Match basic filters first
      if (Object.keys(filter).length > 0) {
        pipeline.push({ $match: filter });
      }

      // Add date filter
      pipeline.push({ $match: { $expr: dateFilter } });

      // Get total count
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Visitor.aggregate(countPipeline);
      total = countResult[0]?.total || 0;

      // Add sort, skip, limit
      pipeline.push({ $sort: { created_at: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      visitors = await Visitor.aggregate(pipeline);
    } else {
      // Use regular find for non-date queries
      [visitors, total] = await Promise.all([
        Visitor.find(filter)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        hasFilters ? Visitor.countDocuments(filter) : Visitor.estimatedDocumentCount()
      ]);
    }

    res.json({
      data: visitors.map(transformVisitor),
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
