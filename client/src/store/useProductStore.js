import {create} from "zustand"
import axios from "axios"
import toast from "react-hot-toast";

const BASEURL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "";

export const useProductStore = create((set, get) => ({

    products : [],
    error : null, 
    loading : false,

    formData : {
        name : "",
        price : "",
        image : ""
    },
    currentProduct : null,
    
    setFormData : (formData) => set({formData}),
    resetFormData : () => set({formData : {name : "", price : "", image : ""}}),

    fetchProducts : async() => {
        set({loading : true})
        try {
            const response = await axios.get(`${BASEURL}/api/products`);
            set({products : response.data.data, error : null})

        } catch (error) {
            if(error.status == 429){
                set({error : "Rate limiting!", products : []})
            }else{
                set({error : "Something went wrong!"})
            }
        }finally{
            set({loading : false})
        }
    },

    deleteProducts : async(id) => {
        set({loading : true})
        try {
            await axios.delete(`${BASEURL}/api/products/${id}`);
            set((prev) => ({products : prev.products.filter((product) => product.id !== id)}))
            toast.success("Product deleted successfully");
        } catch (error) {
            console.log("Error in deleteProduct function", error);
            toast.error("Something went wrong");
          } finally {
            set({ loading: false });
          }
        },
        addProduct : async(e) => {

            e.preventDefault()
           
            
            set({loading : true})
            try {
               
                const {formData} = get();
                await axios.post(`${BASEURL}/api/products`, formData);
                await get().fetchProducts();
                get().resetFormData();
                toast.success("Product added successfully");
                document.getElementById("add_product_modal").close();
                
            } catch (error) {
                console.log("Error in addProduct function", error);
                toast.error("Something went wrong");
                
            }finally{
                set({loading : false})
            }
        },

        getProduct : async(id) => {
            set({loading : true})
            try {
                const response = await axios.get(`${BASEURL}/api/products/${id}`);
                const data = response.data.data;
                set({formData : {name : data.name, price : data.price, image : data.image}, currentProduct : response.data.data, error : null});
            } catch (error) {
                console.log("Error in getProduct function", error);
                toast.error("Something went wrong");

            }finally{
                set({loading : false});
            }
        },
        updateProduct : async(id) => {
            
            set({loading : true})

            try {
                const {formData} = get();
                const response = await axios.put(`${BASEURL}/api/products/${id}`, formData);
                set({currentProduct : response.data.data,})
                toast.success("Product updated successfully")
            } catch (error) {
                console.log("Error in updated function", error);
                toast.error("Something went wrong");
            }finally{
                set({loading : false})
            }
        }
})
)