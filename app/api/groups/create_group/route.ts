import { groupsTable } from '@/database/schema';
import { client, db } from '@/lib/dbConnect'
import { NextResponse } from 'next/server';


export const POST = async(request : any) => {

    let groupId;
    try{
        await db.transaction(async (transaction) => {
            const requestData = await request.json();
            const newGroup = {
                name: requestData.name,
            }

            groupId = await transaction.insert(groupsTable).values(newGroup).returning({id : groupsTable.id});
        });
    }
    catch(err){
        return NextResponse.json({message: err}, {status: 400});
    }


    return Response.json({message : groupId}, {status: 201});
}