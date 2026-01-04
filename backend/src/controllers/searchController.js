import * as searchService from "../services/searchService.js";

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        type: "empty",
      });
    }

    const result = await searchService.searchGlobal(q);
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi gọi globalSearch:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
