import { usersTable } from '@/database/schema';
import { client, db } from '@/lib/dbConnect'
import { NextResponse } from 'next/server';


export const POST = async(request : any) => {

    try{
        await db.transaction(async (transaction) => {

            const requestData = await request.json();
            const newUser = {
                name: requestData.name,
                username: requestData.username
            }

            await transaction.insert(usersTable).values(newUser);
        });
    }
    catch(err){
        return NextResponse.json({message: err}, {status: 400});
    }


    return Response.json({message : "User Created"}, {status: 201});
}