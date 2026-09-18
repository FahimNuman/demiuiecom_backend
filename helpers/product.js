import productModel from "../models/productModel.js";
export const retrieveAndFormatProducts = async (filter = {}) => {
  try {
    const products = await productModel.find(filter).populate([
      {
        path: "images",
        select: "_id url",
      },
      {
        path: "colors._id",
        select: "_id name color_id date images",
        populate: {
          path: "images", // Assuming `images` in color is a reference to an `image` model
          select: "_id url", // Populate the URL of the images
        },
      },
      {
        path: "colors.sizes.size",
        model: "size",
        select: "_id name size_id date",
      },
    ]);

    return products.map((product) => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      sku_id: product.sku_id,
      price: product.price,
      images: product.images || [],
      category: product.category,
      subCategory: product.subCategory,
      colors: product.colors
        .filter((color) => color._id) // Exclude colors with missing `_id`
        .map((color) => ({
          _id: color._id._id,
          name: color._id.name,
          color_id: color._id.color_id,
          images: color._id.images,
          date: color._id.date,
          images: color.images.map((imageEntry) => {
            if (imageEntry.image && imageEntry.cloudImageId) {
              return {
                _id: imageEntry._id,  // Assuming `_id` exists in `imageEntry`
                image: imageEntry.image, // URL or reference
                cloudImageId: imageEntry.cloudImageId,
              };
            }
            console.error("Invalid or unpopulated imageEntry:", imageEntry);
            return null; // Skip invalid entries
          }).filter(Boolean),
          sizes: color.sizes
            .map((sizeEntry) => {
              if (sizeEntry.size && sizeEntry.price !== undefined) {
                return {
                  _id: sizeEntry.size._id,
                  name: sizeEntry.size.name,
                  size_id: sizeEntry.size.size_id,
                  date: sizeEntry.size.date,
                  price: sizeEntry.price,
                  costPrice:sizeEntry.costPrice,
                  quantity:sizeEntry.quantity,
                  lowQuantity:sizeEntry.lowQuantity,
                };
              }
              console.error("Invalid or unpopulated sizeEntry:", sizeEntry);
              return null; // Skip invalid entries
            })
            .filter(Boolean),
        })),
      brand_name: product.brand_name,
      style_id: product.style_id,
      popular: product.popular,
      date: product.date,
      __v: product.__v,
    }));
  } catch (error) {
    console.error("Error retrieving or formatting products:", error);
    throw new Error("Failed to retrieve or format products");
  }
};

