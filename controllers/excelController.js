
import productModel from '../models/productModel.js';
import xlsx from 'xlsx';


// Assuming you have a 'sizeModel' defined in the models
import sizeModel from '../models/sizeModel.js';

import colorModel from '../models/colorModel.js';
import imageModel from '../models/imageModel.js';

export const uploadExcelOld = async (req, res) => {
  try {
    // Validate file existence
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('File uploaded:', filePath);

    // Read the Excel file using the XLSX package
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Parse the sheet data into a JSON array

    console.log('Parsed Excel data:', sheetData);

    const products = sheetData.map(async (row) => {
      // Extract and map data from the row based on your Excel columns
      const colorData = row['colors (_id)'] ? row['colors (_id)'].split(',') : [];
      const sizeData = row['size_price'] ? row['size_price'].split(',') : [];

      const sizes = await Promise.all(sizeData.map(async (sizePrice) => {
        const [sizeName, price] = sizePrice.split(':').map(s => s.trim());

        // Find the size ObjectId (replace `sizeName` with your actual logic to fetch the size)
        const size = await sizeModel.findOne({ name: sizeName });

        return {
          size: size ? size._id : null, // Use the ObjectId from size model
          price: parseFloat(price),
        };
      }));

      // Convert image strings into ObjectId objects
      const imageIds = row.images ? row.images.split(',').map(image => ObjectId(image.trim())) : [];

      return {
        name: row.name || null,
        description: row.description || null,
        sku: row.sku || null,
        sku_id: row.sku_id || null,
        price: row.price || 0,
        images: imageIds, // Store ObjectId references in images
        category: row.category || null,
        subCategory: row.subCategory || null,
        colors: colorData.map(colorId => ({
          _id: colorId,  // Assuming color IDs are provided directly
          sizes,
        })),
        brand_name: row.brand_name || null,
        style_id: row.style_id || null,
        popular: row.popular || false,
        date: row.date || Date.now(),
      };
    });

    // Wait for all product promises to resolve
    const resolvedProducts = await Promise.all(products);

    // Insert the products into the database
    await productModel.insertMany(resolvedProducts);

    res.status(200).json({ message: 'Products uploaded successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing the Excel file' });
  }
};


async function getColorImages(item) {
  let colorImages = {};

  if (item?.color_images) {
      const colorImagePromises = item.color_images.split(";").map(async (item) => {
          let [color, images] = item.split("=");

          let imageInfoArray = await Promise.all(
              images.split(",").map(async (imageId) => {
                  let imageInfo = await imageModel.findById(imageId);
                  return {
                      image: imageInfo?.url || null,
                      cloudImageId: "1",
                  };
              })
          );

          colorImages[color.toLowerCase()] = imageInfoArray;
      });

      await Promise.all(colorImagePromises);
  }

  return colorImages;
}


export const uploadExcel = async (req, res) => {

  try {
    const fileBuffer = req.body;

    if (!fileBuffer || !fileBuffer.length) {
      return res.status(400).send({ success: false, message: 'No file uploaded' });
    }

    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const excelData = xlsx.utils.sheet_to_json(worksheet);

    excelData.forEach(async (item) => {
      let colorImages = await getColorImages(item);

      let imageArray = item?.images ? item?.images.split(",").map(item => item.trim()) : [];

      let sizeArray = item?.size ? item?.size.split(";").map(item => item.trim()) : [];

      sizeArray = sizeArray.map((item) => {
        const [colorName, priceData] = item.split(":");
    
        return {
          colorName: colorName.trim(), // Store name temporarily
          attribute: priceData.split(",").map(priceItem => {
            const [size, value] = priceItem.split("=");
            return { sizeName: size.trim(), price: parseFloat(value) };
          })
        };
      });

      // Fetch colors and sizes from the database
      const colors = await colorModel.find();
      const sizes = await sizeModel.find();

      // Create lookup objects for quick ID access
      const colorMap = colors.reduce((acc, cur) => ({ ...acc, [cur.name]: cur._id }), {});
      const sizeMap = sizes.reduce((acc, cur) => ({ ...acc, [cur.name]: cur._id }), {});

      const updatedSizeArray = sizeArray.map((item) => ({
        color: {
          _id: colorMap[item.colorName] || null,
          name: item.colorName
        }, 
        attribute: item.attribute.map(attr => ({
          size: {
            _id: sizeMap[attr.sizeName] || null,
            name: attr.sizeName
          }, 
          price: attr.price
        }))
      }));


      let attributeItems = JSON.stringify(updatedSizeArray, null, 2)
      attributeItems = JSON.parse(attributeItems); 

      let aa = attributeItems.map((attItem) => {
        return {
          _id: attItem?.color?._id,
          images: colorImages[attItem.color.name.toLowerCase()] || [],
          sizes: attItem?.attribute.map((att) => ({
            size: att?.size?._id,
            price: Number(att?.price),
          })),
        };
      });

      // console.log("updatedSizeArray", aa[0].images);
      // process.exit();

      // let aaa = attributeItems.map((attItem) => {
      //   let AttItem = {
      //     _id: attItem?.color._id,


      //     sizes: attItem?.attribute.map((att) => ({
      //       size: att.size._id,
      //       price: Number(att?.price),
      //     }))
      //   }

      //   return AttItem;
      // });

      try {
        // const colors = JSON.parse(item?.colors || "[]");
        const productData = {
          name: item?.name,
          description: item?.description,
          sku: item?.sku,
          sku_id: item?.sku_id,
          price: Number(item?.price),
          images: imageArray || [],
          category: item?.category,
          subCategory: item?.subCategory,
          brand_name: item?.brand_name,
          style_id: item?.style_id,
          popular: item?.popular === "true",
          colors: aa || [],
          date: item?.date ? new Date(item.date).getTime() : Date.now(),
        };
        
        const product = new productModel(productData);
        await product.save();
      } catch (err) {
        console.error(`Failed to process item: ${item?.name}, Error: ${err.message}`);
      }
    });
    
    res.status(201).json({
      success: true,
      message: "Excel File Upload successfully",
    });

  } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: 'Error processing file' });
  }

  
  
};


export const getList = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching product list:', error);
    res.status(500).json({ success: false, message: 'Error fetching product list' });
  }
};


