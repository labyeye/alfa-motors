// New SQL-only dashboard controller implementation
const { Sequelize } = require("sequelize");
const { SellLetter } = require("../models_sql/SellLetterSQL");
const { ServiceBill } = require("../models_sql/ServiceBillSQL");
const { Rc } = require("../models_sql/RcSQL");
const { Car } = require("../models_sql/CarSQL");
const { sequelize } = require("../db");

const monthNames = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const { formatIndianNumber, formatObjectPrices } = require("../utils/formatIndian");

// Helper: monthly aggregation using saleDate / createdAt
// amountField: which numeric column to SUM (defaults to 'saleAmount')
async function getMonthlyAggregation(model, dateField = 'createdAt', where = {}, amountField = 'saleAmount') {
  try {
    const rows = await model.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col(dateField)), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col(dateField)), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col(amountField)), 'totalAmount'],
      ],
      where,
      group: [Sequelize.fn('YEAR', Sequelize.col(dateField)), Sequelize.fn('MONTH', Sequelize.col(dateField))],
      order: [[Sequelize.fn('YEAR', Sequelize.col(dateField)), 'ASC'], [Sequelize.fn('MONTH', Sequelize.col(dateField)), 'ASC']],
      raw: true,
    });
    return rows.map(r => ({ month: monthNames[Number(r.month) || 0], count: Number(r.count || 0), totalAmount: Number(r.totalAmount || 0) }));
  } catch (err) {
    console.error('Monthly aggregation error:', err);
    return [];
  }
}

async function getRecent(model, where = {}, limit = 3, fields = null) {
  try {
    const rows = await model.findAll({ where, order: [['createdAt', 'DESC']], limit, raw: true });
    if (fields && Array.isArray(fields)) {
      return rows.map(r => fields.reduce((acc, f) => (acc[f] = r[f], acc), {}));
    }
    return rows;
  } catch (err) {
    console.error('getRecent error:', err);
    return [];
  }
}

exports.getOwnerDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // SellLetters created by this owner (createdBy)
    const [totalSellLetters, totalSellValue] = await Promise.all([
      SellLetter.count({ where: { createdBy: ownerId } }).catch(() => 0),
      SellLetter.sum('saleAmount', { where: { createdBy: ownerId } }).catch(() => 0),
    ]);

    const monthlySellData = (await getMonthlyAggregation(SellLetter, 'saleDate', { createdBy: ownerId })) || [];
    const recentSell = (await getRecent(SellLetter, { createdBy: ownerId }, 3)) || [];
    const recentService = (await getRecent(ServiceBill, { createdBy: ownerId }, 3)) || [];

    // Format numeric amounts for API response
    const monthlySellDataFormatted = monthlySellData.map((r) => ({
      ...r,
      totalAmount: formatIndianNumber(Number(r.totalAmount || 0)),
    }));
    const recentSellFormatted = recentSell.map((s) => ({
      ...s,
      saleAmount: s.saleAmount !== undefined && s.saleAmount !== null ? formatIndianNumber(Number(s.saleAmount)) : s.saleAmount,
    }));
    const recentServiceFormatted = recentService.map((s) => ({
      ...s,
      total: s.total !== undefined && s.total !== null ? formatIndianNumber(Number(s.total)) : s.total,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSellLetters: totalSellLetters || 0,
        totalBuyValue: 0,
        totalSellValue: formatIndianNumber(Number(totalSellValue || 0)),
        profit: formatIndianNumber(Number(totalSellValue || 0)),
        ownerName: req.user.name,
        recentTransactions: {
          buy: [],
          sell: recentSellFormatted,
          service: recentServiceFormatted,
        },
        monthlyData: monthlySellDataFormatted,
      },
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Make each DB call resilient — if a table is missing or query fails,
    // return a sensible default instead of throwing so the dashboard can render.
    const [
      totalSellLetters,
      totalSaleValue,
      totalServiceValue,
      monthlySellData,
      monthlyServiceData,
      totalRCs,
      recentSell,
      recentService,
      carStatsArr,
    ] = await Promise.all([
      SellLetter.count().catch(() => 0),
      SellLetter.sum('saleAmount').catch(() => 0),
      // ServiceBill stores total in `total` column
      ServiceBill.sum('total').catch(() => 0),
  getMonthlyAggregation(SellLetter, 'saleDate', {}).catch(() => []),
  // ServiceBill stores totals in `total` column
  getMonthlyAggregation(ServiceBill, 'createdAt', {}, 'total').catch(() => []),
      Rc.count().catch(() => 0),
      getRecent(SellLetter, {}, 3).catch(() => []),
      getRecent(ServiceBill, {}, 3).catch(() => []),
      (async () => {
        try {
          const totalCars = await Car.count().catch(() => 0);
          const soldCars = await Car.count({ where: { status: 'Sold' } }).catch(() => 0);
          const availableCars = await Car.count({ where: { status: 'Available' } }).catch(() => 0);
          return [{ totalCars, soldCars, availableCars }];
        } catch (e) {
          return [{ totalCars: 0, soldCars: 0, availableCars: 0 }];
        }
      })(),
    ]);

    const carData = (carStatsArr && carStatsArr[0]) || { totalCars: 0, soldCars: 0, availableCars: 0 };

    const monthlySellData2 = (monthlySellData || []).map((r) => ({
      ...r,
      totalAmount: formatIndianNumber(Number(r.totalAmount || 0)),
    }));
    const recentSell2 = (recentSell || []).map((s) => ({
      ...s,
      saleAmount: s.saleAmount !== undefined && s.saleAmount !== null ? formatIndianNumber(Number(s.saleAmount)) : s.saleAmount,
    }));
    const recentService2 = (recentService || []).map((s) => ({
      ...s,
      total: s.total !== undefined && s.total !== null ? formatIndianNumber(Number(s.total)) : s.total,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSellLetters: totalSellLetters || 0,
        totalBuyValue: 0,
        totalSellValue: formatIndianNumber(Number(totalSaleValue || 0)),
        profit: formatIndianNumber(Number((totalSaleValue || 0) - (0))),
        recentTransactions: { buy: [], sell: recentSell2 || [], service: recentService2 || [] },
        monthlyData: monthlySellData2,
        carStats: {
          totalCars: carData.totalCars || 0,
          soldCars: carData.soldCars || 0,
          availableCars: carData.availableCars || 0,
          totalRCs: Number(totalRCs || 0),
          rcTransferred: 0,
          rcFeeDone: 0,
          rcFeeReturned: 0,
          rcAvailableToTransfer: 0,
          rcFeeToBeTaken: 0,
        },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};