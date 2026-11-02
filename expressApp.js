import express from 'express';

const app = express();
const PORT = 4000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Initialize in-memory array with sample shopping cart items
let cart = [
  {
    id: 1,
    productName: "Wireless Mouse",
    price: 799,
    quantity: 2,
    category: "Electronics"
  },
  {
    id: 2,
    productName: "Mechanical Keyboard",
    price: 2499,
    quantity: 1,
    category: "Electronics"
  },
  {
    id: 3,
    productName: "USB-C Hub",
    price: 1299,
    quantity: 3,
    category: "Accessories"
  }
];

// Helper function to calculate item total price (price * quantity)
const formatProductWithTotal = (item) => ({
  ...item,
  itemTotal: item.price * item.quantity
});

// GET /cart - Retrieve all cart items with calculated item totals
app.get('/cart', (req, res) => {
  const itemsWithTotals = cart.map(formatProductWithTotal);
  res.status(200).json(itemsWithTotals);
});

// GET /cart/:id - Retrieve a specific cart item by ID
app.get('/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID format. ID must be an integer." });
  }

  const product = cart.find(item => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(formatProductWithTotal(product));
});

// POST /cart - Add a new product to the cart
app.post('/cart', (req, res) => {
  const { id, productName, price, quantity, category } = req.body;

  // Validate required fields
  if (
    id === undefined ||
    !productName ||
    price === undefined ||
    quantity === undefined ||
    !category
  ) {
    return res.status(400).json({
      message: "Validation Error: id, productName, price, quantity, and category are all required fields"
    });
  }

  const parsedId = parseInt(id, 10);
  const parsedPrice = Number(price);
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedId) || isNaN(parsedPrice) || isNaN(parsedQuantity)) {
    return res.status(400).json({
      message: "Validation Error: id, price, and quantity must be valid numbers"
    });
  }

  // Check if item with same ID already exists
  const existingProduct = cart.find(item => item.id === parsedId);
  if (existingProduct) {
    return res.status(400).json({
      message: `Product with ID ${parsedId} already exists in the cart`
    });
  }

  const newProduct = {
    id: parsedId,
    productName: productName.trim(),
    price: parsedPrice,
    quantity: parsedQuantity,
    category: category.trim()
  };

  cart.push(newProduct);

  res.status(201).json({
    message: "Product added successfully",
    product: formatProductWithTotal(newProduct)
  });
});

// PUT /cart/:id - Update product details
app.put('/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  const productIndex = cart.findIndex(item => item.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { productName, price, quantity, category } = req.body;

  if (
    productName === undefined &&
    price === undefined &&
    quantity === undefined &&
    category === undefined
  ) {
    return res.status(400).json({
      message: "At least one field (productName, price, quantity, category) must be provided to update"
    });
  }

  if (productName !== undefined) cart[productIndex].productName = productName.trim();
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }
    cart[productIndex].price = parsedPrice;
  }
  if (quantity !== undefined) {
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty)) {
      return res.status(400).json({ message: "Quantity must be a valid number" });
    }
    cart[productIndex].quantity = parsedQty;
  }
  if (category !== undefined) cart[productIndex].category = category.trim();

  res.status(200).json({
    message: "Product updated successfully",
    product: formatProductWithTotal(cart[productIndex])
  });
});

// DELETE /cart/:id - Remove a product from the cart
app.delete('/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  const productIndex = cart.findIndex(item => item.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const removedProduct = cart.splice(productIndex, 1)[0];

  res.status(200).json({
    message: "Product removed successfully",
    product: formatProductWithTotal(removedProduct)
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "404 Not Found: Route does not exist" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});

