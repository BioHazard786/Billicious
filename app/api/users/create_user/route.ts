import { usersTable } from '@/database/schema';
import { client, db } from '@/lib/dbConnect'
import { NextResponse } from 'next/server';


export const POST = async(request : any) => {

    let userId;
    try{
        await db.transaction(async (transaction) => {

            const requestData = await request.json();
            const newUser = {
                name: requestData.name,
                username: requestData.username
            }

            userId = await transaction.insert(usersTable).values(newUser).returning({id : usersTable.id});
        });
    }
    catch(err){
        return NextResponse.json({message: err}, {status: 400});
    }


    return Response.json({UserId : userId}, {status: 201});
}