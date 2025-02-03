import { Request, Response } from 'express';
import { sendRestResponse } from '../../utils/rest';
import History from './models';
import paginate from '../../utils/pagination';
import { getSystemUserId } from '../../features/serverBot/services';

//region getHistories
export const getHistories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const sortField = (req.query.sortField as string) || 'timestamp';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const includeBot = req.query.includeBot === 'true' ? true : false;
    const search = req.query.search as string; // Search input
    const actionType = req.query.actionType as string; // Filter by actionType
    const entityType = req.query.entityType as string; // Filter by entityType
    const userId = req.query.userId as string; // Filter by user
    const startDate = req.query.startDate as string; // Date range start
    const endDate = req.query.endDate as string; // Date range end

    const filter: any = {};

    if (actionType) filter.actionType = actionType;
    if (entityType) filter.entityType = entityType;
    if (userId) filter.user = userId;

    // Handle search across multiple fields (entityType, actionType, user name)
    if (search) {
      filter.$or = [
        { entityType: { $regex: search, $options: 'i' } },
        { actionType: { $regex: search, $options: 'i' } },
      ];
    }

    // Bot history filter
    if (!includeBot) {
      const systemUserId = await getSystemUserId();
      filter.user = { $ne: systemUserId };
    }

    // Handle date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const paginationOptions = {
      page,
      limit,
      sort: { [sortField]: sortOrder }, // Dynamic sorting
      filter, // Apply filters dynamically
      populate: {
        path: 'user',
        select: 'firstName lastName email',
      },
    };

    const result = await paginate(History, paginationOptions);
    return sendRestResponse({
      status: 200,
      res,
      data: result.data,
      message: 'Histories fetched successfullyd',
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.pages,
        limit: result.limit,
      },
    });
  } catch (err) {
    return sendRestResponse({
      status: 400,
      res,
      message: err.message,
    });
  }
};
