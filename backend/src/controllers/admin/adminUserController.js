import User from "../../models/User.js";

export const getAllUserAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sort = "newest" } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const matchStage = {};

    if (role && role !== "all") {
      matchStage.role = role;
    }

    // sắp xếp
    let sortStage = {};

    switch (sort) {
      case "nameAsc":
        sortStage = { name: 1 };
        break;
      case "nameDesc":
        sortStage = { name: -1 };
        break;
      case "oldest":
        sortStage = { createdAt: 1 };
        break;
      case "newest": // "newest"
        sortStage = { createdAt: -1 };
        break;
      default:
        break;
    }

    if (search && search !== "") {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const result = await User.aggregate([
      { $match: matchStage },

      { $sort: sortStage },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNumber }],
          metadata: [{ $count: "totalUsers" }],
        },
      },
    ]);

    const users = result[0].data;
    const totalUsers = result[0].metadata[0]?.totalUsers || 0;
    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.json({
      message: "Lấy users thành công",
      users,
      pagination: {
        totalUsers,
        currentPage: pageNumber,
        totalPages,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllUserAdmin: ", error);
    res.status(500).json({ message: error.message });
  }
};
