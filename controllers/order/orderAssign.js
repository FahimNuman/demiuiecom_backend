import orderModel from "../../models/orderModel.js";


export const orderAssign = async (req, res) => {
    console.log("orderAssign:;", req.body);
    const userIds = req.body.userId;
    const orderIds = req.body.orderIds;

    // TODO: Login assigner id rakte hobe
    try {
        const updatedOrders = await orderModel.updateMany(
            { _id: { $in: orderIds } },
            { 
                $push: { assignedTo: { $each: userIds } }, 
                $set: { status: "assigned" }
            }
        );

        if (updatedOrders.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching orders found for assignment",
            });
        }

        res.json({
            success: true,
            message: `${updatedOrders.modifiedCount} order(s) assigned successfully`,
        });
    } catch (error) {
        console.error("Error assigning orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign orders",
        })
    }
};
