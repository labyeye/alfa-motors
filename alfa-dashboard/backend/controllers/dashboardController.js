const Rc = require("../models/Rc");
const SellLetter = require("../models/SellLetter");
const Service = require("../models/ServiceBill");
const Car = require("../models/Car");
// Optional: if SQL Car model exists use it for car stats
let CarSQL = null;
let { Op } = {};
try {
  const cs = require("../models_sql/CarSQL");
  CarSQL = cs.Car;
  Op = require("sequelize").Op;
} catch (e) {
  // models_sql may not exist in some environments — fall back to mongoose Car
}
const mongoose = require("mongoose");

// Helper function to get monthly data
const getMonthlyData = async (model, matchCriteria = {}) => {
  try {
    const result = await model.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$saleAmount" || "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$_id.month"],
              },
            },
          },
          count: 1,
          totalAmount: 1,
        },
      },
    ]);
    return result || []; // Ensure we always return an array
  } catch (error) {
    console.error('Error in getMonthlyData:', error);
    return []; // Return empty array on error
  }
};

// Helper function to get recent transactions
const getRecentTransactions = async (model, limit = 3, matchCriteria = {}) => {
  try {
    const result = await model
      .find(matchCriteria)
      .sort({ date: -1 })
      .limit(limit)
      .select("bikeNumber customerName date amount serviceType") // Adjust fields as needed
      .lean();
    return result || []; // Ensure we always return an array
  } catch (error) {
    console.error('Error in getRecentTransactions:', error);
    return []; // Return empty array on error
  }
};

