
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { usersTable } from '../database/schema';



// Disable prefetch as it is not supported for "Transaction" pool mode



export function displayUsers() : void{

  try{
    const connectionString = process.env.DATABASE_URL;
    if(connectionString != null){
      const client = postgres(connectionString, { prepare: false });
      const db = drizzle(client);
      const allUsers = db.select().from(usersTable);
      console.log(allUsers);
      
    }
  
  }catch (error) {
      console.error("Database connection failed:", error);
  }

  
}

        

// import mongoose from "mongoose";

// export async function dbConnect(): Promise<void> {
//   // Check if we have a connection to the database or if it's currently connecting
//   if (mongoose.connections[0].readyState) {
//     console.log("Already connected to the database");
//     return;
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI || "", {});
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection failed:", error);

//     // Graceful exit in case of a connection error
//     process.exit(1);
//   }
// }
