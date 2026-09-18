import { Request, Response } from 'express';

import {
  getCommodityPrices,
  getCommodityPricesByCommodity,
  getCommodityPricesByDistrict,
} from '../services/commodity-price-service.js';

export async function getCommodityPricesController(
  req: Request,
  res: Response
) {
  try {
    const { commodity, district } = req.query;

    if (commodity && typeof commodity !== 'string') {
      return res.status(400).json({
        message: 'Invalid commodity parameter',
      });
    }

    if (district && typeof district !== 'string') {
      return res.status(400).json({
        message: 'Invalid district parameter',
      });
    }

    let prices;

    if (commodity) {
      prices = await getCommodityPricesByCommodity(commodity);
    } else if (district) {
      prices = await getCommodityPricesByDistrict(district);
    } else {
      prices = await getCommodityPrices();
    }

    return res.status(200).json({
      success: true,
      data: prices,
    });
  } catch (error) {
    console.error('Get commodity prices error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch commodity prices',
    });
  }
}