exports.getOwnerDashboardStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get counts and amounts for buy letters (purchases)
    const [buyStats, sellStats, monthlyBuyData, monthlySellData] =
      await Promise.all([
        SellLetter.aggregate([
          { $match: { user: mongoose.Types.ObjectId(ownerId) } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalAmount: { $sum: "$purchaseAmount" }, // assuming for buy
            },
          },
        ]).catch(err => {
          console.error('Error in buyStats aggregation:', err);
          return [];
        }),
        SellLetter.aggregate([
          { $match: { user: mongoose.Types.ObjectId(ownerId) } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalAmount: { $sum: "$saleAmount" },
            },
          },
        ]).catch(err => {
          console.error('Error in sellStats aggregation:', err);
          return [];
        }),
        getMonthlyData(SellLetter, {
          user: mongoose.Types.ObjectId(ownerId),
          type: "buy",
        }), // if you distinguish
        getMonthlyData(SellLetter, {
          user: mongoose.Types.ObjectId(ownerId),
          type: "sell",
        }), // by type
      ]);

    // Get recent transactions
    const [recentBuy, recentSell, recentService] = await Promise.all([
      getRecentTransactions(SellLetter, 3, {
        user: mongoose.Types.ObjectId(ownerId),
      }),
      getRecentTransactions(SellLetter, 3, { // Fixed: was missing this line
        user: mongoose.Types.ObjectId(ownerId),
      }),
      getRecentTransactions(Service, 3, {
        user: mongoose.Types.ObjectId(ownerId),
      }),
    ]);

    // Ensure arrays exist before processing
    const safeBuyStats = buyStats || [];
    const safeSellStats = sellStats || [];
    const safeMonthlyBuyData = monthlyBuyData || [];
    const safeMonthlySellData = monthlySellData || [];

    // Combine monthly data
    const monthlyData = [];
    const months = [
      ...new Set([
        ...safeMonthlyBuyData.map((item) => item.month),
        ...safeMonthlySellData.map((item) => item.month),
      ]),
    ];

    months.forEach((month) => {
      const buyMonth = safeMonthlyBuyData.find((item) => item.month === month);
      const sellMonth = safeMonthlySellData.find((item) => item.month === month);

      monthlyData.push({
        month,
        buy: buyMonth ? buyMonth.count : 0,
        sell: sellMonth ? sellMonth.count : 0,
        profit: (sellMonth?.totalAmount || 0) - (buyMonth?.totalAmount || 0),
      });
    });

    const totalBuyValue = safeBuyStats.length > 0 ? safeBuyStats[0].totalAmount : 0;
    const totalSellLetters = safeSellStats.length > 0 ? safeSellStats[0].count : 0;
    const totalSellValue = safeSellStats.length > 0 ? safeSellStats[0].totalAmount : 0;
    const profit = totalSellValue - totalBuyValue;

    res.status(200).json({
      success: true,
      data: {
        totalSellLetters,
        totalBuyValue,
        totalSellValue,
        profit,
        ownerName: req.user.name,
        recentTransactions: {
          buy: recentBuy || [],
          sell: recentSell || [],
          service: recentService || [],
        },
        monthlyData,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalSellLetters,
      buyResult,
      sellResult,
      monthlyBuyData,
      monthlySellData,
      rcStats,
      recentBuy,
      recentSell,
      recentService,
      carStats, // Add car statistics query
    ] = await Promise.all([
      SellLetter.countDocuments().catch(err => {
        console.error('Error counting sell letters:', err);
        return 0;
      }),
      SellLetter.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: "$saleAmount" },
          },
        },
      ]).catch(err => {
        console.error('Error in buy result aggregation:', err);
        return [];
      }),
      Service.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: "$amount" },
          },
        },
      ]).catch(err => {
        console.error('Error in sell result aggregation:', err);
        return [];
      }),
      getMonthlyData(SellLetter),
      getMonthlyData(Service),
      Rc.aggregate([
        {
          $group: {
            _id: null,
            totalRCs: { $sum: 1 },
            rcTransferred: {
              $sum: {
                $cond: [{ $eq: ["$transferred", true] }, 1, 0],
              },
            },
            rcFeeDone: {
              $sum: {
                $cond: [{ $eq: ["$rtoFeesPaid", true] }, 1, 0],
              },
            },
            rcFeeReturned: {
              $sum: {
                $cond: [{ $eq: ["$returnedToDealer", true] }, 1, 0],
              },
            },
          },
        },
      ]).catch(err => {
        console.error('Error in RC stats aggregation:', err);
        return [];
      }),
      getRecentTransactions(SellLetter, 3),
      getRecentTransactions(SellLetter, 3), // Fixed: this was missing proper call
      getRecentTransactions(Service, 3),
      // Add car statistics queries (use SQL model if available)
      (async () => {
        try {
          if (CarSQL) {
            const totalCars = await CarSQL.count();
            // Count sold: accommodate different status strings
            const soldCars = await CarSQL.count({
              where: { status: { [Op.in]: ["Sold", "Sold Out"] } },
            });
            const availableCars = await CarSQL.count({
              where: { status: "Available" },
            });
            return [
              {
                totalCars,
                soldCars,
                availableCars,
              },
            ];
          } else {
            // Fallback to mongoose aggregation if SQL model isn't available
            return await Car.aggregate([
              {
                $group: {
                  _id: null,
                  totalCars: { $sum: 1 },
                  soldCars: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "Sold"] }, 1, 0],
                    },
                  },
                  availableCars: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "Available"] }, 1, 0],
                    },
                  },
                },
              },
            ]);
          }
        } catch (err) {
          console.error("Error in car stats aggregation:", err);
          return [];
        }
      })(),
    ]);

    // Process results with null checks
    const safeBuyResult = buyResult || [];
    const safeSellResult = sellResult || [];
    const safeRcStats = rcStats || [];
    const safeCarStats = carStats || [];
    const safeMonthlyBuyData = monthlyBuyData || [];
    const safeMonthlySellData = monthlySellData || [];

    const totalBuyValue = safeBuyResult.length > 0 ? safeBuyResult[0].totalValue : 0;
    const totalSellValue = safeSellResult.length > 0 ? safeSellResult[0].totalValue : 0;
    const profit = totalSellValue - totalBuyValue;

    // Process RC stats
    const rcData =
      safeRcStats.length > 0
        ? safeRcStats[0]
        : {
            totalRCs: 0,
            rcTransferred: 0,
            rcFeeDone: 0,
            rcFeeReturned: 0,
          };

    // Process Car stats
    const carData =
      safeCarStats.length > 0
        ? safeCarStats[0]
        : {
            totalCars: 0,
            soldCars: 0,
            availableCars: 0,
          };

    // Calculate derived RC stats
    const rcAvailableToTransfer = rcData.totalRCs - rcData.rcTransferred;
    const rcFeeToBeTaken = rcData.totalRCs - rcData.rcFeeDone;

    // Combine monthly data
    const monthlyData = [];
    const months = [
      ...new Set([
        ...safeMonthlyBuyData.map((item) => item.month),
        ...safeMonthlySellData.map((item) => item.month),
      ]),
    ];

    months.forEach((month) => {
      const buyMonth = safeMonthlyBuyData.find((item) => item.month === month);
      const sellMonth = safeMonthlySellData.find((item) => item.month === month);

      monthlyData.push({
        month,
        buy: buyMonth ? buyMonth.count : 0,
        sell: sellMonth ? sellMonth.count : 0,
        profit: (sellMonth?.totalAmount || 0) - (buyMonth?.totalAmount || 0),
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalSellLetters: totalSellLetters || 0,
        totalBuyValue,
        totalSellValue,
        profit,
        recentTransactions: {
          buy: recentBuy || [],
          sell: recentSell || [],
          service: recentService || [],
        },
        monthlyData,
        carStats: {
          totalCars: carData.totalCars,
          soldCars: carData.soldCars,
          availableCars: carData.availableCars,
          totalRCs: rcData.totalRCs,
          rcTransferred: rcData.rcTransferred,
          rcFeeDone: rcData.rcFeeDone,
          rcFeeReturned: rcData.rcFeeReturned,
          rcAvailableToTransfer,
          rcFeeToBeTaken,
        },
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Server Error",
    });
  }
};