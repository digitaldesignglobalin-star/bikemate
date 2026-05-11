import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all active products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new product (Admin)
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, mrp, stock, images, variants, description } = req.body;
    
    // Generate a unique slug based on name and timestamp
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category: category || "OTHER",
        price,
        mrp,
        stock,
        images: images || [],
        variants: variants || [],
        description
      }
    });

    res.json({ success: true, product });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
