import User from '../models/userModal.js'

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



export default {getUsersService,toggleUserStatus}

