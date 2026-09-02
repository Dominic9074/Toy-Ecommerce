import User from '../models/userModal.js'
import Order from '../models/orderSchema.js';
import Product from '../models/productSchema.js';

const getUsersService = async (search, page = 1, limit = 10,status) => {

  const skip = (page - 1) * limit;


  let query = {};
  if (status === "blocked") {
  query.status = "blocked";
  }
  if (status === "active") {
    query.status = "active";
  }


  if (search) {
    query.$or= [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
  }

  const users = await User.find(query)
    .select("name email status createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments(query);
  const totalPages = totalUsers/10;

  return {
    users,
    totalUsers,
    totalPages
  };
};

const toggleUserStatus=async (id,newStatus)=>{
    await User.updateOne({ _id: id },{ $set: { status: newStatus }});
}

const getSalesInformation=async (filter,startDate,endDate)=>{

  const getDateFilter = (filter) => {
        const now = new Date();
        if(filter === 'week'){
            const date = new Date();
            date.setDate(now.getDate() - 7);
            return { $gte: date };
        }
        if(filter === 'month') return { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        if(filter === 'year') return { $gte: new Date(now.getFullYear(), 0, 1) };
        if(filter === 'custom' && startDate && endDate){
            return {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }
        return null;
    }

       const dateFilter = getDateFilter(filter);
        const matchStage = {
            orderStatus: { $ne: 'Cancelled' },
            ...(dateFilter && { createdAt: dateFilter })
        };

const stats = await Order.aggregate([
    { $match: matchStage },
    {
        $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 },
            totalDelivered: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] } }  // ✅ added
        }
    }
]);

const totalRevenue = Math.round(stats[0]?.totalRevenue || 0);
const totalOrders = stats[0]?.totalOrders || 0;
const totalDelivered = stats[0]?.totalDelivered || 0;  // ✅ added
const deliveryRate = totalOrders ? ((totalDelivered / totalOrders) * 100).toFixed(0) : 0;  // ✅ added

const bestSeller = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
        $group: {
            _id: '$items.name',
            totalSold: { $sum: '$items.quantity' }
        }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 1 }
]);

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const monthlyStats = await Order.aggregate([
    { $match: matchStage },  // ✅ use matchStage instead of hardcoded year
    {
        $group: {
            _id: { $month: '$createdAt' },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$finalAmount' }
        }
    }
]);

// map all 12 months, fill 0 for empty months
const monthlyBreakdown = monthNames.map((month, index) => {
    const found = monthlyStats.find(m => m._id === index + 1);
    return {
        month,
        totalOrders: found?.totalOrders || 0,
        totalRevenue: Math.round(found?.totalRevenue || 0)
    };
});

const bestSellingProduct = bestSeller[0] || null;
const bestProduct = await Product.findOne({ name: bestSellingProduct });
const bestSellingProductShortName = bestProduct.shortName;
return { totalRevenue, totalOrders, deliveryRate, bestSellingProductShortName,monthlyBreakdown};
} 

const getDashboardInfo=async ()=>{
    const totalProduct=await Product.find().countDocuments();
    const startOfToday=new Date();
    startOfToday.setHours(0,0,0,0);
    const todaysOrder=await Order.find({createdAt:{$gte:startOfToday}}).countDocuments();
    const todaysRevenue=await Order.aggregate([{$match:{createdAt:{$gte:startOfToday}}},{$group:{_id:null,totalRevenue:{$sum:'$finalAmount'}}}])
    const totalUsers=await User.find().countDocuments();
    if(todaysRevenue.length===0){
        todaysRevenue.push({totalRevenue:0})
    }
    return {totalProduct,todaysOrder,todaysRevenue,totalUsers}
}  

const getChartData = async (filter) => {
    let groupBy, labels;

    if (filter === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        groupBy = {
            $match: { createdAt: { $gte: startOfWeek } }
        };
    } else if (filter === 'month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        groupBy = {
            $match: { createdAt: { $gte: startOfMonth } }
        };
    } else {
        // year is default
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        groupBy = {
            $match: { createdAt: { $gte: startOfYear } }
        };
    }

        const ordersData = await Order.aggregate([
        groupBy,
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: filter === 'week' ? { $dayOfWeek: '$createdAt' }
                    : filter === 'month' ? { $ceil: { $divide: [{ $dayOfMonth: '$createdAt' }, 7] } }  // fix
                    : { $month: '$createdAt' },
                totalOrders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const data = labels.map((_, index) => {
        const found = ordersData.find(r => r._id === index + 1);
        return found ? found.totalOrders : 0;  
    });

    return { labels, data };
};

const getStockData = async () => {
    const stockData = await Product.aggregate([
        {
            $group: {
                _id: null,
                inStock: { $sum: { $cond: [{ $gt: ['$stock', 10] }, 1, 0] } },
                lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] } },
                outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
            }
        }
    ]);

    return {
        labels: ['In Stock', 'Low Stock', 'Out Of Stock'],
        data: [
            stockData[0]?.inStock || 0,
            stockData[0]?.lowStock || 0,
            stockData[0]?.outOfStock || 0
        ]
    };
};

export default {getUsersService,toggleUserStatus,getSalesInformation,getDashboardInfo,getChartData,getStockData}

