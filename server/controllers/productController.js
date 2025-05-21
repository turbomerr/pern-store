import { sql } from "../config/db.js"

export const getAllProducts = async (req, res) => {
    try {
        const products = await sql`
        SELECT * FROM products
        ORDER BY created_at DESC
        `
        console.log("fetched products,", products)
        res.status(200).json({ success: true, data: products })
    } catch (error) {
        console.log("Error in getProducts function", error);
        res.status(500).json({ success: false, message: "Internal Fetching Error" });
    }
}

export const createProduct = async (req, res) => {

    const { name, price, image } = req.body;
    if (!name || !price || !image) {
        return res.status(400).json({ success: false, message: "All fields are required!" })
    }

    try {
        const newProduct = await sql`
            INSERT INTO products (name, image, price)
            VALUES (${name}, ${image}, ${price})
            RETURNING *
        `;
        res.status(201).json({ success: true, data: newProduct[0] });
    } catch (error) {
        console.log("Error in createProduct function", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const getProduct = async(req, res) => {
    const {id} = req.params;

    try {
        const product = await sql `
        SELECT * FROM products WHERE id=${id}
        `;
        res.status(200).json({success : true, data : product[0]})
    } catch (error) {
        console.log("Error in getProduct function ", error);
        res.status(500).json({success : false, message : "Internal Server Error"})
    }

}
export const updateProduct = async(req, res) => {
    const {id} = req.params;
    const {name, image, price} = req.body;

    try {
        const updatedProduct = await sql `
            UPDATE products
            SET name=${name},image=${image}, price=${price} 
            WHERE id=${id} RETURNING *
        `;
        if(updatedProduct.length === 0){
            return res.status(404).json({
                success : false, 
                message : "Product not found!"
            })
        }
        res.status(200).json({success : true, data : updatedProduct[0],message : "Product successfully updated!"})
    } catch (error) {
        console.log("Error in updatedProduct function", error);
        res.status(500).json({success : false, message : "Internel Server Error"})
    }
}

export const deleteProduct = async(req, res) => {
    const {id} = req.params;

    try {
        //RETURNING * ifadesi, UPDATE (veya INSERT/DELETE) işlemi sonucunda:
        //Etki edilen (değiştirilen) satır veya satırları — güncel halleriyle geri döndürür.
        const deletedProduct = await sql `
            DELETE FROM products WHERE id=${id} RETURNING *
        `;
        if (deletedProduct.length === 0) {
            return res.status(404).json({
              success: false,
              message: "Product not found",
            });
        }
        res.status(200).json({success : true, data : deletedProduct[0], message : "Product deleted successfully!"})
    } catch (error) {
        console.log("Error in deleting Product", error);
        res.status(500).json({success : false, message : "Internel Server Error"})
    }
}