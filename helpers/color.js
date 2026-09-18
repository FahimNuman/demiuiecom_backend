import colorModel from "../models/colorModel.js";
export const retrieveAndFormatColors = async (filter = {}) => {
  try {
    // Fetch products based on the provided filter
    const colors = await colorModel.find(filter).populate([
      {
        path: "images",
        select: "_id url",
      },
      
    ]);

    // Format the products
    return colors.map((color) => ({
      _id: color._id,
      name: color.name,
   
      images: color.images || [],
     
      date: color.date,
      __v: color.__v,
    }));
  } catch (error) {
    console.error("Error retrieving or formatting color:", error);
    throw new Error("Failed to retrieve or format color");
  }
};
