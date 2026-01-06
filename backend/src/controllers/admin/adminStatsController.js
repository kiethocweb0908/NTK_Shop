import * as statsService from "../../services/statsService.js";

export const getAdminStats = async (req, res) => {
  try {
    const { filter = "all" } = req.query;

    const { summary, revenueChart, orderStatusData, productByCategory } =
      await statsService.getAdminStats(filter);

    res.json({
      message: `Lấy thống kê theo ${filter} thành công!`,
      summary,
      revenueChart,
      orderStatusData,
      productByCategory,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Không lấy được thống kê" });
  }
};
