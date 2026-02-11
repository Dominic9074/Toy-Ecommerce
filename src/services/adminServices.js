import User from '../models/userModal.js'

const getUsersService = async (search, page = 1, limit = 10) => {

  const skip = (page - 1) * limit;

  let query = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };
  }

  const users = await User.find(query)
    .select("name email status createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments(query);

  return {
    users,
    totalUsers
  };
};

const toggleUserStatus=async (id,newStatus)=>{
    await User.updateOne({ _id: id },{ $set: { status: newStatus }});
}


export default {getUsersService,toggleUserStatus}

