import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv"

dotenv.config();
//{ path: "../.env" }


const {PGUSER, PGPASSWORD, PGHOST, PGDATABASE} = process.env;


export const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);



