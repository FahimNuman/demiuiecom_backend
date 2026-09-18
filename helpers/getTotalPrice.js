export const getTotalPrice = (cart) =>
  cart.items.reduce(
    (sum, item) =>
      sum +
      item.colors.reduce(
        (subtotal, color) =>
          subtotal + color.sizes.reduce((sub, size) => sub + size.subtotal, 0),
        0
      ),
    0
  );
// sum + item.sizes.reduce((subtotal, size) => subtotal + size.subtotal, 0), 0;

// cart.items.reduce(
//   (sum, item) =>
//     sum +
//     item.colors.reduce(
//       (subtotal, color) =>
//         subtotal + color.sizes.reduce((sub, size) => sub + size.subtotal, 0),
//       0
//     ),
//   0
// );
// "_id": "676ef1ff5143f796f2d2e168",
// "color_id": "67644b0ce6df5e7c230f254c",
// "size_id": "67644a245b545202ba17fba9",
